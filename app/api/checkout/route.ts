import { NextResponse } from "next/server";
import { PRODUCT_SELECT, toProductWithRelations, type RawProductRow } from "@/lib/product-select";
import { createClient } from "@/lib/supabase/server";

type CheckoutRequestItem = { productId: string; quantity: number };

export async function POST(request: Request) {
  const body = (await request.json()) as { items?: CheckoutRequestItem[] };
  const requestedItems = (body.items ?? []).filter(
    (item) => item.productId && item.quantity > 0,
  );

  if (requestedItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
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
    return NextResponse.json({ error: productsError.message }, { status: 500 });
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
    return NextResponse.json({ error: "No valid products in cart" }, { status: 400 });
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
    return NextResponse.json(
      { error: orderError?.message ?? "Could not create order" },
      { status: 500 },
    );
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
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
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
