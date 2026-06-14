import type { Paciente, Riesgo, EstadoEtapa, EstadoCita, EstadoDocumento, RutaDiagnostica } from '../types'

// ===================================================================
// Estado de avance de la ruta diagnóstica.
// Mide el avance OPERATIVO para detectar retrasos y activar
// acompañamiento. NO es valoración clínica ni diagnóstico médico.
// No usa imágenes, biopsias ni resultados de laboratorio.
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
  const etapaFinal =
    p.etapaActual === 'Cita diagnóstica' ||
    p.etapaActual === 'Cita diagnóstica / indicación médica'

  // ---- ROJO: Retraso prioritario ----
  if (p.diasSinAvance > 7) motivos.push(`Más de 7 días sin avance (${p.diasSinAvance}).`)
  if (p.citaPerdida) motivos.push('Perdió una cita importante.')
  if (!tieneProximaCita && !etapaFinal)
    motivos.push('No tiene una próxima cita programada.')
  if (alertaRojaAbierta) motivos.push('Tiene una alerta de retraso sin atender.')
  if (motivos.length > 0) return { nivel: 'rojo', motivos }

  // ---- AMARILLO: Posible retraso ----
  if (docsCriticosPendientes) motivos.push('Tiene documentos importantes pendientes.')
  if (p.diasSinAvance >= 3 && p.diasSinAvance <= 7)
    motivos.push(`Entre 3 y 7 días sin avance (${p.diasSinAvance}).`)
  if (p.esProvincia && docsCriticosPendientes)
    motivos.push('Viene de provincia con documentos incompletos.')
  if (!p.cuidador && p.bajaAlfabetizacion)
    motivos.push('Sin cuidador y con baja alfabetización digital.')
  if (motivos.length > 0) return { nivel: 'amarillo', motivos }

  // ---- VERDE: Avance normal ----
  motivos.push('Avance normal: documentos completos y próxima acción programada.')
  return { nivel: 'verde', motivos }
}

// Alias con nuevo nombre de cara al código nuevo
export const evaluarEstadoAvance = evaluarRiesgo

// Evaluación del estado de avance de una ruta específica (no necesariamente la activa)
export function evaluarEstadoAvanceRuta(
  ruta: RutaDiagnostica,
  personales: {
    esProvincia: boolean
    bajaAlfabetizacion: boolean
    cuidador?: { estado: string } | undefined
  },
): EvaluacionRiesgo {
  if (ruta.estadoRuta === 'Finalizada') {
    return { nivel: 'verde', motivos: ['Ruta finalizada correctamente.'] }
  }
  if (ruta.estadoRuta === 'Pausada') {
    return { nivel: 'amarillo', motivos: ['Ruta en pausa.'] }
  }

  const motivos: string[] = []
  const docsCriticosPendientes = ruta.documentos.some(
    (d) => d.obligatorio && (d.estado === 'Pendiente' || d.estado === 'Observado'),
  )
  const tieneProximaCita = ruta.citas.some(
    (c) => c.estado === 'Programada' || c.estado === 'Confirmada',
  )
  const alertaRojaAbierta = ruta.alertas.some(
    (a) => a.nivel === 'rojo' && (a.estado === 'Nueva' || a.estado === 'Vista'),
  )
  const citaPerdida = ruta.citas.some((c) => c.estado === 'Perdida')
  const etapaFinal =
    ruta.etapaActual === 'Cita diagnóstica' ||
    ruta.etapaActual === 'Cita diagnóstica / indicación médica'

  if (ruta.diasSinAvance > 7) motivos.push(`Más de 7 días sin avance (${ruta.diasSinAvance}).`)
  if (citaPerdida) motivos.push('Perdió una cita importante.')
  if (!tieneProximaCita && !etapaFinal)
    motivos.push('No tiene una próxima cita programada.')
  if (alertaRojaAbierta) motivos.push('Tiene una alerta de retraso sin atender.')
  if (motivos.length > 0) return { nivel: 'rojo', motivos }

  if (docsCriticosPendientes) motivos.push('Tiene documentos importantes pendientes.')
  if (ruta.diasSinAvance >= 3 && ruta.diasSinAvance <= 7)
    motivos.push(`Entre 3 y 7 días sin avance (${ruta.diasSinAvance}).`)
  if (personales.esProvincia && docsCriticosPendientes)
    motivos.push('Viene de provincia con documentos incompletos.')
  if (!personales.cuidador && personales.bajaAlfabetizacion)
    motivos.push('Sin cuidador y con baja alfabetización digital.')
  if (motivos.length > 0) return { nivel: 'amarillo', motivos }

  motivos.push('Avance normal: documentos completos y próxima acción programada.')
  return { nivel: 'verde', motivos }
}

// ---- Etiquetas y estilos por estado de avance ----
export const RIESGO_META: Record<Riesgo, { label: string; icono: string; clase: string; punto: string }> = {
  verde: { label: 'Avance normal', icono: '✓', clase: 'bg-exito/12 text-exito', punto: 'bg-exito' },
  amarillo: { label: 'Posible retraso', icono: '!', clase: 'bg-precaucion/15 text-[#9a7400]', punto: 'bg-precaucion' },
  rojo: { label: 'Retraso prioritario', icono: '⚠', clase: 'bg-riesgo/12 text-riesgo', punto: 'bg-riesgo' },
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
