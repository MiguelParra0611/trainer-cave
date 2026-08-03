-- Optional custom collectible-card artwork per Pokémon, uploaded via
-- the seed script into the product-images bucket under cards/.
-- Falls back to the plain stat-card design when null.
alter table pokemon add column card_image_path text;
