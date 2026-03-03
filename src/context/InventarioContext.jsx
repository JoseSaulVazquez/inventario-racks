import { createContext, useContext, useMemo, useState, useEffect } from "react"
import { puertosIniciales } from "../data/mockData"

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
