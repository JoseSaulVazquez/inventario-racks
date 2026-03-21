/** Rack dinámico Caseta 2 (configurable por admin, persiste en localStorage). */

export const CASETA2_RACK_ID = 17
export const CASETA2_MIN_COMPONENTE_ID = 10000

const KEY_TOTAL = "inventario-caseta2-totalU"
const KEY_ITEMS = "inventario-caseta2-items"
const KEY_NEXT_ID = "inventario-caseta2-next-comp-id"

/** Catálogo por familia para el panel de administración */
export const CATALOGO_CASETA2_FAMILIAS = {
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

/** Misma regla que mockData: switches sin 2 LAN salvo Linksys 24p */
export function cantidadPuertosDispositivo(nombre, numPuertos) {
  const nl = String(nombre || "").toLowerCase()
  const esSwitch = nl.includes("switch")
  const esLinksys = esSwitch && nl.includes("linksys") && nl.includes("24")
  let c = numPuertos ?? 24
  if (esSwitch && !esLinksys) c = Math.max(0, c - 2)
  return c
}

export function loadCaseta2TotalU() {
  try {
    const v = localStorage.getItem(KEY_TOTAL)
    if (v == null) return 42
    const n = Number(JSON.parse(v))
    return Number.isFinite(n) && n > 0 ? Math.min(200, Math.floor(n)) : 42
  } catch {
    return 42
  }
}

export function saveCaseta2TotalU(totalU) {
  const u = Math.min(200, Math.max(1, Math.floor(Number(totalU) || 42)))
  localStorage.setItem(KEY_TOTAL, JSON.stringify(u))
}

export function loadCaseta2Items() {
  try {
    const raw = localStorage.getItem(KEY_ITEMS)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function saveCaseta2Items(items) {
  localStorage.setItem(KEY_ITEMS, JSON.stringify(items))
}

function allocateCompId() {
  const items = loadCaseta2Items()
  let stored = CASETA2_MIN_COMPONENTE_ID
  try {
    const raw = localStorage.getItem(KEY_NEXT_ID)
    if (raw != null) stored = Number(JSON.parse(raw))
  } catch {
    /* ignore */
  }
  const maxFromItems = items.reduce((m, it) => Math.max(m, Number(it.id) || 0), 0)
  const next = Math.max(CASETA2_MIN_COMPONENTE_ID, maxFromItems + 1, stored)
  localStorage.setItem(KEY_NEXT_ID, JSON.stringify(next + 1))
  return next
}

export function compactCaseta2Positions(totalU, itemsInOrder) {
  let top = totalU
  return itemsInOrder.map((it) => {
    const alt = it.alturaU ?? 1
    const pos = top
    top -= alt
    return {
      ...it,
      rackId: CASETA2_RACK_ID,
      posicionInicio: pos,
      alturaU: alt,
    }
  })
}

export function getCaseta2ComponentesResolved() {
  const totalU = loadCaseta2TotalU()
  const items = loadCaseta2Items()
  return compactCaseta2Positions(totalU, items)
}

export function sumAlturaItems(items) {
  return items.reduce((s, it) => s + (it.alturaU ?? 1), 0)
}

export function addCaseta2FromTemplate(template) {
  const totalU = loadCaseta2TotalU()
  const items = [...loadCaseta2Items()]
  const alt = template.alturaU ?? 1
  if (sumAlturaItems(items) + alt > totalU) {
    return {
      ok: false,
      error:
        "No cabe más altura U en el rack. Aumenta el total U o quita equipos.",
    }
  }
  const id = allocateCompId()
  items.push({
    id,
    nombre: template.nombre,
    alturaU: alt,
    numPuertos: template.numPuertos,
    rackId: CASETA2_RACK_ID,
  })
  saveCaseta2Items(items)
  return { ok: true }
}

export function removeCaseta2Item(componenteId) {
  const id = Number(componenteId)
  const items = loadCaseta2Items().filter((it) => Number(it.id) !== id)
  saveCaseta2Items(items)
}

export function setCaseta2TotalUIfFits(newTotal) {
  const u = Math.min(200, Math.max(1, Math.floor(Number(newTotal) || 42)))
  const items = loadCaseta2Items()
  if (sumAlturaItems(items) > u) {
    return {
      ok: false,
      error:
        "Los equipos actuales ocupan más U. Quita equipos antes de bajar el total.",
    }
  }
  saveCaseta2TotalU(u)
  return { ok: true }
}
