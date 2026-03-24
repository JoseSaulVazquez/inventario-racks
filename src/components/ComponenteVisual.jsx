import { useNavigate } from "react-router-dom"
import { useInventario } from "../context/InventarioContext"
import { getPuertosByComponenteId } from "../data/mockData"

function miniColor(estado) {
  if (estado === "ocupado") return "bg-emerald-500"
  if (estado === "dañado") return "bg-red-500"
  return "bg-gray-400"
}

function ComponenteVisual({ componente }) {
  const navigate = useNavigate()
  const { puertos } = useInventario()
  const lista = getPuertosByComponenteId(puertos, componente.id)
    .slice()
    .sort((a, b) => a.numero - b.numero)

  const cap = 24
  const maxShow = Math.min(lista.length > 0 ? lista.length : cap, cap)
  const muestra =
    lista.length > 0
      ? lista.slice(0, maxShow)
      : Array.from(
          {
            length: Math.min(componente.numPuertos ?? 8, 12),
          },
          () => ({ estado: "libre" })
        )

  return (
    <div
      onClick={() => navigate(`/componente/${componente.id}`)}
      className="absolute left-0 right-0 bottom-0 bg-gray-500 text-white text-xs flex items-center justify-between gap-2 px-2 cursor-pointer border-l-4 border-transparent hover:border-[#1e3a5f] hover:bg-gray-400 transition group"
      style={{ height: `${componente.alturaU * 40}px` }}
    >
      <span className="font-medium truncate flex-1 text-center">{componente.nombre}</span>
      <div className="flex flex-wrap gap-0.5 justify-end content-center max-w-[100px] flex-shrink-0">
        {muestra.map((p, i) => (
          <span
            key={lista.length > 0 ? p.id : i}
            className={`w-1.5 h-2.5 rounded-sm flex-shrink-0 ${miniColor(p.estado)}`}
            title={lista.length > 0 ? `Puerto ${p.numero}: ${p.estado}` : undefined}
          />
        ))}
      </div>
    </div>
  )
}

export default ComponenteVisual
