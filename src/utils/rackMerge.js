import { racks, getComponentesByRackId, getBdNumeroPanel } from "../data/mockData"
import {
  getRackResolvedComponentes,
  DYNAMIC_MIN_COMPONENTE_ID,
} from "./rackDynamicStorage"

/** Lista resuelta global (base mockData + dinámicos por rack). */
export function getMergedComponentes() {
  return racks.flatMap((r) => getComponentesForRack(r.id))
}

export function findComponenteById(componenteId) {
  const id = Number(componenteId)
  if (!Number.isFinite(id)) return null
  return getMergedComponentes().find((c) => c.id === id) ?? null
}

export function getComponentesForRack(rackId) {
  const rid = Number(rackId)
  const base = getComponentesByRackId(rid)
  const rack = racks.find((r) => r.id === rid)
  const defaultTotalU = rack?.totalU ?? 42

  return getRackResolvedComponentes(rid, base, defaultTotalU)
}

export function esComponenteDinamico(componenteId) {
  return Number(componenteId) >= DYNAMIC_MIN_COMPONENTE_ID
}

/** 1..n solo equipos cuyo nombre incluye "switch" (Switch 16p, Switch 24p…), no NVR ni Access Point. */
export function getOpcionesNumeroSwitchRack(rackId) {
  const lista = getMergedComponentes()
  const rid = Number(rackId)
  const n = lista.filter((c) => {
    if (c.rackId !== rid) return false
    return String(c.nombre || "").toLowerCase().includes("switch")
  }).length
  return Array.from({ length: n }, (_, i) => i + 1)
}

/** Valores `numero_panel` de BD por cada patch panel del rack. */
export function getOpcionesNumeroPanelRack(rackId) {
  const lista = getMergedComponentes()
  const rid = Number(rackId)
  const panels = lista
    .filter(
      (c) =>
        c.rackId === rid &&
        String(c.nombre).toLowerCase().includes("patch panel")
    )
    .sort((a, b) => b.posicionInicio - a.posicionInicio)
  const nums = panels
    .map((c) => getBdNumeroPanel(c.id, lista))
    .filter((v) => v != null && Number.isFinite(Number(v)))
  const uniq = [...new Set(nums.map((v) => Number(v)))].sort((a, b) => a - b)
  return uniq
}
