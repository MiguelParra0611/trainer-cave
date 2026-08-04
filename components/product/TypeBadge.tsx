import { translateType } from "@/lib/pokemon-type-labels";

export function TypeBadge({
  name,
  colorHex,
}: {
  name: string;
  colorHex: string | null;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize text-white"
      style={{ backgroundColor: colorHex ?? "#71717a" }}
    >
      {translateType(name)}
    </span>
  );
}
