import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { racks, areas } from "../data/mockData"
import { findComponenteById } from "../utils/rackMerge"
import { useInventario } from "../context/InventarioContext"

const ESTADOS = [
  { value: "libre", label: "Libre" },
  { value: "ocupado", label: "Ocupado" },
  { value: "dañado", label: "Dañado" },
]

function PuertoView() {
  const { puertoId } = useParams()
  const navigate = useNavigate()
  const { puertos, updatePuerto, refrescarPuertosDesdeBD } = useInventario()
  const [guardado, setGuardado] = useState(false)
  const [mensajeModal, setMensajeModal] = useState("")

  const puerto = puertos.find((p) => p.id === Number(puertoId))
  const componente = puerto ? findComponenteById(puerto.componenteId) : null
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
    ip: "",
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
        ip: puerto.ip || "",
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
    ;(async () => {
      const areaCodigo =
        area?.codigoBd ? String(area.codigoBd).trim().toUpperCase() : null
      if (!areaCodigo) return

      const normalizePuerto = (v, esPanel = false) => {
        if (v == null) return null
        const s = String(v).trim()
        if (!s) return null
        const digits = s.match(/(\d+)/)?.[1]
        if (!digits) return s
        // En DORMITORIOS, BD guarda puerto_panel con formato "P-13".
        const usaGuionPanel = esPanel && areaCodigo === "DORMITORIOS"
        return usaGuionPanel ? `P-${digits}` : `P${digits}`
      }

      const payload = {
        area: areaCodigo,
        nombre: form.nombre || null,
        estado: form.estado,
        conector: form.conector || null,
        // IP editable en el formulario: solo aplica a puertos de Switch.
        ip: esSwitch ? form.ip || null : null,
        numero_switch: esFibra ? null : form.numeroSwitch || null,
        puerto_switch: esFibra ? null : normalizePuerto(form.puertoSwitch, false),
        numero_panel: esFibra ? null : form.numeroPanel || null,
        puerto_panel: esFibra ? null : normalizePuerto(form.puertoPanel, true),
        equipo_conectado: esFibra ? null : form.equipoConectado || null,
        notas: form.notas || null,
      }

      const res = await fetch("/api/conexiones_red/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      }).catch(() => null)

      if (!res || !res.ok) {
        setMensajeModal("Error al guardar en la base de datos")
        setGuardado(true)
        return
      }

      // actualizar UI local
      updatePuerto(puerto.id, {
        estado: form.estado,
        conector: form.conector || null,
        numeroPanel: esFibra ? null : form.numeroPanel || null,
        puertoPanel: esFibra ? null : normalizePuerto(form.puertoPanel, true),
        numeroSwitch: esFibra ? null : form.numeroSwitch || null,
        puertoSwitch: esFibra ? null : normalizePuerto(form.puertoSwitch),
        equipoConectado: esFibra ? null : form.equipoConectado || null,
        nombre: form.nombre || null,
        notas: form.notas || null,
        ip: esSwitch ? form.ip || null : null,
      })

      refrescarPuertosDesdeBD()
      setMensajeModal("Los datos fueron guardados correctamente")
      setGuardado(true)
    })()
  }

  if (!puerto) {
    return (
      <div className="p-4 sm:p-8 text-gray-500 min-h-screen bg-white">Puerto no encontrado.</div>
    )
  }

  const esSwitch = componente?.nombre.toLowerCase().includes("switch")
  const esFibra = componente?.nombre.toLowerCase().includes("fibra")

  const bdRowId = puerto?.bdRowId ?? null
  const tieneFilaBd = bdRowId != null

  const getAuthHeaders = () => {
    const token = localStorage.getItem("auth-token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const EQUIPO_CONECTADO_OPTIONS = [
    { value: "PC", label: "PC" },
    { value: "Impresora", label: "Impresora" },
    { value: "Control de Acceso", label: "Control de Acceso" },
    { value: "Camara", label: "Camara" },
    { value: "teléfono", label: "teléfono" },
    { value: "Otro", label: "Otro" },
  ]

  const equipoConectadoEsOpcion =
    EQUIPO_CONECTADO_OPTIONS.some(
      (o) => o.value === form.equipoConectado && o.value !== "Otro"
    )

  const equipoConectadoSelectValue = equipoConectadoEsOpcion
    ? form.equipoConectado
    : form.equipoConectado
      ? "Otro"
      : ""

  const normalizePuerto = (v, esPanel = false) => {
    if (v == null) return null
    const s = String(v).trim()
    if (!s) return null
    const digits = s.match(/(\d+)/)?.[1]
    if (!digits) return s

    // En DORMITORIOS, BD guarda puerto_panel con formato "P-13".
    const usaGuionPanel = esPanel && areaCodigo === "DORMITORIOS"

    return usaGuionPanel ? `P-${digits}` : `P${digits}`
  }

  const areaCodigo = area?.codigoBd ? String(area.codigoBd).trim().toUpperCase() : null

  const construirPayload = () => ({
    area: areaCodigo,
    nombre: form.nombre || null,
    estado: form.estado,
    conector: form.conector || null,
    ip: esSwitch ? form.ip || null : null,
    numero_switch: esFibra ? null : form.numeroSwitch || null,
    puerto_switch: esFibra ? null : normalizePuerto(form.puertoSwitch),
    numero_panel: esFibra ? null : form.numeroPanel || null,
    puerto_panel: esFibra ? null : normalizePuerto(form.puertoPanel, true),
    equipo_conectado: esFibra ? null : form.equipoConectado || null,
    notas: form.notas || null,
  })

  return (
    <>
      {guardado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
            <p className="text-gray-800 mb-4">{mensajeModal || "Los datos fueron guardados correctamente"}</p>
            <button
              type="button"
              onClick={() => setGuardado(false)}
              className="px-6 py-2 bg-[#1e3a5f] hover:bg-[#2d4a73] text-white font-medium rounded"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

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

            <div
              className={
                esFibra
                  ? "grid grid-cols-1 gap-4"
                  : "grid grid-cols-1 sm:grid-cols-2 gap-4"
              }
            >
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
              {!esFibra && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipo conectado
                  </label>
                  <select
                    value={equipoConectadoSelectValue}
                    onChange={(e) => {
                      const v = e.target.value
                      setForm((prev) => ({
                        ...prev,
                        equipoConectado:
                          v === "Otro"
                            ? prev.equipoConectado || "Otro"
                            : v,
                      }))
                      setGuardado(false)
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                  >
                    <option value="">—</option>
                    {EQUIPO_CONECTADO_OPTIONS.filter((o) => o.value !== "Otro").map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                    <option value="Otro">Otro</option>
                  </select>

                  {equipoConectadoSelectValue === "Otro" && (
                    <input
                      type="text"
                      value={form.equipoConectado}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          equipoConectado: e.target.value,
                        }))
                        setGuardado(false)
                      }}
                      placeholder="Escribe la opción (ej: UPS, Telefonía IP...)"
                      className="w-full mt-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                    />
                  )}
                </div>
              )}
            </div>

            {!esFibra && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número Panel
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puerto Panel
                  </label>
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
            )}

            {!esFibra && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número Switch
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puerto Switch
                  </label>
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
            )}

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

            {esSwitch && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP</label>
                <input
                  type="text"
                  name="ip"
                  value={form.ip}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900"
                />
              </div>
            )}

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

            <div className="pt-2 flex flex-wrap gap-2">
              {tieneFilaBd ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (!puerto || bdRowId == null) return
                      ;(async () => {
                        const payload = { ...construirPayload(), id: bdRowId }
                        const res = await fetch("/api/conexiones_red/upsert", {
                          method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          ...getAuthHeaders(),
                        },
                          body: JSON.stringify(payload),
                        }).catch(() => null)

                        if (!res || !res.ok) {
                          setMensajeModal("Error al actualizar en la base de datos")
                          setGuardado(true)
                          return
                        }

                        refrescarPuertosDesdeBD()
                        setMensajeModal("Los datos del puerto fueron actualizados correctamente")
                        setGuardado(true)
                      })()
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
                  >
                    Actualizar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!puerto || bdRowId == null) return
                      ;(async () => {
                        const res = await fetch("/api/conexiones_red/delete", {
                          method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          ...getAuthHeaders(),
                        },
                          body: JSON.stringify({ id: bdRowId }),
                        }).catch(() => null)

                        if (!res || !res.ok) {
                          setMensajeModal("Error al eliminar en la base de datos")
                          setGuardado(true)
                          return
                        }

                        refrescarPuertosDesdeBD()
                        setMensajeModal("El puerto fue eliminado correctamente")
                        setGuardado(true)
                      })()
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition"
                  >
                    Borrar
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#1e3a5f] hover:bg-[#2d4a73] text-white font-medium rounded-lg transition"
                >
                  Guardar
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}

export default PuertoView
