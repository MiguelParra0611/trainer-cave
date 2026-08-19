-- Security audit finding (checklist item 16 "Restrict file uploads"):
-- the product-images bucket had no file_size_limit or allowed_mime_types,
-- so anything an admin's browser session could be tricked into uploading
-- (e.g. via a compromised admin session or XSS) would be accepted and
-- served back publicly with whatever content-type was sent. Upload access
-- was already admin-only (see 0005_storage_bucket.sql), so this is
-- defense-in-depth, not a fix for an open upload endpoint.
--
-- Mirrors the client-side check added in components/admin/ProductForm.tsx.
-- Applied directly to the live project on 2026-08-18 (low risk: strictly
-- narrows what's accepted, cannot break any existing stored object).
update storage.buckets
set file_size_limit = 5242880, -- 5 MB
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
where id = 'product-images';
