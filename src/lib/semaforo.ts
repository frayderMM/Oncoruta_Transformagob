import type { Paciente, Riesgo, EstadoEtapa, EstadoCita, EstadoDocumento } from '../types'

// ===================================================================
// Reglas del semáforo de riesgo (sección 21)
// Mide RIESGO OPERATIVO de demora o pérdida de seguimiento.
// NO es riesgo clínico. No usa imágenes, biopsias ni resultados.
// ===================================================================

export interface EvaluacionRiesgo {
  nivel: Riesgo
  motivos: string[]
}

export function evaluarRiesgo(p: Paciente): EvaluacionRiesgo {
  const motivos: string[] = []
  const docsCriticosPendientes = p.documentos.some(
    (d) => d.obligatorio && (d.estado === 'Pendiente' || d.estado === 'Observado'),
  )
  const tieneProximaCita = p.citas.some(
    (c) => c.estado === 'Programada' || c.estado === 'Confirmada',
  )
  const alertaRojaAbierta = p.alertas.some(
    (a) => a.nivel === 'rojo' && (a.estado === 'Nueva' || a.estado === 'Vista'),
  )

  // ---- ROJO: riesgo alto de demora o abandono ----
  if (p.diasSinAvance > 7) motivos.push(`Más de 7 días sin avance (${p.diasSinAvance}).`)
  if (p.citaPerdida) motivos.push('Perdió una cita importante.')
  if (!tieneProximaCita && p.etapaActual !== 'Cita diagnóstica')
    motivos.push('No tiene una próxima cita programada.')
  if (alertaRojaAbierta) motivos.push('Tiene una alerta roja sin atender.')
  if (motivos.length > 0) return { nivel: 'rojo', motivos }

  // ---- AMARILLO: posible demora o barrera ----
  if (docsCriticosPendientes) motivos.push('Tiene documentos importantes pendientes.')
  if (p.diasSinAvance >= 3 && p.diasSinAvance <= 7)
    motivos.push(`Entre 3 y 7 días sin avance (${p.diasSinAvance}).`)
  if (p.esProvincia && docsCriticosPendientes)
    motivos.push('Viene de provincia con documentos incompletos.')
  if (!p.cuidador && p.bajaAlfabetizacion)
    motivos.push('Sin cuidador y con baja alfabetización digital.')
  if (motivos.length > 0) return { nivel: 'amarillo', motivos }

  // ---- VERDE: avance normal ----
  motivos.push('Avance normal: documentos completos y próxima acción programada.')
  return { nivel: 'verde', motivos }
}

// ---- Etiquetas y estilos por nivel de riesgo (color + texto + icono) ----
export const RIESGO_META: Record<Riesgo, { label: string; icono: string; clase: string; punto: string }> = {
  verde: { label: 'Avance normal', icono: '✓', clase: 'bg-exito/12 text-exito', punto: 'bg-exito' },
  amarillo: { label: 'Posible demora', icono: '!', clase: 'bg-precaucion/15 text-[#9a7400]', punto: 'bg-precaucion' },
  rojo: { label: 'Riesgo alto', icono: '⚠', clase: 'bg-riesgo/12 text-riesgo', punto: 'bg-riesgo' },
}

export const MENSAJE_PACIENTE: Record<Riesgo, string> = {
  verde: 'Tu proceso está avanzando. Revisa tu próxima cita y tus documentos.',
  amarillo: 'Hay algo pendiente que debemos resolver para que tu atención continúe.',
  rojo: 'Necesitamos ayudarte a continuar tu proceso. El INEN se pondrá en contacto contigo.',
}

// ---- Estilos de estado de etapa ----
export const ETAPA_META: Record<EstadoEtapa, { icono: string; clase: string }> = {
  Completado: { icono: '✓', clase: 'bg-exito/12 text-exito border-exito/30' },
  'En proceso': { icono: '◐', clase: 'bg-marca-50 text-marca-600 border-marca-200' },
  Pendiente: { icono: '○', clase: 'bg-black/5 text-tinta/50 border-black/10' },
  Observado: { icono: '!', clase: 'bg-precaucion/15 text-[#9a7400] border-precaucion/40' },
  Reprogramado: { icono: '↻', clase: 'bg-ayuda/10 text-ayuda border-ayuda/30' },
  Atrasado: { icono: '⚠', clase: 'bg-riesgo/12 text-riesgo border-riesgo/30' },
}

// ---- Estilos de estado de cita ----
export const CITA_META: Record<EstadoCita, { clase: string }> = {
  Programada: { clase: 'bg-marca-50 text-marca-600' },
  Confirmada: { clase: 'bg-exito/12 text-exito' },
  Realizada: { clase: 'bg-black/5 text-tinta/60' },
  Perdida: { clase: 'bg-riesgo/12 text-riesgo' },
  Reprogramada: { clase: 'bg-ayuda/10 text-ayuda' },
  'Pendiente de programación': { clase: 'bg-precaucion/15 text-[#9a7400]' },
}

// ---- Estilos de estado de documento ----
export const DOC_META: Record<EstadoDocumento, { icono: string; clase: string }> = {
  Recibido: { icono: '✓', clase: 'bg-exito/12 text-exito' },
  Pendiente: { icono: '○', clase: 'bg-precaucion/15 text-[#9a7400]' },
  Observado: { icono: '!', clase: 'bg-riesgo/12 text-riesgo' },
  'No aplica': { icono: '–', clase: 'bg-black/5 text-tinta/50' },
}

export function accionRecomendadaINEN(p: Paciente): string {
  const ev = evaluarRiesgo(p)
  if (ev.nivel === 'rojo') return 'Llamada prioritaria'
  if (ev.nivel === 'amarillo') {
    if (p.documentos.some((d) => d.obligatorio && d.estado !== 'Recibido' && d.estado !== 'No aplica'))
      return 'Orientar sobre documento'
    return 'Enviar recordatorio'
  }
  return 'Recordatorio'
}
