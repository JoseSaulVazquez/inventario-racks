import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react"
import {
  puertosIniciales,
  racks,
  areas,
  getNumeroSwitchEnRack,
  getNumeroPanelEnRack,
} from "../data/mockData"
import { getMergedComponentes } from "../utils/rackMerge"
import {
  cantidadPuertosDispositivo,
  DYNAMIC_MIN_COMPONENTE_ID,
} from "../utils/rackDynamicStorage"

const STORAGE_KEY = "inventario-puertos"
const STORAGE_KEY_IP = "inventario-ips-componentes"

function loadPuertos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...puertosIniciales]
    const saved = JSON.parse(raw)
    if (!Array.isArray(saved)) return [...puertosIniciales]
    const staticIds = new Set(puertosIniciales.map((p) => p.id))
    const merged = puertosIniciales.map((p) => {
      const found = saved.find((s) => s.id === p.id)
      return found ? { ...p, ...found } : p
    })
    // Puertos extra guardados (p. ej. Caseta 2 antiguos) que no están en la plantilla estática
    const extras = saved.filter(
      (s) => s && typeof s.id === "number" && !staticIds.has(s.id)
    )
    return extras.length ? [...merged, ...extras] : merged
  } catch {
    return [...puertosIniciales]
  }
}

function savePuertos(puertos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(puertos))
  } catch (_) {}
}

function loadIps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_IP)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveIps(ips) {
  try {
    localStorage.setItem(STORAGE_KEY_IP, JSON.stringify(ips))
  } catch (_) {}
}

const InventarioContext = createContext(null)

function crearPuertoBase(id, n, componenteId) {
  return {
    id,
    numero: n,
    estado: "libre",
    componenteId,
    ip: null,
    vlan: "-",
    equipoConectado: "",
    conexionDestino: "",
    notas: "",
    conector: "",
    numeroPanel: "",
    puertoPanel: "",
    numeroSwitch: "",
    puertoSwitch: "",
    nombre: "",
    bdRowId: null,
  }
}

function rebuildPuertosDesdeLayout(prevPuertos) {
  const base = prevPuertos.filter(
    (p) => Number(p.componenteId) < DYNAMIC_MIN_COMPONENTE_ID
  )
  const prevDynamic = prevPuertos.filter(
    (p) => Number(p.componenteId) >= DYNAMIC_MIN_COMPONENTE_ID
  )

  const listaComp = getMergedComponentes()
  const dynamicComponents = listaComp.filter(
    (c) => Number(c.id) >= DYNAMIC_MIN_COMPONENTE_ID
  )

  const prevDynamicMap = new Map()
  for (const p of prevDynamic) {
    prevDynamicMap.set(`${p.componenteId}::${p.numero}`, p)
  }

  const maxId =
    Math.max(
      0,
      ...base.map((p) => p.id),
      ...prevDynamic.map((p) => p.id)
    ) + 1

  let nextId = maxId
  const rebuiltDynamic = []
  for (const c of dynamicComponents) {
    const cant = cantidadPuertosDispositivo(c.nombre, c.numPuertos)
    for (let n = 1; n <= cant; n++) {
      const key = `${c.id}::${n}`
      const existing = prevDynamicMap.get(key)
      if (existing) rebuiltDynamic.push(existing)
      else rebuiltDynamic.push(crearPuertoBase(nextId++, n, c.id))
    }
  }

  return [...base, ...rebuiltDynamic]
}

function buildInitialPuertos() {
  return rebuildPuertosDesdeLayout(loadPuertos())
}

function limpiarPuerto(p) {
  return {
    ...p,
    estado: "libre",
    conector: "",
    numeroPanel: "",
    puertoPanel: "",
    numeroSwitch: "",
    puertoSwitch: "",
    equipoConectado: "",
    nombre: "",
    notas: "",
    ip: null,
    bdRowId: null,
  }
}

/** Numeración por rack (como en BD histórica); lista incluye Caseta 2 dinámica. */
function bdNumeroSwitch(comp, listaComp) {
  return getNumeroSwitchEnRack(comp.id, listaComp)
}

function bdNumeroPanel(comp, listaComp) {
  return getNumeroPanelEnRack(comp.id, listaComp)
}

export function InventarioProvider({ children }) {
  const [puertos, setPuertos] = useState(() => buildInitialPuertos())
  const [ipsComponentes, setIpsComponentes] = useState(() => loadIps())

  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth-token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const resyncRackDynamicPuertos = useCallback(() => {
    setPuertos((prev) => {
      const next = rebuildPuertosDesdeLayout(prev)
      savePuertos(next)
      return next
    })
  }, [])

  // Cargar/mezclar datos desde PostgreSQL (backend)
  useEffect(() => {
    const sync = async () => {
      try {
        // Intentar por proxy de Vite; si no existe, usar backend directo.
        let res = await fetch("/api/puertos", { headers: getAuthHeaders() }).catch(() => null)
        if (!res || !res.ok) {
          res = await fetch("http://localhost:3001/api/puertos", {
            headers: getAuthHeaders(),
          }).catch(() => null)
        }
        if (!res || !res.ok) return
        const rows = await res.json()

        const parsePort = (v) => {
          if (v == null) return null
          if (typeof v === "number") return v
          const s = String(v).trim()
          const m = s.match(/(\d+)/)
          return m ? Number(m[1]) : null
        }

        const normalizeEstado = (v) => {
          if (!v) return null
          const s = String(v).trim().toLowerCase()
          if (s.startsWith("ocu")) return "ocupado"
          if (s.startsWith("lib")) return "libre"
          if (s.startsWith("dañ") || s.startsWith("dan")) return "dañado"
          return s
        }

        const normalizeAreaKey = (v) =>
          v == null ? null : String(v).trim().toUpperCase()

        // lookups:
        // - switch: (area, numero_switch, puerto_switch)
        // - panel:  (area, numero_panel, puerto_panel)
        const mapSwitch = new Map()
        const mapPanel = new Map()
        for (const r of rows) {
          const ps = parsePort(r.puerto_switch)
          const pp = parsePort(r.puerto_panel)
          const areaKey = normalizeAreaKey(r.area)
          if (areaKey && r.numero_switch != null && ps != null) {
            mapSwitch.set(`${areaKey}::${Number(r.numero_switch)}::${ps}`, r)
          }
          if (areaKey && r.numero_panel != null && pp != null) {
            mapPanel.set(`${areaKey}::${Number(r.numero_panel)}::${pp}`, r)
          }
        }

        const listaComp = getMergedComponentes()

        // actualizar IP por switch (si viene en BD)
        setIpsComponentes(() => {
          const next = {}
          for (const r of rows) {
            if (!r.ip_switch) continue
            if (r.numero_switch == null) continue
            // Encontrar componente switch que corresponda (por area + numero_switch)
            const areaObj = areas.find(
              (a) => normalizeAreaKey(a.codigoBd) === normalizeAreaKey(r.area)
            )
            if (!areaObj) continue
            const rackIds = racks.filter((rk) => rk.areaId === areaObj.id).map((rk) => rk.id)
            const switches = listaComp
              .filter((c) => rackIds.includes(c.rackId) && String(c.nombre).toLowerCase().includes("switch"))
              .map((c) => ({ c, num: bdNumeroSwitch(c, listaComp) }))
              .filter((x) => x.num != null)

            const match = switches.find((x) => x.num === Number(r.numero_switch))
            if (match) next[match.c.id] = r.ip_switch
          }
          return next
        })

        // Base: localStorage + plantilla, luego Caseta 2; encima aplicamos BD (sin borrar lo no mapeado)
        setPuertos(() => {
          const conCaseta2 = rebuildPuertosDesdeLayout(loadPuertos())
          const next = conCaseta2.map((p) => {
            const comp = listaComp.find((c) => c.id === p.componenteId)
            if (!comp) return p
            const nombreComp = String(comp.nombre).toLowerCase()

            const rack = racks.find((rk) => rk.id === comp.rackId)
            const areaObj = rack ? areas.find((a) => a.id === rack.areaId) : null
            const areaBdKey = normalizeAreaKey(areaObj?.codigoBd)
            if (!areaBdKey) return p

            let row = null
            if (nombreComp.includes("switch")) {
              const numSwitch = bdNumeroSwitch(comp, listaComp)
              if (numSwitch != null) {
                row = mapSwitch.get(`${areaBdKey}::${numSwitch}::${p.numero}`) || null
              }
            } else if (nombreComp.includes("patch panel")) {
              const numPanel = bdNumeroPanel(comp, listaComp)
              if (numPanel != null) {
                row = mapPanel.get(`${areaBdKey}::${numPanel}::${p.numero}`) || null
              }
            } else {
              // Fibra/otros: por ahora no mapeamos (no hay clave inequívoca)
              row = null
            }
            if (!row) return limpiarPuerto(p)

            return {
              ...p,
              // normalizamos nombres según frontend
              estado: normalizeEstado(row.estado) ?? p.estado,
              conector: row.conector ?? null,
              numeroPanel: row.numero_panel ?? null,
              puertoPanel: row.puerto_panel ?? null,
              numeroSwitch: row.numero_switch ?? null,
              puertoSwitch: row.puerto_switch ?? null,
              equipoConectado: row.equipo_conectado ?? null,
              nombre: row.nombre ?? null,
              notas: row.notas ?? null,
              ip: row.ip,
              bdRowId: row.id ?? null,
            }
          })
          savePuertos(next)
          return next
        })
      } catch {
        // ignore
      }
    }

    sync()
  }, [])

  // Refresca la tabla completa desde PostgreSQL para que “switch ↔ patch panel”
  // se actualicen al mismo tiempo que se guardan cambios.
  const refrescarPuertosDesdeBD = async () => {
    try {
      // Intentar por proxy de Vite; si no existe, usar backend directo.
      let res = await fetch("/api/puertos", { headers: getAuthHeaders() }).catch(() => null)
      if (!res || !res.ok) {
        res = await fetch("http://localhost:3001/api/puertos", {
          headers: getAuthHeaders(),
        }).catch(() => null)
      }
      if (!res || !res.ok) return
      const rows = await res.json()

      const parsePort = (v) => {
        if (v == null) return null
        if (typeof v === "number") return v
        const s = String(v).trim()
        const m = s.match(/(\d+)/)
        return m ? Number(m[1]) : null
      }

      const normalizeEstado = (v) => {
        if (!v) return null
        const s = String(v).trim().toLowerCase()
        if (s.startsWith("ocu")) return "ocupado"
        if (s.startsWith("lib")) return "libre"
        if (s.startsWith("dañ") || s.startsWith("dan")) return "dañado"
        return s
      }

      const normalizeAreaKey = (v) =>
        v == null ? null : String(v).trim().toUpperCase()

      const mapSwitch = new Map()
      const mapPanel = new Map()
      for (const r of rows) {
        const ps = parsePort(r.puerto_switch)
        const pp = parsePort(r.puerto_panel)
        const areaKey = normalizeAreaKey(r.area)
        if (areaKey && r.numero_switch != null && ps != null) {
          mapSwitch.set(`${areaKey}::${Number(r.numero_switch)}::${ps}`, r)
        }
        if (areaKey && r.numero_panel != null && pp != null) {
          mapPanel.set(`${areaKey}::${Number(r.numero_panel)}::${pp}`, r)
        }
      }

      const listaComp = getMergedComponentes()

      const nextIps = {}
      for (const r of rows) {
        if (!r.ip_switch) continue
        if (r.numero_switch == null) continue

        const areaObj = areas.find(
          (a) => normalizeAreaKey(a.codigoBd) === normalizeAreaKey(r.area)
        )
        if (!areaObj) continue

        const rackIds = racks.filter((rk) => rk.areaId === areaObj.id).map((rk) => rk.id)
        const switches = listaComp
          .filter(
            (c) =>
              rackIds.includes(c.rackId) && String(c.nombre).toLowerCase().includes("switch")
          )
          .map((c) => ({ c, num: bdNumeroSwitch(c, listaComp) }))
          .filter((x) => x.num != null)

        const match = switches.find((x) => x.num === Number(r.numero_switch))
        if (match) nextIps[match.c.id] = r.ip_switch
      }
      setIpsComponentes(nextIps)

      setPuertos(() => {
        const conCaseta2 = rebuildPuertosDesdeLayout(loadPuertos())
        const next = conCaseta2.map((p) => {
          const comp = listaComp.find((c) => c.id === p.componenteId)
          if (!comp) return p
          const nombreComp = String(comp.nombre).toLowerCase()

          const rack = racks.find((rk) => rk.id === comp.rackId)
          const areaObj = rack ? areas.find((a) => a.id === rack.areaId) : null
          const areaBdKey = normalizeAreaKey(areaObj?.codigoBd)
          if (!areaBdKey) return p

          let row = null
          if (nombreComp.includes("switch")) {
            const numSwitch = bdNumeroSwitch(comp, listaComp)
            if (numSwitch != null) {
              row = mapSwitch.get(`${areaBdKey}::${numSwitch}::${p.numero}`) || null
            }
          } else if (nombreComp.includes("patch panel")) {
            const numPanel = bdNumeroPanel(comp, listaComp)
            if (numPanel != null) {
              row = mapPanel.get(`${areaBdKey}::${numPanel}::${p.numero}`) || null
            }
          } else {
            row = null
          }

          if (!row) return limpiarPuerto(p)

          return {
            ...p,
            estado: normalizeEstado(row.estado) ?? p.estado,
            conector: row.conector ?? null,
            numeroPanel: row.numero_panel ?? null,
            puertoPanel: row.puerto_panel ?? null,
            numeroSwitch: row.numero_switch ?? null,
            puertoSwitch: row.puerto_switch ?? null,
            equipoConectado: row.equipo_conectado ?? null,
            nombre: row.nombre ?? null,
            notas: row.notas ?? null,
              ip: row.ip,
            bdRowId: row.id ?? null,
          }
        })
        savePuertos(next)
        return next
      })
    } catch {
      // ignore
    }
  }

  const updatePuerto = (puertoId, datos) => {
    setPuertos((prev) => {
      const next = prev.map((p) =>
        p.id === Number(puertoId) ? { ...p, ...datos } : p
      )
      savePuertos(next)
      return next
    })
  }

  const getIpComponente = (componenteId) => {
    const id = Number(componenteId)
    return ipsComponentes[id] ?? null
  }

  const updateIpComponente = (componenteId, ip) => {
    const id = Number(componenteId)
    const listaComp = getMergedComponentes()
    const comp = listaComp.find((c) => c.id === id)
    if (!comp) return
    if (!String(comp.nombre).toLowerCase().includes("switch")) return

    const rack = racks.find((rk) => rk.id === comp.rackId)
    const areaObj = rack ? areas.find((a) => a.id === rack.areaId) : null
    const areaBd = areaObj?.codigoBd
    const numeroSwitch = bdNumeroSwitch(comp, listaComp)

    if (!areaBd || numeroSwitch == null) return

    fetch("/api/conexiones_red/update_ip", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({
        area: String(areaBd).trim().toUpperCase(),
        numero_switch: numeroSwitch,
        ip,
      }),
    })
      .then((r) => (r && r.ok ? r.json() : null))
      .then((resp) => {
        if (!resp) return
        setIpsComponentes((prev) => {
          const n = { ...prev, [id]: ip }
          saveIps(n)
          return n
        })
      })
      .catch(() => null)
  }

  const deleteIpComponente = (componenteId) => {
    const id = Number(componenteId)
    const listaComp = getMergedComponentes()
    const comp = listaComp.find((c) => c.id === id)
    if (!comp) return
    if (!String(comp.nombre).toLowerCase().includes("switch")) return

    const rack = racks.find((rk) => rk.id === comp.rackId)
    const areaObj = rack ? areas.find((a) => a.id === rack.areaId) : null
    const areaBd = areaObj?.codigoBd
    const numeroSwitch = bdNumeroSwitch(comp, listaComp)

    if (!areaBd || numeroSwitch == null) return

    fetch("/api/conexiones_red/delete_ip_switch", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({
        area: String(areaBd).trim().toUpperCase(),
        numero_switch: numeroSwitch,
      }),
    })
      .then((r) => (r && r.ok ? r.json() : null))
      .then((resp) => {
        if (!resp || !resp.ok) return
        setIpsComponentes((prev) => {
          const next = { ...prev }
          delete next[id]
          saveIps(next)
          return next
        })
      })
      .catch(() => null)
  }

  const value = useMemo(
    () => ({
      puertos,
      updatePuerto,
      getIpComponente,
      updateIpComponente,
      refrescarPuertosDesdeBD,
      resyncRackDynamicPuertos,
      deleteIpComponente,
    }),
    [puertos, ipsComponentes, resyncRackDynamicPuertos, deleteIpComponente]
  )

  return (
    <InventarioContext.Provider value={value}>
      {children}
    </InventarioContext.Provider>
  )
}

export function useInventario() {
  const ctx = useContext(InventarioContext)
  if (!ctx) throw new Error("useInventario debe usarse dentro de InventarioProvider")
  return ctx
}
