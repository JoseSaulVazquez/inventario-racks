-- Ejecutar si aún no existe la columna (ajusta tipo si en tu BD es integer, etc.)
ALTER TABLE conexiones_red
  ADD COLUMN IF NOT EXISTS poe_puerto TEXT;
