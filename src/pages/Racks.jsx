import { useParams, useNavigate } from "react-router-dom"
import { areas, getRacksByAreaId } from "../data/mockData"

function Racks() {
  const { areaId } = useParams()
  const navigate = useNavigate()

  const area = areas.find((a) => a.id === Number(areaId))
  const racksFiltrados = getRacksByAreaId(areaId)

  if (!area) {
    return (
      <div className="p-4 sm:p-8 text-gray-500 min-h-screen bg-white">Área no encontrada.</div>
    )
  }

  const esPlanta = area.id === 8

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
    <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-[#1e3a5f] hover:underline text-sm font-medium"
          >
            ← Volver
          </button>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <h1 className="text-[#1e3a5f] font-semibold text-xl sm:text-2xl">{area.nombre}</h1>
    </div>
        <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-8 text-center sm:text-left">
          Seleccione el rack a gestionar
        </p>

        
      <div className="max-w-4xl mx-auto flex flex-col">
        <div
          className={
            esPlanta
              ? "flex-1 flex items-center justify-center"
              : "flex-1 flex items-start justify-start"
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-4xl">
            {racksFiltrados.map((rack) => (
              <div key={rack.id} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => navigate(`/rack/${rack.id}`)}
                  className="w-full flex flex-col items-center"
                >
                  <div className="w-full bg-gray-100 rounded-lg p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[140px] sm:min-h-[180px] mb-3 sm:mb-4">
                    <img
                      src="/Iconos/Rack.png"
                      alt={rack.nombre}
                      className="max-h-16 sm:max-h-20 lg:max-h-24 w-auto object-contain"
                    />
                  </div>
                  <span className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-[#1e3a5f] hover:bg-[#2d4a73] text-white font-medium text-xs sm:text-sm uppercase tracking-wide rounded transition block text-center">
                    {rack.nombre}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Racks
