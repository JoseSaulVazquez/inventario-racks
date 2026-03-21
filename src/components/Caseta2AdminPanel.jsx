import { useState, useMemo } from "react"
import {
  CATALOG_FAMILIAS as CATALOG_FAMILIAS_DYNAMIC,
  loadRackDynamicTotalU,
  addRackDynamicFromTemplate,
  removeRackDynamicItem,
  hideRackBaseComponent,
  setRackDynamicTotalUIfFits,
  getRackResolvedComponentes,
  DYNAMIC_MIN_COMPONENTE_ID,
} from "../utils/rackDynamicStorage"
import { useInventario } from "../context/InventarioContext"

const FAMILIAS = Object.keys(CATALOG_FAMILIAS_DYNAMIC)

/**
 * Panel admin: total U, catálogo por familia, añadir/quitar (solo si puertos sin bdRowId).
 */
function Caseta2AdminPanel({
  rackId,
  defaultTotalU,
  baseComponentes,
  onLayoutChange,
}) {
  const { puertos, resyncRackDynamicPuertos } = useInventario()
  const [totalInput, setTotalInput] = useState(() =>
    String(loadRackDynamicTotalU(rackId, defaultTotalU))
  )
  const [familia, setFamilia] = useState(FAMILIAS[0])
  const [msg, setMsg] = useState("")
  const [tick, setTick] = useState(0)

  const variantes = useMemo(
    () => CATALOG_FAMILIAS_DYNAMIC[familia] || [],
    [familia]
  )
  const [varianteIdx, setVarianteIdx] = useState(0)

  const componentes = useMemo(() => {
    const resolved = getRackResolvedComponentes(
      rackId,
      baseComponentes,
      defaultTotalU
    )
    return resolved
  }, [rackId, baseComponentes, defaultTotalU, tick])

  const bump = () => {
    setTick((t) => t + 1)
    onLayoutChange?.()
  }

  const puedeQuitar = (componenteId) => {
    const list = puertos.filter((p) => p.componenteId === Number(componenteId))
    if (list.length === 0) return true
    return list.every((p) => p.bdRowId == null)
  }

  const handleGuardarTotalU = () => {
    setMsg("")
    const r = setRackDynamicTotalUIfFits(
      rackId,
      totalInput,
      baseComponentes,
      defaultTotalU
    )
    if (!r.ok) {
      setMsg(r.error)
      return
    }
    resyncRackDynamicPuertos()
    bump()
  }

  const handleAnadir = () => {
    setMsg("")
    const tpl = variantes[varianteIdx]
    if (!tpl) return
    const r = addRackDynamicFromTemplate(
      rackId,
      tpl,
      baseComponentes,
      defaultTotalU
    )
    if (!r.ok) {
      setMsg(r.error)
      return
    }
    resyncRackDynamicPuertos()
    bump()
  }

  const handleQuitar = (id) => {
    setMsg("")
    if (!puedeQuitar(id)) {
      setMsg(
        "No se puede quitar: hay puertos con datos guardados en base de datos (bdRowId)."
      )
      return
    }
    if (Number(id) >= DYNAMIC_MIN_COMPONENTE_ID) {
      removeRackDynamicItem(rackId, id)
      resyncRackDynamicPuertos()
    } else {
      hideRackBaseComponent(rackId, id)
      onLayoutChange?.()
    }
    bump()
  }

  return (
    <div className="mt-6 max-w-xl mx-auto border border-gray-200 rounded-lg p-4 bg-gray-50 text-left">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">
        Configuración de rack (admin)
      </h2>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Total U del rack
          <input
            type="number"
            min={1}
            max={200}
            className="border rounded px-2 py-1 w-24 text-sm"
            value={totalInput}
            onChange={(e) => setTotalInput(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={handleGuardarTotalU}
          className="px-3 py-1.5 text-sm bg-[#1e3a5f] text-white rounded hover:bg-[#2d4a73]"
        >
          Aplicar total U
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Familia
          <select
            className="border rounded px-2 py-1 text-sm min-w-[140px]"
            value={familia}
            onChange={(e) => {
              setFamilia(e.target.value)
              setVarianteIdx(0)
            }}
          >
            {FAMILIAS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Modelo
          <select
            className="border rounded px-2 py-1 text-sm min-w-[180px]"
            value={varianteIdx}
            onChange={(e) => setVarianteIdx(Number(e.target.value))}
          >
            {variantes.map((v, i) => (
              <option key={v.nombre} value={i}>
                {v.nombre}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={handleAnadir}
          className="px-3 py-1.5 text-sm bg-emerald-700 text-white rounded hover:bg-emerald-800"
        >
          Añadir al rack
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        Los equipos se compactan de arriba abajo en el orden de alta. La
        configuración se guarda en este navegador (localStorage).
      </p>

      {msg && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">
          {msg}
        </p>
      )}

      <ul className="text-sm space-y-1">
        {componentes.length === 0 && (
          <li className="text-gray-400">Sin equipos dinámicos aún.</li>
        )}
        {componentes.map((c) => (
          <li
            key={c.id}
            className="flex justify-between items-center gap-2 border-b border-gray-100 py-1"
          >
            <span>
              {c.nombre}{" "}
              <span className="text-gray-400">
                (U{c.posicionInicio}, id {c.id})
              </span>
            </span>
            <button
              type="button"
              disabled={!puedeQuitar(c.id)}
              onClick={() => handleQuitar(c.id)}
              className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-200"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Caseta2AdminPanel
