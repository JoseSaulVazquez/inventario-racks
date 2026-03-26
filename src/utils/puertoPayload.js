import {
  nombreEsSwitchLikeBd,
  nombreEsNvr,
  nombreEsAccessPoint,
} from "../data/mockData"

/**
 * Construye el cuerpo JSON para /api/conexiones_red/upsert.
 */
export function buildPuertoPayload({
  form,
  componente,
  puerto,
  areaCodigo,
}) {
  if (!areaCodigo || !componente) return null

  const cn = String(componente.nombre || "").toLowerCase()
  const esFibra = cn.includes("fibra") && !cn.includes("poe")
  const esPoe = cn.includes("poe")
  const esSwitchLike = nombreEsSwitchLikeBd(componente.nombre)
  const esAP = nombreEsAccessPoint(componente.nombre)
  const esNvr = nombreEsNvr(componente.nombre)

  const normalizePuerto = (v, esPanel = false) => {
    if (v == null) return null
    const s = String(v).trim()
    if (!s) return null
    const digits = s.match(/(\d+)/)?.[1]
    if (!digits) return s
    const usaGuionPanel = esPanel && areaCodigo === "DORMITORIOS"
    return usaGuionPanel ? `P-${digits}` : `P${digits}`
  }

  if (esAP) {
    return {
      area: areaCodigo,
      nombre: null,
      estado: form.estado || "libre",
      conector: null,
      ip: form.ip || null,
      numero_switch: form.numeroSwitch || null,
      puerto_switch: normalizePuerto(form.puertoSwitch, false),
      numero_panel: null,
      puerto_panel: null,
      equipo_conectado: null,
      notas: form.notas || null,
      poe_puerto: null,
      numero_nvr: null,
      nvr_puerto: null,
    }
  }

  const poePuertoVal =
    esPoe && form.poePuerto != null && String(form.poePuerto).trim() !== ""
      ? String(form.poePuerto).trim()
      : esPoe
        ? String(puerto?.numero ?? "")
        : null

  return {
    area: areaCodigo,
    nombre: form.nombre || null,
    estado: form.estado,
    conector: form.conector || null,
    ip: esSwitchLike ? form.ip || null : null,
    numero_switch: esFibra ? null : form.numeroSwitch || null,
    puerto_switch: esFibra ? null : normalizePuerto(form.puertoSwitch, false),
    numero_panel: esFibra ? null : form.numeroPanel || null,
    puerto_panel: esFibra ? null : normalizePuerto(form.puertoPanel, true),
    equipo_conectado: esFibra ? null : form.equipoConectado || null,
    notas: form.notas || null,
    poe_puerto: esPoe ? String(poePuertoVal) : null,
    numero_nvr:
      esNvr && form.numeroNvr != null && String(form.numeroNvr).trim() !== ""
        ? String(form.numeroNvr).trim()
        : null,
    nvr_puerto:
      esNvr && form.nvrPuerto != null && String(form.nvrPuerto).trim() !== ""
        ? normalizePuerto(form.nvrPuerto, false)
        : null,
  }
}
