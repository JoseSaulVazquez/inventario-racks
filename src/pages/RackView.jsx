import { useParams, useNavigate } from "react-router-dom"
import { racks, areas, getComponentesByRackId } from "../data/mockData"
import RackVisual from "../components/RackVisual"

function RackView() {
  const { rackId } = useParams()
  const navigate = useNavigate()

  const rack = racks.find((r) => r.id === Number(rackId))
  const area = rack ? areas.find((a) => a.id === rack.areaId) : null
  const componentesFiltrados = rack ? getComponentesByRackId(rack.id) : []

  const handleVolver = () => {
    if (!area) {
      navigate("/")
      return
    }
    if (area.id >= 1 && area.id <= 4) navigate("/oficinas")
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
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <RackVisual rack={rack} componentes={componentesFiltrados} />
      </div>
    </div>
  )
}

export default RackView
