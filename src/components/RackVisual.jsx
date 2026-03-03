import ComponenteVisual from "./ComponenteVisual"

function RackVisual({ rack, componentes }) {
  const totalU = rack.totalU ?? 42

  if (componentes.length === 0) {
    return (
      <div className="bg-gray-700 p-4 rounded-lg shadow-xl w-full max-w-[380px] mx-auto border-2 border-black">
        <div className="flex">
          <div className="w-10 text-right pr-2 text-gray-500 text-xs py-2">1U</div>
          <div className="flex-1 border-t border-gray-600 bg-gray-700 h-10" />
        </div>
        <p className="text-center text-gray-400 text-sm mt-2">Sin componentes</p>
      </div>
    )
  }

  const maxU = Math.max(...componentes.map((c) => c.posicionInicio))
  const minU = Math.min(...componentes.map((c) => c.posicionInicio - c.alturaU + 1))
  const filas = []

  for (let i = maxU; i >= minU; i--) {
    const componente = componentes.find(
      (c) => i <= c.posicionInicio && i > c.posicionInicio - c.alturaU
    )

    filas.push(
      <div key={i} className="flex">
        <div className="w-10 text-right pr-2 text-gray-500 text-xs flex items-center justify-end">
          {i}U
        </div>
        <div className="flex-1 border-t border-gray-600 bg-gray-700 h-10 relative">
          {componente && i === componente.posicionInicio && (
            <ComponenteVisual componente={componente} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-xl w-full max-w-[380px] mx-auto border-2 border-black min-w-0">
      {filas}
    </div>
  )
}

export default RackVisual
