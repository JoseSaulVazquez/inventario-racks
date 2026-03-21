/**
 * Rack dinámico por rackId (persiste en localStorage).
 * - El admin puede editar `totalU` y la lista de componentes añadidos.
 * - La compactación se hace de arriba hacia abajo preservando el orden:
 *   1) componentes base del mockData (ordenados por posicionInicio desc)
 *   2) componentes añadidos por el admin (orden de alta)
 */

export const DYNAMIC_MIN_COMPONENTE_ID = 10000

const CATALOG_FAMILIAS = {
  Fibra: [{ nombre: "Fibra", alturaU: 1, numPuertos: 14 }],
  "Patch Panel": [
    { nombre: "Patch Panel 24p", alturaU: 1, numPuertos: 24 },
    { nombre: "Patch Panel 48p", alturaU: 1, numPuertos: 48 },
  ],
  Switch: [
    { nombre: "Switch 16p", alturaU: 1, numPuertos: 18 },
    { nombre: "Switch 24p", alturaU: 1, numPuertos: 26 },
    { nombre: "Switch Linksys 24p", alturaU: 1, numPuertos: 24 },
  ],
  Otros: [{ nombre: "Componente POE 9p", alturaU: 1, numPuertos: 9 }],
}

const KEY_NEXT_ID = "inventario-rackDynamic-next-comp-id"
const KEY_RACKS_INDEX = "inventario-rackDynamic-racks-index"
const KEY_HIDDEN_BASE_PREFIX = "inventario-rackDynamic-hidden-base-"

// Migración desde el formato anterior de Caseta 2.
// Antes: inventario-caseta2-totalU / inventario-caseta2-items / inventario-caseta2-next-comp-id
const KEY_OLD_TOTAL = "inventario-caseta2-totalU"
const KEY_OLD_ITEMS = "inventario-caseta2-items"
const KEY_OLD_NEXT_ID = "inventario-caseta2-next-comp-id"

function migrateCaseta2IfNeeded(rackId) {
  if (Number(rackId) !== 17) return

  try {
    // Si ya hay datos nuevos, no migramos.
    const hasNewItems = !!localStorage.getItem(keyItems(rackId))
    if (hasNewItems) return
    const oldItemsRaw = localStorage.getItem(KEY_OLD_ITEMS)
    if (!oldItemsRaw) return

    const oldTotalRaw = localStorage.getItem(KEY_OLD_TOTAL)
    const oldItems = JSON.parse(oldItemsRaw)
    const normalizedItems = Array.isArray(oldItems)
      ? oldItems.map((it) => ({ ...it, rackId: 17 }))
      : []

    if (oldTotalRaw != null) {
      const n = Number(JSON.parse(oldTotalRaw))
      const u = Number.isFinite(n) && n > 0 ? Math.min(200, Math.floor(n)) : 42
      saveRackDynamicTotalU(17, u)
    }

    saveRackDynamicItems(17, normalizedItems)

    const oldNext = localStorage.getItem(KEY_OLD_NEXT_ID)
    if (oldNext != null) {
      // KEY_NEXT_ID guarda el próximo id a usar (la migración preserva ese número)
      localStorage.setItem(KEY_NEXT_ID, oldNext)
    }
  } catch (_) {
    // ignore
  }
}

function keyTotalU(rackId) {
  return `inventario-rackDynamic-totalU-${rackId}`
}
function keyItems(rackId) {
  return `inventario-rackDynamic-items-${rackId}`
}

function keyHiddenBase(rackId) {
  return `${KEY_HIDDEN_BASE_PREFIX}${rackId}`
}

export { CATALOG_FAMILIAS }

/** Misma regla que mockData: switches sin 2 LAN salvo Linksys 24p. */
export function cantidadPuertosDispositivo(nombre, numPuertos) {
  const nl = String(nombre || "").toLowerCase()
  const esSwitch = nl.includes("switch")
  const esLinksys = esSwitch && nl.includes("linksys") && nl.includes("24")
  let c = numPuertos ?? 24
  if (esSwitch && !esLinksys) c = Math.max(0, c - 2)
  return c
}

export function loadRackDynamicTotalU(rackId, defaultTotalU) {
  migrateCaseta2IfNeeded(rackId)
  try {
    const raw = localStorage.getItem(keyTotalU(rackId))
    if (raw == null) return defaultTotalU
    const n = Number(JSON.parse(raw))
    return Number.isFinite(n) && n > 0 ? Math.min(200, Math.floor(n)) : defaultTotalU
  } catch {
    return defaultTotalU
  }
}

export function saveRackDynamicTotalU(rackId, totalU) {
  const u = Math.min(200, Math.max(1, Math.floor(Number(totalU) || 42)))
  localStorage.setItem(keyTotalU(rackId), JSON.stringify(u))
}

export function loadRackDynamicItems(rackId) {
  migrateCaseta2IfNeeded(rackId)
  try {
    const raw = localStorage.getItem(keyItems(rackId))
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function loadRackDynamicHiddenBaseIds(rackId) {
  try {
    const raw = localStorage.getItem(keyHiddenBase(rackId))
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.map((n) => Number(n)).filter((n) => Number.isFinite(n)) : []
  } catch {
    return []
  }
}

export function saveRackDynamicHiddenBaseIds(rackId, ids) {
  const next = Array.isArray(ids) ? ids.map((n) => Number(n)).filter((n) => Number.isFinite(n)) : []
  localStorage.setItem(keyHiddenBase(rackId), JSON.stringify(next))
}

export function hideRackBaseComponent(rackId, componenteId) {
  const id = Number(componenteId)
  if (!Number.isFinite(id)) return
  const current = loadRackDynamicHiddenBaseIds(rackId)
  if (current.includes(id)) return
  saveRackDynamicHiddenBaseIds(rackId, [...current, id])
}

export function saveRackDynamicItems(rackId, items) {
  localStorage.setItem(keyItems(rackId), JSON.stringify(items))
  // mantener índice de racks con layout dinámico
  try {
    const raw = localStorage.getItem(KEY_RACKS_INDEX)
    const arr = raw ? JSON.parse(raw) : []
    const next = Array.isArray(arr) ? new Set(arr) : new Set()
    next.add(Number(rackId))
    localStorage.setItem(KEY_RACKS_INDEX, JSON.stringify(Array.from(next)))
  } catch (_) {}
}

function allocateCompId() {
  let stored = DYNAMIC_MIN_COMPONENTE_ID
  try {
    const raw = localStorage.getItem(KEY_NEXT_ID)
    if (raw != null) stored = Number(JSON.parse(raw))
  } catch {
    /* ignore */
  }
  const next = Math.max(DYNAMIC_MIN_COMPONENTE_ID, Math.floor(stored))
  localStorage.setItem(KEY_NEXT_ID, JSON.stringify(next + 1))
  return next
}

export function sumAlturaItems(items) {
  return items.reduce((s, it) => s + (it.alturaU ?? 1), 0)
}

export function compactComponentesPositions(totalU, itemsInOrder, rackId) {
  let top = totalU
  return itemsInOrder.map((it) => {
    const alt = it.alturaU ?? 1
    const pos = top
    top -= alt
    return {
      ...it,
      rackId,
      posicionInicio: pos,
      alturaU: alt,
    }
  })
}

function getBaseComponentesOrdenados(baseComponentes) {
  return [...(baseComponentes || [])].sort((a, b) => b.posicionInicio - a.posicionInicio)
}

export function getRackResolvedComponentes(rackId, baseComponentes, defaultTotalU) {
  const totalU = loadRackDynamicTotalU(rackId, defaultTotalU)
  const hiddenBaseIds = new Set(loadRackDynamicHiddenBaseIds(rackId))
  const baseFiltrados = (baseComponentes || []).filter((c) => !hiddenBaseIds.has(Number(c.id)))
  const baseOrdenados = getBaseComponentesOrdenados(baseFiltrados)
  const dynamicItems = loadRackDynamicItems(rackId)
  const order = [...baseOrdenados, ...dynamicItems]
  return compactComponentesPositions(totalU, order, rackId)
}

export function getDynamicOnlyComponentesResolved(rackId, defaultTotalU, baseComponentes) {
  const all = getRackResolvedComponentes(rackId, baseComponentes, defaultTotalU)
  return all.filter((c) => Number(c.id) >= DYNAMIC_MIN_COMPONENTE_ID)
}

export function setRackDynamicTotalUIfFits(rackId, newTotalU, baseComponentes, defaultTotalU) {
  const baseSum = sumAlturaItems(baseComponentes || [])
  const dynamicItems = loadRackDynamicItems(rackId)
  const dynamicSum = sumAlturaItems(dynamicItems)
  const u = Math.min(200, Math.max(1, Math.floor(Number(newTotalU) || defaultTotalU || 42)))

  if (baseSum + dynamicSum > u) {
    return {
      ok: false,
      error: "Los componentes actuales ocupan más U. Quita equipos o sube el total.",
    }
  }

  saveRackDynamicTotalU(rackId, u)
  return { ok: true }
}

export function addRackDynamicFromTemplate(rackId, template, baseComponentes, defaultTotalU) {
  const totalU = loadRackDynamicTotalU(rackId, defaultTotalU)
  const items = loadRackDynamicItems(rackId)
  const alt = template.alturaU ?? 1

  const baseSum = sumAlturaItems(baseComponentes || [])
  const dynamicSum = sumAlturaItems(items)
  if (baseSum + dynamicSum + alt > totalU) {
    return {
      ok: false,
      error: "No cabe más altura U en el rack. Aumenta el total U o quita equipos.",
    }
  }

  const id = allocateCompId()
  const nextItems = [
    ...items,
    {
      id,
      nombre: template.nombre,
      alturaU: alt,
      numPuertos: template.numPuertos,
      rackId,
    },
  ]
  saveRackDynamicItems(rackId, nextItems)
  return { ok: true }
}

export function removeRackDynamicItem(rackId, componenteId) {
  const id = Number(componenteId)
  const items = loadRackDynamicItems(rackId).filter((it) => Number(it.id) !== id)
  saveRackDynamicItems(rackId, items)
}

