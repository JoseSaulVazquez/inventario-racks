import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { componentes, racks, areas } from "../data/mockData"
import { useInventario } from "../context/InventarioContext"

const ESTADOS = [
  { value: "libre", label: "Libre" },
  { value: "ocupado", label: "Ocupado" },
  { value: "dañado", label: "Dañado" },
]

function PuertoView() {
  const { puertoId } = useParams()
  const navigate = useNavigate()
  const { puertos, updatePuerto, getIpComponente } = useInventario()
  const [guardado, setGuardado] = useState(false)

  const puerto = puertos.find((p) => p.id === Number(puertoId))
  const componente = puerto ? componentes.find((c) => c.id === puerto.componenteId) : null
  const rack = componente ? racks.find((r) => r.id === componente.rackId) : null
  const area = rack ? areas.find((a) => a.id === rack.areaId) : null

  const [form, setForm] = useState({
    estado: "libre",
    conector: "",
    numeroPanel: "",
    puertoPanel: "",
    numeroSwitch: "",
    puertoSwitch: "",
    equipoConectado: "",
    nombre: "",
    notas: "",
  })

  useEffect(() => {
    if (puerto) {
      setForm({
        estado: puerto.estado || "libre",
        conector: puerto.conector || puerto.conexionDestino || "",
        numeroPanel: puerto.numeroPanel || "",
        puertoPanel: puerto.puertoPanel || "",
        numeroSwitch: puerto.numeroSwitch || "",
        puertoSwitch: puerto.puertoSwitch || "",
        equipoConectado: puerto.equipoConectado || "",
        nombre: puerto.nombre || "",
        notas: puerto.notas || "",
      })
    }
  }, [puerto])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setGuardado(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!puerto) return
    updatePuerto(puerto.id, {
      estado: form.estado,
      conector: form.conector,
      numeroPanel: form.numeroPanel,
      puertoPanel: form.puertoPanel,
      numeroSwitch: form.numeroSwitch,
      puertoSwitch: form.puertoSwitch,
      equipoConectado: form.equipoConectado,
      nombre: form.nombre,
      notas: form.notas,
    })
    setGuardado(true)
  }

  if (!puerto) {
    return (
      <div className="p-4 sm:p-8 text-gray-500 min-h-screen bg-white">Puerto no encontrado.</div>
    )
  }

  const ipComponente = componente ? getIpComponente(componente.id) : ""

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => navigate(`/componente/${componente?.id}`)}
          className="text-[#1e3a5f] hover:underline text-sm font-medium"
        >
          ← Volver al componente
        </button>
        <span className="text-gray-300 hidden sm:inline">|</span>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Gestionar puerto {puerto.numero}</h1>
        {componente && <span className="text-gray-500 text-xs sm:text-sm truncate">{componente.nombre}</span>}
      </div>

      <div className="max-w-2xl space-y-4 sm:space-y-6">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base sm:text-lg font-semibold text-[#1e3a5f]">Ubicación</h2>
          </div>
          <p className="px-4 sm:px-6 py-3 text-gray-700 text-sm sm:text-base break-words">
            {area?.nombre} → {rack?.nombre} → {componente?.nombre} (Puerto {puerto.numero})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#1e3a5f]">Editar información del puerto</h2>
            {guardado && (
              <span className="text-sm text-green-600">Guardado correctamente</span>
            )}
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
              >
                {ESTADOS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                <input
                  type="text"
                  value={area?.nombre || ""}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input
                  type="text"
                  value={puerto.numero}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conector</label>
                <input
                  type="text"
                  name="conector"
                  value={form.conector}
                  onChange={handleChange}
                  placeholder="Ej: B-19"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipo conectado</label>
                <input
                  type="text"
                  name="equipoConectado"
                  value={form.equipoConectado}
                  onChange={handleChange}
                  placeholder="Ej: PC Recepción, AP WiFi"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número Panel</label>
                <input
                  type="text"
                  name="numeroPanel"
                  value={form.numeroPanel}
                  onChange={handleChange}
                  placeholder="Ej: 1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puerto Panel</label>
                <input
                  type="text"
                  name="puertoPanel"
                  value={form.puertoPanel}
                  onChange={handleChange}
                  placeholder="Ej: 2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número Switch</label>
                <input
                  type="text"
                  name="numeroSwitch"
                  value={form.numeroSwitch}
                  onChange={handleChange}
                  placeholder="Ej: 1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puerto Switch</label>
                <input
                  type="text"
                  name="puertoSwitch"
                  value={form.puertoSwitch}
                  onChange={handleChange}
                  placeholder="Ej: 5"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Oficina Administración"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP</label>
              <input
                type="text"
                value={ipComponente}
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                name="notas"
                value={form.notas}
                onChange={handleChange}
                rows={3}
                placeholder="Notas adicionales..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#2d4a73] text-white font-medium rounded-lg transition"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PuertoView
