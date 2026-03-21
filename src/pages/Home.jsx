import { useNavigate } from "react-router-dom"
import { ubicacionesPrincipales, ubicacionToRackId, ubicacionToAreaId } from "../data/mockData"

const ICONOS_IMG = {
  oficinas: "/Iconos/Oficinas.png",
  casetas: "/Iconos/Caseta.png",
  comedor: "/Iconos/Comedor.png",
  planta: "/Iconos/Planta.png",
  mantenimiento: "/Iconos/Mantenimiento.png",
  dormitorios: "/Iconos/Hotel.png",
}

function Home() {
  const navigate = useNavigate()

  const handleUbicacion = (ubicacion) => {
    if (ubicacion.id === "oficinas") {
      navigate("/oficinas")
      return
    }
    if (ubicacion.id === "casetas") {
      navigate("/casetas")
      return
    }
    const rackId = ubicacionToRackId[ubicacion.id]
    if (rackId != null) {
      navigate(`/rack/${rackId}`)
      return
    }
    const areaId = ubicacionToAreaId[ubicacion.id]
    if (areaId != null) {
      navigate(`/racks/${areaId}`)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {ubicacionesPrincipales.map((ubicacion) => (
            <div key={ubicacion.id} className="flex flex-col items-center">
              <div className="w-full border border-gray-200 rounded-lg bg-white p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] mb-3 sm:mb-4">
                <img
                  src={ICONOS_IMG[ubicacion.id] || ICONOS_IMG.oficinas}
                  alt={ubicacion.nombre}
                  className="max-h-14 sm:max-h-16 lg:max-h-20 w-auto object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => handleUbicacion(ubicacion)}
                className="w-full py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm uppercase tracking-wide text-white rounded bg-[#1e3a5f] hover:bg-[#2d4a73] cursor-pointer transition"
              >
                {ubicacion.nombre}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
