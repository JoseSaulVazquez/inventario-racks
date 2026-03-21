import { racks, getComponentesByRackId } from "../data/mockData"
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
