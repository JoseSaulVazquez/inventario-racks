import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { racks, areas, getPuertosByComponenteId } from "../data/mockData"
import { findComponenteById } from "../utils/rackMerge"
import { useInventario } from "../context/InventarioContext"

function claseColorPorEstado(estado, isSelected) {
  const base =
    estado === "ocupado"
      ? "bg-emerald-500 hover:bg-emerald-400 text-white"
      : estado === "dañado"
        ? "bg-red-500 hover:bg-red-400 text-white"
        : "bg-gray-400 hover:bg-gray-300 text-gray-900"
  const ring = isSelected ? " ring-2 ring-amber-400 ring-offset-2 ring-offset-gray-600" : ""
  return base + ring
}

function ComponenteView() {
  const { componenteId } = useParams()
  const navigate = useNavigate()
  const { puertos, getIpComponente, updateIpComponente, deleteIpComponente } =
    useInventario()
  const [puertoSeleccionado, setPuertoSeleccionado] = useState(null)
  const [editandoIp, setEditandoIp] = useState(false)
  const [ipLocal, setIpLocal] = useState("")
  const [modalConfirm, setModalConfirm] = useState({
    open: false,
    mode: null, // "update" | "delete"
  })

  const componente = findComponenteById(componenteId)
  const puertosFiltrados = componente ? getPuertosByComponenteId(puertos, componente.id) : []
  const rack = componente ? racks.find((r) => r.id === componente.rackId) : null
  const area = rack ? areas.find((a) => a.id === rack.areaId) : null

  const puertoDetalle = puertoSeleccionado
    ? puertosFiltrados.find((p) => p.id === puertoSeleccionado.id)
    : null

  const ipActual = componente ? getIpComponente(componente.id) : null
  const tieneIpEnDb =
    ipActual != null && String(ipActual).trim().length > 0
  const esSwitch = componente?.nombre.toLowerCase().includes("switch")
  const esFibra = componente?.nombre.toLowerCase().includes("fibra")

  const iniciarEdicionIp = () => {
    setIpLocal(ipActual ?? "")
    setEditandoIp(true)
  }

  const ejecutarCambioIp = () => {
    if (!componente) return
    const v = ipLocal.trim()

    if (modalConfirm.mode === "delete") {
      deleteIpComponente(componente.id)
      setEditandoIp(false)
      return
    }

    // update / save
    if (v) {
      updateIpComponente(componente.id, v)
    }
    setEditandoIp(false)
  }

  const prepararConfirmActualizar = () => {
    if (!componente) return
    const v = ipLocal.trim()

    if (v) {
      setModalConfirm({ open: true, mode: "update" })
      return
    }

    // Si dejó vacío, interpreta como "eliminar" (solo si ya existía en BD).
    if (tieneIpEnDb) {
      setModalConfirm({ open: true, mode: "delete" })
    }
  }

  const prepararConfirmBorrar = () => {
    if (!componente || !tieneIpEnDb) return
    setModalConfirm({ open: true, mode: "delete" })
  }

  const puertosImpares = puertosFiltrados.filter((p) => p.numero % 2 === 1)
  const puertosPares = puertosFiltrados.filter((p) => p.numero % 2 === 0)

  if (!componente) {
    return (
      <div className="p-8 min-h-screen bg-white text-gray-600">Componente no encontrado.</div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      {modalConfirm.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
            <p className="text-gray-800 mb-4">
              {modalConfirm.mode === "delete"
                ? "Estas seguro que quieres eliminar la ip?"
                : "Estas seguro que quieres actualizar la ip?"}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setModalConfirm({ open: false, mode: null })}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalConfirm({ open: false, mode: null })
                  ejecutarCambioIp()
                }}
                className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#2d4a73] text-white font-medium rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => navigate(`/rack/${componente.rackId}`)}
          className="text-[#1e3a5f] hover:underline text-sm font-medium"
        >
          ← Volver al rack
        </button>
        <span className="text-gray-300 hidden sm:inline">|</span>
        <span className="text-gray-500 text-xs sm:text-sm truncate">
          {rack?.nombre} — {area?.nombre}
        </span>
      </div>

      <h1 className="text-[#1e3a5f] font-semibold text-base sm:text-lg lg:text-xl uppercase tracking-wide mb-2 break-words">
        {componente.nombre}
      </h1>
      <div className="h-0.5 w-24 bg-[#1e3a5f] mb-4 sm:mb-8" />

      <div className="bg-gray-600 rounded-lg p-4 sm:p-6 mb-4 sm:mb-8 max-w-3xl overflow-x-auto">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-start">
            {puertosImpares.map((puerto) => {
              const isSelected = puertoDetalle?.id === puerto.id
              return (
                <button
                  key={puerto.id}
                  type="button"
                  onClick={() => setPuertoSeleccionado(isSelected ? null : puerto)}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded transition ${claseColorPorEstado(puerto.estado, isSelected)}`}
                >
                  <span className="w-6 h-4 block" />
                  <span className="text-xs font-medium">{puerto.numero}</span>
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-start">
            {puertosPares.map((puerto) => {
              const isSelected = puertoDetalle?.id === puerto.id
              return (
                <button
                  key={puerto.id}
                  type="button"
                  onClick={() => setPuertoSeleccionado(isSelected ? null : puerto)}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded transition ${claseColorPorEstado(puerto.estado, isSelected)}`}
                >
                  <span className="w-6 h-4 block" />
                  <span className="text-xs font-medium">{puerto.numero}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-4 sm:gap-8">
        <div className="border border-gray-200 rounded-lg overflow-hidden min-w-0 w-full sm:w-auto sm:min-w-[280px] lg:min-w-[360px]">
          {puertoDetalle ? (
            <table className="w-full text-left text-sm">
              <tbody>
                <tr>
                  <td className="bg-[#1e3a5f] text-white px-4 py-3 font-medium w-40">Área</td>
                  <td className="bg-white text-gray-900 px-4 py-3 border-l border-gray-200">
                    {area?.nombre || "—"}
                  </td>
                </tr>
                <tr>
                  <td className="bg-[#1e3a5f] text-white px-4 py-3 font-medium">Conector</td>
                  <td className="bg-white text-gray-900 px-4 py-3 border-l border-gray-200">
                    {puertoDetalle.conector || puertoDetalle.conexionDestino || "—"}
                  </td>
                </tr>
                <tr>
                  <td className="bg-[#1e3a5f] text-white px-4 py-3 font-medium">Número</td>
                  <td className="bg-white text-gray-900 px-4 py-3 border-l border-gray-200">
                    {puertoDetalle.numero}
                  </td>
                </tr>
                {!esFibra && (
                  <>
                    <tr>
                      <td className="bg-[#1e3a5f] text-white px-4 py-3 font-medium">
                        Número Panel
                      </td>
                      <td className="bg-white text-gray-900 px-4 py-3 border-l border-gray-200">
                        {puertoDetalle.numeroPanel || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-[#1e3a5f] text-white px-4 py-3 font-medium">
                        Puerto Panel
                      </td>
                      <td className="bg-white text-gray-900 px-4 py-3 border-l border-gray-200">
                        {puertoDetalle.puertoPanel || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-[#1e3a5f] text-white px-4 py-3 font-medium">
                        Número Switch
                      </td>
                      <td className="bg-white text-gray-900 px-4 py-3 border-l border-gray-200">
                        {puertoDetalle.numeroSwitch || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-[#1e3a5f] text-white px-4 py-3 font-medium">
                        Puerto Switch
                      </td>
                      <td className="bg-white text-gray-900 px-4 py-3 border-l border-gray-200">
                        {puertoDetalle.puertoSwitch || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-[#1e3a5f] text-white px-4 py-3 font-medium">
                        Equipo Conectado
                      </td>
                      <td className="bg-white text-gray-900 px-4 py-3 border-l border-gray-200">
                        {puertoDetalle.equipoConectado || "—"}
                      </td>
                    </tr>
                  </>
                )}
                <tr>
                  <td className="bg-[#1e3a5f] text-white px-4 py-3 font-medium">Nombre</td>
                  <td className="bg-white text-gray-900 px-4 py-3 border-l border-gray-200">
                    {puertoDetalle.nombre || "—"}
                  </td>
                </tr>
                {esSwitch && (
                  <tr>
                    <td className="bg-[#1e3a5f] text-white px-4 py-3 font-medium">IP</td>
                    <td className="bg-white text-gray-900 px-4 py-3 border-l border-gray-200">
                      {puertoDetalle.ip || "—"}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="bg-[#1e3a5f] text-white px-4 py-3 font-medium">Notas</td>
                  <td className="bg-white text-gray-900 px-4 py-3 border-l border-gray-200">
                    {puertoDetalle.notas || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="bg-gray-50 px-4 py-8 text-center text-gray-500">
              Seleccione un puerto para ver la información
            </div>
          )}
        </div>

        <div className="flex flex-col items-stretch sm:items-start gap-2 w-full sm:w-auto">
          {componente.nombre.toLowerCase().includes("switch") && (
            <div className="flex items-center gap-2 flex-wrap">
              {editandoIp ? (
                <>
                  <span className="text-gray-600 text-sm">IP:</span>
                  <input
                    type="text"
                    value={ipLocal}
                    onChange={(e) => setIpLocal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && prepararConfirmActualizar()}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-36"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={prepararConfirmActualizar}
                    className="text-[#1e3a5f] text-sm font-medium"
                  >
                    {tieneIpEnDb ? "Actualizar" : "Guardar"}
                  </button>
                  {tieneIpEnDb && (
                    <button
                      type="button"
                      onClick={prepararConfirmBorrar}
                      className="text-red-600 text-sm font-medium hover:underline"
                    >
                      Borrar
                    </button>
                  )}
                </>
              ) : (
                <>
                  <span className="text-gray-600 text-sm">
                    IP: {tieneIpEnDb ? ipActual : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={iniciarEdicionIp}
                    className="text-[#1e3a5f] text-sm hover:underline"
                  >
                    Editar
                  </button>
                </>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => puertoDetalle && navigate(`/puerto/${puertoDetalle.id}`)}
            disabled={!puertoDetalle}
            className="w-full sm:w-auto py-2.5 px-6 bg-[#1e3a5f] hover:bg-[#2d4a73] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-sm uppercase tracking-wide rounded transition"
          >
            Gestionar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ComponenteView
