-- Columnas para metadatos NVR en conexiones_red
ALTER TABLE conexiones_red
  ADD COLUMN IF NOT EXISTS numero_nvr INTEGER,
  ADD COLUMN IF NOT EXISTS nvr_puerto TEXT;
