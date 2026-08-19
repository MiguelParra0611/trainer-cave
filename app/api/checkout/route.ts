import { NextResponse } from "next/server";
import { PRODUCT_SELECT, toProductWithRelations, type RawProductRow } from "@/lib/product-select";
import { createClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/lib/storage";

type CheckoutRequestItem = { productId: string; quantity: number };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_QUANTITY_PER_ITEM = 100;

/** Type/format/range-checks each cart line before it ever reaches a query —
 * rejects malformed ids and unreasonable or non-integer quantities instead
 * of trusting whatever JSON the client sent. */
function parseCheckoutItems(body: unknown): CheckoutRequestItem[] {
  if (!body || typeof body !== "object" || !Array.isArray((body as { items?: unknown }).items)) {
    return [];
  }
  const items = (body as { items: unknown[] }).items;
  const parsed: CheckoutRequestItem[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const { productId, quantity } = raw as { productId?: unknown; quantity?: unknown };
    if (typeof productId !== "string" || !UUID_RE.test(productId)) continue;
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > MAX_QUANTITY_PER_ITEM
    ) {
      continue;
    }
    parsed.push({ productId, quantity });
  }
  return parsed;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const requestedItems = parseCheckoutItems(body);

  if (requestedItems.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  const supabase = await createClient();

  const productIds = requestedItems.map((item) => item.productId);
  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", productIds)
    .eq("is_active", true)
    .returns<RawProductRow[]>();

  if (productsError) {
    // Log the real DB error server-side only — the raw Postgres/PostgREST
    // message can name tables, columns or constraints and shouldn't be
    // handed to the client.
    console.error("checkout: products lookup failed", productsError);
    return NextResponse.json({ error: "No se pudo procesar el pedido" }, { status: 500 });
  }

  const products = (productRows ?? []).map(toProductWithRelations);
  const productById = new Map(products.map((p) => [p.id, p]));

  // Prices/quantities are recomputed here from the database, never trusted
  // from the client — this is the real backend write the fake checkout exists to demonstrate.
  const orderItems = requestedItems
    .map((item) => {
      const product = productById.get(item.productId);
      if (!product) return null;
      return { product, quantity: item.quantity };
    })
    .filter((row): row is { product: (typeof products)[number]; quantity: number } => row !== null);

  if (orderItems.length === 0) {
    return NextResponse.json({ error: "No hay productos válidos en el carrito" }, { status: 400 });
  }

  const totalCents = orderItems.reduce(
    (sum, { product, quantity }) => sum + product.price_cents * quantity,
    0,
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user?.id ?? null, total_cents: totalCents })
    .select("id, created_at")
    .single();

  if (orderError || !order) {
    console.error("checkout: order insert failed", orderError);
    return NextResponse.json({ error: "No se pudo crear el pedido" }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItems.map(({ product, quantity }) => ({
      order_id: order.id,
      product_id: product.id,
      quantity,
      unit_price_cents: product.price_cents,
    })),
  );

  if (itemsError) {
    console.error("checkout: order_items insert failed", itemsError);
    return NextResponse.json({ error: "No se pudo completar el pedido" }, { status: 500 });
  }

  return NextResponse.json({
    orderId: order.id,
    createdAt: order.created_at,
    totalCents,
    currency: orderItems[0].product.currency,
    items: orderItems.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      quantity,
      unitPriceCents: product.price_cents,
      pokemon: {
        name: product.pokemon.name,
        spriteUrl: product.pokemon.sprite_url,
        cardImageUrl: product.pokemon.card_image_path
          ? productImageUrl(product.pokemon.card_image_path)
          : null,
        hp: product.pokemon.hp,
        attack: product.pokemon.attack,
        defense: product.pokemon.defense,
        special_attack: product.pokemon.special_attack,
        special_defense: product.pokemon.special_defense,
        speed: product.pokemon.speed,
      },
    })),
  });
}
