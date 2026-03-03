import { useNavigate } from "react-router-dom"

function ComponenteVisual({ componente }) {
  const navigate = useNavigate()
  const numPuertos = Math.min(componente.numPuertos ?? 8, 12)

  return (
    <div
      onClick={() => navigate(`/componente/${componente.id}`)}
      className="absolute left-0 right-0 bottom-0 bg-gray-500 text-white text-xs flex items-center justify-between gap-2 px-2 cursor-pointer border-l-4 border-transparent hover:border-[#1e3a5f] hover:bg-gray-400 transition group"
      style={{ height: `${componente.alturaU * 40}px` }}
    >
      <span className="font-medium truncate flex-1 text-center">{componente.nombre}</span>
      <div className="flex gap-0.5 flex-shrink-0">
        {Array.from({ length: numPuertos }).map((_, i) => (
          <span key={i} className="w-2 h-3 bg-gray-400 rounded-sm group-hover:bg-gray-300" />
        ))}
      </div>
    </div>
  )
}

export default ComponenteVisual
