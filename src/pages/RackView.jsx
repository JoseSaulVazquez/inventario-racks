import { useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { racks, areas, getComponentesByRackId } from "../data/mockData"
import { getComponentesForRack } from "../utils/rackMerge"
import { loadRackDynamicTotalU } from "../utils/rackDynamicStorage"
import RackVisual from "../components/RackVisual"
import Caseta2AdminPanel from "../components/Caseta2AdminPanel"

function RackView() {
  const { rackId } = useParams()
  const navigate = useNavigate()
  const [layoutTick, setLayoutTick] = useState(0)
  const [mostrarConfig, setMostrarConfig] = useState(false)

  const rack = racks.find((r) => r.id === Number(rackId))
  const area = rack ? areas.find((a) => a.id === rack.areaId) : null

  const onLayoutChange = useCallback(() => setLayoutTick((t) => t + 1), [])

  const rackParaVisual =
    rack && rack.id
      ? { ...rack, totalU: loadRackDynamicTotalU(rack.id, rack.totalU) }
      : rack

  const componentesFiltrados = rack
    ? getComponentesForRack(rack.id)
    : []

  const baseComponentes = rack ? getComponentesByRackId(rack.id) : []

  const handleVolver = () => {
    if (!area) {
      navigate("/")
      return
    }
    if (area.id >= 1 && area.id <= 4) navigate("/oficinas")
    else if (area.id === 5) navigate("/casetas")
    else if (area.id === 8) navigate("/racks/8")
    else navigate("/")
  }

  if (!rack) {
    return (
      <div className="p-8 min-h-screen bg-white text-gray-600">Rack no encontrado.</div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-4 flex-wrap">
        <button
          type="button"
          onClick={handleVolver}
          className="text-[#1e3a5f] hover:underline text-sm font-medium"
        >
          ← Volver
        </button>
        <span className="text-gray-300 hidden sm:inline">|</span>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">{rack.nombre}</h1>
        {area && <span className="text-gray-500 text-xs sm:text-sm">{area.nombre}</span>}
      </div>
      <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">
        Seleccione un componente del rack para ver sus puertos
      </p>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="relative w-full lg:w-[420px]">
          <button
            type="button"
            onClick={() => setMostrarConfig((v) => !v)}
            className="absolute -right-3 top-2 z-10 h-10 w-10 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50 flex items-center justify-center"
            aria-label="Abrir configuración del rack"
          >
            <img
              src="/Iconos/engranaje.png"
              alt="Config"
              className="h-5 w-5 object-contain"
            />
          </button>

          <div
            className="overflow-x-auto -mx-4 sm:mx-0"
            key={layoutTick}
          >
            <RackVisual rack={rackParaVisual} componentes={componentesFiltrados} />
          </div>
        </div>

        <div className="w-full lg:flex-1">
          {mostrarConfig && rack ? (
            <Caseta2AdminPanel
              rackId={rack.id}
              defaultTotalU={rack.totalU}
              baseComponentes={baseComponentes}
              onLayoutChange={onLayoutChange}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default RackView
