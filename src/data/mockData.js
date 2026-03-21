// ─── Ubicaciones principales (botones del Home) – 6 áreas como en el diseño ─
export const ubicacionesPrincipales = [
  { id: "oficinas", nombre: "Oficinas" },
  { id: "casetas", nombre: "Casetas" },
  { id: "comedor", nombre: "Comedor" },
  { id: "planta", nombre: "Planta" },
  { id: "mantenimiento", nombre: "Mantenimiento" },
  { id: "dormitorios", nombre: "Dormitorios" },
]

// Pisos de Oficinas: 4 racks (una opción por planta). rackId para ir directo al rack.
export const pisosOficinas = [
  { id: "pb", nombre: "Planta baja", areaId: 1, rackId: 1 },
  { id: "p1", nombre: "Primera Planta", areaId: 2, rackId: 2 },
  { id: "p2", nombre: "Segunda Planta", areaId: 3, rackId: 4 },
  { id: "p3", nombre: "Tercera Planta", areaId: 4, rackId: 6 },
]

// Áreas: 1-4 Oficinas, 5 Casetas, 6 Comedor, 7 Dormitorios, 8 Planta, 9 Mantenimiento
export const areas = [
  { id: 1, nombre: "Planta baja", codigoBd: "PB" },
  { id: 2, nombre: "Primera Planta", codigoBd: "P1" },
  { id: 3, nombre: "Segunda Planta", codigoBd: "P2" },
  { id: 4, nombre: "Tercera Planta", codigoBd: "P3" },
  { id: 5, nombre: "Casetas", codigoBd: "Caseta" },
  { id: 6, nombre: "Comedor", codigoBd: "Comedor" },
  { id: 7, nombre: "Dormitorios", codigoBd: "Dormitorios" },
  { id: 8, nombre: "Planta" },
  { id: 9, nombre: "Mantenimiento", codigoBd: "Mantenimiento" },
]

// Ubicaciones que van directo a un rack (solo 1 rack en esa área)
// Casetas: lista en /casetas (Caseta 1 y 2), no ir directo a un rack.
export const ubicacionToRackId = {
  comedor: 8,
  dormitorios: 9,
  mantenimiento: 16,
}

// Ubicaciones que muestran lista de racks (varios en esa área)
export const ubicacionToAreaId = {
  planta: 8,
}

// ─── Racks ─────────────────────────────────────────────────────────────────
// Oficinas (1-4): 6 racks. Casetas (5): 2 (Caseta 1 fija + Caseta 2 dinámica). Comedor (6): 1. Dormitorios (7): 1. Planta (8): 6. Mantenimiento (9): 1.
export const racks = [
  { id: 1, nombre: "Rack Oficinas PB", totalU: 42, areaId: 1 },
  { id: 2, nombre: "Rack Oficinas P1", totalU: 42, areaId: 2 },
  { id: 3, nombre: "Rack Oficinas P1-B", totalU: 24, areaId: 2 },
  { id: 4, nombre: "Rack Oficinas P2", totalU: 42, areaId: 3 },
  { id: 5, nombre: "Rack Oficinas P2-B", totalU: 24, areaId: 3 },
  { id: 6, nombre: "Rack Oficinas P3", totalU: 42, areaId: 4 },
  { id: 7, nombre: "Rack Caseta 1", totalU: 20, areaId: 5 },
  { id: 17, nombre: "Rack Caseta 2", totalU: 42, areaId: 5 },
  { id: 8, nombre: "Rack Comedor", totalU: 20, areaId: 6 },
  { id: 9, nombre: "Rack Dormitorios", totalU: 20, areaId: 7 },
  { id: 10, nombre: "IDF Principal", totalU: 42, areaId: 8 },
  { id: 11, nombre: "Rack WH", totalU: 42, areaId: 8 },
  { id: 12, nombre: "Rack Sheet Metal", totalU: 42, areaId: 8 },
  { id: 13, nombre: "Rack WH2", totalU: 42, areaId: 8 },
  { id: 14, nombre: "Rack CNC", totalU: 42, areaId: 8 },
  { id: 15, nombre: "Rack CMM", totalU: 42, areaId: 8 },
  { id: 16, nombre: "Rack Mantenimiento", totalU: 20, areaId: 9 },
]

// ─── Componentes por rack (nombre, puertos, posición P1=top) ─────────────────
// numPuertos usado para generar puertos. posicionInicio = U desde arriba.
export const componentes = [
  // Rack 1 - Planta Baja (42U)
  { id: 1, nombre: "Fibra", rackId: 1, posicionInicio: 42, alturaU: 1, numPuertos: 14 },
  { id: 2, nombre: "Fibra", rackId: 1, posicionInicio: 41, alturaU: 1, numPuertos: 14 },
  { id: 3, nombre: "Patch Panel 24p", rackId: 1, posicionInicio: 40, alturaU: 1, numPuertos: 24 },
  { id: 4, nombre: "Switch 24p", rackId: 1, posicionInicio: 39, alturaU: 1, numPuertos: 26 },
  { id: 5, nombre: "Patch Panel 24p", rackId: 1, posicionInicio: 38, alturaU: 1, numPuertos: 24 },
  { id: 6, nombre: "Switch 24p", rackId: 1, posicionInicio: 37, alturaU: 1, numPuertos: 26 },
  { id: 7, nombre: "Patch Panel 24p", rackId: 1, posicionInicio: 36, alturaU: 1, numPuertos: 24 },
  { id: 8, nombre: "Switch 24p", rackId: 1, posicionInicio: 35, alturaU: 1, numPuertos: 26 },
  { id: 9, nombre: "Patch Panel 24p", rackId: 1, posicionInicio: 34, alturaU: 1, numPuertos: 24 },
  { id: 10, nombre: "Patch Panel 24p", rackId: 1, posicionInicio: 33, alturaU: 1, numPuertos: 24 },
  { id: 11, nombre: "Switch 24p", rackId: 1, posicionInicio: 32, alturaU: 1, numPuertos: 26 },
  // Rack 2 - Primera Planta (42U)
  { id: 12, nombre: "Fibra", rackId: 2, posicionInicio: 42, alturaU: 1, numPuertos: 14 },
  { id: 13, nombre: "Patch Panel 24p", rackId: 2, posicionInicio: 41, alturaU: 1, numPuertos: 24 },
  { id: 14, nombre: "Switch 16p", rackId: 2, posicionInicio: 40, alturaU: 1, numPuertos: 18 },
  { id: 15, nombre: "Patch Panel 24p", rackId: 2, posicionInicio: 39, alturaU: 1, numPuertos: 24 },
  { id: 16, nombre: "Patch Panel 24p", rackId: 2, posicionInicio: 38, alturaU: 1, numPuertos: 24 },
  { id: 17, nombre: "Switch 24p", rackId: 2, posicionInicio: 37, alturaU: 1, numPuertos: 26 },
  { id: 18, nombre: "Patch Panel 24p", rackId: 2, posicionInicio: 36, alturaU: 1, numPuertos: 24 },
  { id: 19, nombre: "Switch 24p", rackId: 2, posicionInicio: 35, alturaU: 1, numPuertos: 26 },
  { id: 20, nombre: "Patch Panel 24p", rackId: 2, posicionInicio: 34, alturaU: 1, numPuertos: 24 },
  { id: 21, nombre: "Switch 24p", rackId: 2, posicionInicio: 33, alturaU: 1, numPuertos: 26 },
  { id: 22, nombre: "Patch Panel 24p", rackId: 2, posicionInicio: 32, alturaU: 1, numPuertos: 24 },
  { id: 23, nombre: "Switch 24p", rackId: 2, posicionInicio: 31, alturaU: 1, numPuertos: 26 },
  { id: 24, nombre: "Patch Panel 24p", rackId: 2, posicionInicio: 30, alturaU: 1, numPuertos: 24 },
  { id: 25, nombre: "Switch 24p", rackId: 2, posicionInicio: 29, alturaU: 1, numPuertos: 26 },
  { id: 26, nombre: "Patch Panel 24p", rackId: 2, posicionInicio: 28, alturaU: 1, numPuertos: 24 },
  // Rack 4 - Segunda Planta (42U)
  { id: 27, nombre: "Fibra", rackId: 4, posicionInicio: 42, alturaU: 1, numPuertos: 21 },
  { id: 28, nombre: "Switch 16p", rackId: 4, posicionInicio: 41, alturaU: 1, numPuertos: 18 },
  { id: 29, nombre: "Switch Linksys 24p", rackId: 4, posicionInicio: 40, alturaU: 1, numPuertos: 24 },
  { id: 30, nombre: "Patch Panel 48p", rackId: 4, posicionInicio: 39, alturaU: 1, numPuertos: 48 },
  { id: 31, nombre: "Switch 24p", rackId: 4, posicionInicio: 38, alturaU: 1, numPuertos: 26 },
  { id: 32, nombre: "Patch Panel 24p", rackId: 4, posicionInicio: 37, alturaU: 1, numPuertos: 24 },
  { id: 33, nombre: "Switch 16p", rackId: 4, posicionInicio: 36, alturaU: 1, numPuertos: 18 },
  { id: 34, nombre: "Switch 16p", rackId: 4, posicionInicio: 35, alturaU: 1, numPuertos: 18 },
  { id: 35, nombre: "Patch Panel 48p", rackId: 4, posicionInicio: 34, alturaU: 1, numPuertos: 48 },
  { id: 36, nombre: "Patch Panel 48p", rackId: 4, posicionInicio: 33, alturaU: 1, numPuertos: 48 },
  { id: 37, nombre: "Switch 16p", rackId: 4, posicionInicio: 32, alturaU: 1, numPuertos: 18 },
  // Rack 6 - Tercera Planta (42U)
  { id: 38, nombre: "Fibra", rackId: 6, posicionInicio: 42, alturaU: 1, numPuertos: 21 },
  { id: 39, nombre: "Patch Panel 24p", rackId: 6, posicionInicio: 41, alturaU: 1, numPuertos: 24 },
  { id: 40, nombre: "Switch 16p", rackId: 6, posicionInicio: 40, alturaU: 1, numPuertos: 18 },
  { id: 41, nombre: "Patch Panel 24p", rackId: 6, posicionInicio: 39, alturaU: 1, numPuertos: 24 },
  { id: 42, nombre: "Switch 24p", rackId: 6, posicionInicio: 38, alturaU: 1, numPuertos: 26 },
  { id: 43, nombre: "Patch Panel 24p", rackId: 6, posicionInicio: 37, alturaU: 1, numPuertos: 24 },
  { id: 44, nombre: "Switch 24p", rackId: 6, posicionInicio: 36, alturaU: 1, numPuertos: 26 },
  { id: 45, nombre: "Patch Panel 24p", rackId: 6, posicionInicio: 35, alturaU: 1, numPuertos: 24 },
  { id: 46, nombre: "Switch 24p", rackId: 6, posicionInicio: 34, alturaU: 1, numPuertos: 26 },
  { id: 47, nombre: "Patch Panel 24p", rackId: 6, posicionInicio: 33, alturaU: 1, numPuertos: 24 },
  { id: 48, nombre: "Switch 24p", rackId: 6, posicionInicio: 32, alturaU: 1, numPuertos: 26 },
  { id: 49, nombre: "Patch Panel 24p", rackId: 6, posicionInicio: 31, alturaU: 1, numPuertos: 24 },
  { id: 50, nombre: "Switch 24p", rackId: 6, posicionInicio: 30, alturaU: 1, numPuertos: 26 },
  { id: 51, nombre: "Patch Panel 24p", rackId: 6, posicionInicio: 29, alturaU: 1, numPuertos: 24 },
  { id: 52, nombre: "Switch 24p", rackId: 6, posicionInicio: 28, alturaU: 1, numPuertos: 26 },
  { id: 53, nombre: "Patch Panel 24p", rackId: 6, posicionInicio: 27, alturaU: 1, numPuertos: 24 },
  { id: 54, nombre: "Switch 16p", rackId: 6, posicionInicio: 26, alturaU: 1, numPuertos: 18 },
  { id: 55, nombre: "Patch Panel 24p", rackId: 6, posicionInicio: 25, alturaU: 1, numPuertos: 24 },
  { id: 56, nombre: "Switch 16p", rackId: 6, posicionInicio: 24, alturaU: 1, numPuertos: 18 },
  // Rack 7 - Casetas (20U)
  { id: 57, nombre: "Fibra", rackId: 7, posicionInicio: 20, alturaU: 1, numPuertos: 14 },
  { id: 58, nombre: "Patch Panel 24p", rackId: 7, posicionInicio: 19, alturaU: 1, numPuertos: 24 },
  { id: 59, nombre: "Switch 16p", rackId: 7, posicionInicio: 18, alturaU: 1, numPuertos: 18 },
  { id: 60, nombre: "Patch Panel 24p", rackId: 7, posicionInicio: 17, alturaU: 1, numPuertos: 24 },
  // Rack 8 - Comedor (20U)
  { id: 61, nombre: "Fibra", rackId: 8, posicionInicio: 20, alturaU: 1, numPuertos: 14 },
  { id: 62, nombre: "Patch Panel 24p", rackId: 8, posicionInicio: 19, alturaU: 1, numPuertos: 24 },
  { id: 63, nombre: "Switch 16p", rackId: 8, posicionInicio: 18, alturaU: 1, numPuertos: 18 },
  // Rack 9 - Dormitorios (20U)
  { id: 64, nombre: "Fibra", rackId: 9, posicionInicio: 20, alturaU: 1, numPuertos: 14 },
  { id: 65, nombre: "Patch Panel 24p", rackId: 9, posicionInicio: 19, alturaU: 1, numPuertos: 24 },
  { id: 66, nombre: "Switch 24p", rackId: 9, posicionInicio: 18, alturaU: 1, numPuertos: 26 },
  { id: 67, nombre: "Patch Panel 24p", rackId: 9, posicionInicio: 17, alturaU: 1, numPuertos: 24 },
  { id: 68, nombre: "Patch Panel 24p", rackId: 9, posicionInicio: 16, alturaU: 1, numPuertos: 24 },
  { id: 69, nombre: "Patch Panel 24p", rackId: 9, posicionInicio: 15, alturaU: 1, numPuertos: 24 },
  { id: 70, nombre: "Switch 24p", rackId: 9, posicionInicio: 14, alturaU: 1, numPuertos: 24 },
  { id: 71, nombre: "Componente POE 9p", rackId: 9, posicionInicio: 13, alturaU: 1, numPuertos: 9 },
  { id: 72, nombre: "Switch 16p", rackId: 9, posicionInicio: 12, alturaU: 1, numPuertos: 18 },
  { id: 73, nombre: "Patch Panel 24p", rackId: 9, posicionInicio: 11, alturaU: 1, numPuertos: 24 },
  { id: 74, nombre: "Fibra", rackId: 9, posicionInicio: 10, alturaU: 1, numPuertos: 14 },
  // Rack 10 - Rack Baño (sin datos del usuario, placeholder)
  { id: 75, nombre: "Switch 24p", rackId: 10, posicionInicio: 42, alturaU: 1, numPuertos: 24 },
  // Rack 11 - Rack 5-9B (42U)
  { id: 76, nombre: "Fibra", rackId: 11, posicionInicio: 42, alturaU: 1, numPuertos: 21 },
  { id: 77, nombre: "Patch Panel 24p", rackId: 11, posicionInicio: 41, alturaU: 1, numPuertos: 24 },
  { id: 78, nombre: "Switch 24p", rackId: 11, posicionInicio: 40, alturaU: 1, numPuertos: 26 },
  // Rack 12 - Rack Plataforma (42U)
  { id: 79, nombre: "Switch 16p", rackId: 12, posicionInicio: 42, alturaU: 1, numPuertos: 18 },
  { id: 80, nombre: "Patch Panel 24p", rackId: 12, posicionInicio: 41, alturaU: 1, numPuertos: 24 },
  { id: 81, nombre: "Switch Linksys 24p", rackId: 12, posicionInicio: 40, alturaU: 1, numPuertos: 24 },
  // Rack 13 - Rack 5-20A (42U)
  { id: 82, nombre: "Fibra", rackId: 13, posicionInicio: 42, alturaU: 1, numPuertos: 21 },
  { id: 83, nombre: "Patch Panel 24p", rackId: 13, posicionInicio: 41, alturaU: 1, numPuertos: 24 },
  { id: 84, nombre: "Patch Panel 24p", rackId: 13, posicionInicio: 40, alturaU: 1, numPuertos: 24 },
  // Rack 14 - Rack 1-20B (42U)
  { id: 85, nombre: "Fibra", rackId: 14, posicionInicio: 42, alturaU: 1, numPuertos: 21 },
  { id: 86, nombre: "Patch Panel 24p", rackId: 14, posicionInicio: 41, alturaU: 1, numPuertos: 24 },
  { id: 87, nombre: "Patch Panel 24p", rackId: 14, posicionInicio: 40, alturaU: 1, numPuertos: 24 },
  // Rack 15 - Rack Oficina (42U)
  { id: 88, nombre: "Switch 24p", rackId: 15, posicionInicio: 42, alturaU: 1, numPuertos: 26 },
  // Rack 16 - Mantenimiento (20U)
  { id: 89, nombre: "Fibra", rackId: 16, posicionInicio: 20, alturaU: 1, numPuertos: 14 },
  { id: 90, nombre: "Patch Panel 24p", rackId: 16, posicionInicio: 19, alturaU: 1, numPuertos: 24 },
  { id: 91, nombre: "Switch 16p", rackId: 16, posicionInicio: 18, alturaU: 1, numPuertos: 18 },
]

// Generar puertos para un componente (usa numPuertos del componente)
function generarPuertos(componenteId, cantidad) {
  const lista = []
  for (let n = 1; n <= cantidad; n++) {
    lista.push({
      numero: n,
      estado: "libre",
      componenteId,
      // Valores vacíos por defecto: así no se muestran “ejemplos” fuera de la BD.
      vlan: "-",
      equipoConectado: "",
      conexionDestino: "",
      notas: "",
      // Campos adicionales para tabla y formulario
      conector: "",
      numeroPanel: "",
      puertoPanel: "",
      numeroSwitch: "",
      puertoSwitch: "",
      nombre: "",
      ip: null,
      bdRowId: null,
    })
  }
  return lista
}

let idCounter = 1
const todosLosPuertos = []
componentes.forEach((c) => {
  let cantidad = c.numPuertos ?? 24
  const nombreLower = String(c.nombre || "").toLowerCase()
  const esSwitch = nombreLower.includes("switch")
  const esSwitchLinksys24p = esSwitch && nombreLower.includes("linksys") && nombreLower.includes("24")

  // Quitamos los dos últimos puertos de cada switch (puertos LAN),
  // excepto el "Switch Linksys 24p", que se mantiene igual.
  if (esSwitch && !esSwitchLinksys24p) {
    cantidad = Math.max(0, cantidad - 2)
  }

  generarPuertos(c.id, cantidad).forEach((p) => {
    todosLosPuertos.push({ ...p, id: idCounter++ })
  })
})

export const puertosIniciales = todosLosPuertos

// Helpers
export function getRacksByAreaId(areaId) {
  return racks.filter((r) => r.areaId === Number(areaId))
}

export function getComponentesByRackId(rackId) {
  return componentes.filter((c) => c.rackId === Number(rackId))
}

// Número de switch dentro del rack (1..n) ordenado de arriba hacia abajo.
// `listaComponentes` debe incluir Caseta 2 si usas rack 17 (p. ej. getMergedComponentes()).
export function getNumeroSwitchEnRack(componenteId, listaComponentes = componentes) {
  const list = listaComponentes
  const comp = list.find((c) => c.id === Number(componenteId))
  if (!comp) return null
  if (!String(comp.nombre).toLowerCase().includes("switch")) return null

  const switchesDelRack = list
    .filter(
      (c) =>
        c.rackId === comp.rackId &&
        String(c.nombre).toLowerCase().includes("switch")
    )
    .sort((a, b) => b.posicionInicio - a.posicionInicio)

  const idx = switchesDelRack.findIndex((c) => c.id === comp.id)
  return idx === -1 ? null : idx + 1
}

// Número de panel dentro del rack (1..n) ordenado de arriba hacia abajo
export function getNumeroPanelEnRack(componenteId, listaComponentes = componentes) {
  const list = listaComponentes
  const comp = list.find((c) => c.id === Number(componenteId))
  if (!comp) return null
  if (!String(comp.nombre).toLowerCase().includes("patch panel")) return null

  const panelsDelRack = list
    .filter(
      (c) =>
        c.rackId === comp.rackId &&
        String(c.nombre).toLowerCase().includes("patch panel")
    )
    .sort((a, b) => b.posicionInicio - a.posicionInicio)

  const idx = panelsDelRack.findIndex((c) => c.id === comp.id)
  return idx === -1 ? null : idx + 1
}

/** Índice de switch en todo el área (varios racks), por orden de rack y posición. Para BD cuando un área tiene más de un rack (p. ej. Caseta 1 + 2). */
export function getNumeroSwitchEnArea(componenteId, listaComponentes = componentes) {
  const list = listaComponentes
  const comp = list.find((c) => c.id === Number(componenteId))
  if (!comp) return null
  if (!String(comp.nombre).toLowerCase().includes("switch")) return null
  const rack = racks.find((r) => r.id === comp.rackId)
  if (!rack) return null
  const areaId = rack.areaId
  const rackIds = racks
    .filter((r) => r.areaId === areaId)
    .sort((a, b) => a.id - b.id)
    .map((r) => r.id)
  const switches = []
  for (const rid of rackIds) {
    const chunk = list
      .filter(
        (c) =>
          c.rackId === rid && String(c.nombre).toLowerCase().includes("switch")
      )
      .sort((a, b) => b.posicionInicio - a.posicionInicio)
    switches.push(...chunk)
  }
  const idx = switches.findIndex((c) => c.id === comp.id)
  return idx === -1 ? null : idx + 1
}

export function getNumeroPanelEnArea(componenteId, listaComponentes = componentes) {
  const list = listaComponentes
  const comp = list.find((c) => c.id === Number(componenteId))
  if (!comp) return null
  if (!String(comp.nombre).toLowerCase().includes("patch panel")) return null
  const rack = racks.find((r) => r.id === comp.rackId)
  if (!rack) return null
  const areaId = rack.areaId
  const rackIds = racks
    .filter((r) => r.areaId === areaId)
    .sort((a, b) => a.id - b.id)
    .map((r) => r.id)
  const panels = []
  for (const rid of rackIds) {
    const chunk = list
      .filter(
        (c) =>
          c.rackId === rid && String(c.nombre).toLowerCase().includes("patch panel")
      )
      .sort((a, b) => b.posicionInicio - a.posicionInicio)
    panels.push(...chunk)
  }
  const idx = panels.findIndex((c) => c.id === comp.id)
  return idx === -1 ? null : idx + 1
}

export function getPuertosByComponenteId(puertos, componenteId) {
  return (puertos || puertosIniciales).filter(
    (p) => p.componenteId === Number(componenteId)
  )
}
