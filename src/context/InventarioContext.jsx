import { createContext, useContext, useMemo, useState, useEffect } from "react"
import { puertosIniciales, componentes, racks, areas, getNumeroSwitchEnRack, getNumeroPanelEnRack } from "../data/mockData"

const STORAGE_KEY = "inventario-puertos"
const STORAGE_KEY_IP = "inventario-ips-componentes"

function loadPuertos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return puertosIniciales
    const saved = JSON.parse(raw)
    const merged = puertosIniciales.map((p) => {
      const found = saved.find((s) => s.id === p.id)
      return found ? { ...p, ...found } : p
    })
    return merged
  } catch {
    return puertosIniciales
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

export function InventarioProvider({ children }) {
  const [puertos, setPuertos] = useState(() => loadPuertos())
  const [ipsComponentes, setIpsComponentes] = useState(() => loadIps())

  useEffect(() => {
    setPuertos(loadPuertos())
    setIpsComponentes(loadIps())
  }, [])

  // Cargar/mezclar datos desde PostgreSQL (backend)
  useEffect(() => {
    const sync = async () => {
      try {
        // Intentar por proxy de Vite; si no existe, usar backend directo.
        let res = await fetch("/api/puertos").catch(() => null)
        if (!res || !res.ok) {
          res = await fetch("http://localhost:3001/api/puertos").catch(() => null)
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

        // lookups:
        // - switch: (area, numero_switch, puerto_switch)
        // - panel:  (area, numero_panel, puerto_panel)
        const mapSwitch = new Map()
        const mapPanel = new Map()
        for (const r of rows) {
          const ps = parsePort(r.puerto_switch)
          const pp = parsePort(r.puerto_panel)
          if (r.area && r.numero_switch != null && ps != null) {
            mapSwitch.set(`${r.area}::${Number(r.numero_switch)}::${ps}`, r)
          }
          if (r.area && r.numero_panel != null && pp != null) {
            mapPanel.set(`${r.area}::${Number(r.numero_panel)}::${pp}`, r)
          }
        }

        // actualizar IP por switch (si viene en BD)
        setIpsComponentes((prev) => {
          const next = { ...prev }
          for (const r of rows) {
            if (!r.ip) continue
            if (r.numero_switch == null) continue
            // Encontrar componente switch que corresponda (por area + numero_switch)
            const areaObj = areas.find((a) => a.codigoBd === r.area)
            if (!areaObj) continue
            const rackIds = racks.filter((rk) => rk.areaId === areaObj.id).map((rk) => rk.id)
            const switches = componentes
              .filter((c) => rackIds.includes(c.rackId) && String(c.nombre).toLowerCase().includes("switch"))
              .map((c) => ({ c, num: getNumeroSwitchEnRack(c.id) }))
              .filter((x) => x.num != null)

            const match = switches.find((x) => x.num === Number(r.numero_switch))
            if (match) next[match.c.id] = r.ip
          }
          saveIps(next)
          return next
        })

        // mezclar filas de BD en puertos
        setPuertos((prev) => {
          const next = prev.map((p) => {
            const comp = componentes.find((c) => c.id === p.componenteId)
            if (!comp) return p
            const nombreComp = String(comp.nombre).toLowerCase()

            const rack = racks.find((rk) => rk.id === comp.rackId)
            const areaObj = rack ? areas.find((a) => a.id === rack.areaId) : null
            const areaBd = areaObj?.codigoBd
            if (!areaBd) return p

            let row = null
            if (nombreComp.includes("switch")) {
              const numSwitch = getNumeroSwitchEnRack(comp.id)
              if (numSwitch != null) row = mapSwitch.get(`${areaBd}::${numSwitch}::${p.numero}`) || null
            } else if (nombreComp.includes("patch panel")) {
              const numPanel = getNumeroPanelEnRack(comp.id)
              if (numPanel != null) row = mapPanel.get(`${areaBd}::${numPanel}::${p.numero}`) || null
            } else {
              // Fibra/otros: por ahora no mapeamos (no hay clave inequívoca)
              row = null
            }
            if (!row) return p

            return {
              ...p,
              // normalizamos nombres según frontend
              estado: normalizeEstado(row.estado) ?? p.estado,
              conector: row.conector ?? p.conector,
              numeroPanel: row.numero_panel ?? p.numeroPanel,
              puertoPanel: row.puerto_panel ?? p.puertoPanel,
              numeroSwitch: row.numero_switch ?? p.numeroSwitch,
              puertoSwitch: row.puerto_switch ?? p.puertoSwitch,
              equipoConectado: row.equipo_conectado ?? p.equipoConectado,
              nombre: row.nombre ?? p.nombre,
              notas: row.notas ?? p.notas,
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
    return ipsComponentes[id] ?? "192.168.0.31"
  }

  const updateIpComponente = (componenteId, ip) => {
    const id = Number(componenteId)
    setIpsComponentes((prev) => {
      const next = { ...prev, [id]: ip }
      saveIps(next)
      return next
    })
  }

  const value = useMemo(
    () => ({ puertos, updatePuerto, getIpComponente, updateIpComponente }),
    [puertos, ipsComponentes]
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
