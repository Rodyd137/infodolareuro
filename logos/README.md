# Logos de las entidades (Bartelo · Divisas)

- `logos/<código>.png`: logo para fondo claro, cuando el banco no está en el almacén de Supabase.
- `logos/oscuro/<código>.png`: versión para modo oscuro, sin placa blanca. Lo negro pasa a blanco y los azules y verdes oscuros se aclaran sin cambiar de tono.

El código es el `bank_code` de `fx_rates`. La app los recibe por la vista `tasas_directas` (`logo_url`, `logo_url_oscuro`).
