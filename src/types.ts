// ===================================================================
// Modelo de datos OncoRuta Mujer IA
// IMPORTANTE: ningún campo guarda diagnóstico, pronóstico ni decisión
// clínica. Solo información administrativa y de navegación.
// ===================================================================

export type Rol = 'paciente' | 'cuidador' | 'inen' | 'admin'

export type Riesgo = 'verde' | 'amarillo' | 'rojo'

export type Sospecha = 'Mama' | 'Cérvix'

export type Idioma = 'es' | 'qu'

export type TipoIngreso = 'Primera vez' | 'Reingreso' | 'Nueva sospecha' | 'Control'

export type EstadoRuta = 'Activa' | 'Finalizada' | 'Pausada' | 'Reabierta'

export type NombreEtapa =
  // Ruta Primera vez / Nueva sospecha
  | 'Admisión'
  | 'Historia clínica'
  | 'Primera cita'
  | 'Exámenes'
  | 'Informe'
  | 'Cita diagnóstica'
  // Ruta Reingreso / Control
  | 'Reingreso'
  | 'Validación de datos y documentos'
  | 'Programación de cita'
  | 'Evaluación médica'
  | 'Cita diagnóstica / indicación médica'

export type EstadoEtapa =
  | 'Pendiente'
  | 'En proceso'
  | 'Completado'
  | 'Observado'
  | 'Reprogramado'
  | 'Atrasado'

// Tipos auxiliares para tablas de detalle por etapa (sin datos clínicos)
export interface CampoDetalle {
  label: string
  value: string
}

export interface CitaRelacionada {
  fecha: string
  hora: string
  tipo: string
  servicio: string
  lugar: string
  estado: string
  observacion: string
}

export interface EstudioRealizado {
  fecha: string
  estudio: string
  servicio: string
  estado: string
  documentoAsociado: string
  observacion: string
}

export interface InformeDisponible {
  fecha: string
  tipoInforme: string
  servicio: string
  estado: string
  resumenSeguro: string
}

export interface RegistroHistoriaClinica {
  fecha: string
  tipoRegistro: string
  servicioArea: string
  descripcion: string
  estado: string
}

export interface RegistroSeguimiento {
  fecha: string
  accion: string
  responsable: string
  canal: string
  resultado: string
}

export interface DocumentoRuta {
  id: string
  nombre: string
  etapa: string
  fecha: string
  estado: string
  imagenUrl?: string
}

// Información detallada de una etapa completada (solo informativo, sin datos clínicos)
export interface DetalleEtapa {
  // Campos comunes (opcionales para etapas con visualización especial)
  fechaInicio?: string
  fechaFin?: string
  lugarServicio: string
  responsableArea: string
  resumenPaciente: string
  documentos: string[]
  accionesRealizadas: string[]
  proximoPasoDetalle: string
  // Secciones específicas por etapa
  datosAdmision?: CampoDetalle[]
  datosHistoriaClinica?: CampoDetalle[]
  citasRelacionadas?: CitaRelacionada[]
  estudiosRealizados?: EstudioRealizado[]
  informesDisponibles?: InformeDisponible[]
  resumenCierreRuta?: CampoDetalle[]
  // Historia clínica
  codigoHistoriaClinica?: string
  fechaRegistro?: string
  ultimaActualizacion?: string
  estadoHistoriaClinica?: string
  registroAsociadoRuta?: string
  registrosAsociados?: RegistroHistoriaClinica[]
}

export interface Etapa {
  nombre: NombreEtapa
  orden: number
  estado: EstadoEtapa
  fecha?: string
  descripcionSimple: string
  detalle?: DetalleEtapa
}

export type EstadoDocumento = 'Recibido' | 'Pendiente' | 'Observado' | 'No aplica'

export interface Documento {
  id: string
  nombre: string
  etapa: NombreEtapa | 'General'
  estado: EstadoDocumento
  observacion: string
  obligatorio: boolean
}

export type TipoCita = 'Primera cita' | 'Examen' | 'Cita diagnóstica'

export type EstadoCita =
  | 'Programada'
  | 'Confirmada'
  | 'Realizada'
  | 'Perdida'
  | 'Reprogramada'
  | 'Pendiente de programación'

export interface Cita {
  id: string
  tipo: TipoCita
  servicio: string
  fecha: string
  hora: string
  lugar: string
  estado: EstadoCita
  indicaciones: string
  documentos: string[]
}

export type NivelAlerta = Riesgo
export type EstadoAlerta = 'Nueva' | 'Vista' | 'Entendida' | 'Atendida' | 'Vencida'

export interface Alerta {
  id: string
  tipo: 'documento' | 'cita' | 'demora' | 'cuidador' | 'sistema'
  nivel: NivelAlerta
  mensaje: string
  accionRecomendada: string
  estado: EstadoAlerta
  fecha: string
}

export interface Cuidador {
  nombre: string
  parentesco: string
  telefono: string
  correo?: string
  estado: 'pendiente' | 'activo' | 'removido'
  recibeAlertas: boolean
}

export interface AccionINEN {
  id: string
  fecha: string
  autor: string
  tipo: 'Llamada' | 'Orientación' | 'Recordatorio' | 'Coordinación' | 'Actualización'
  detalle: string
}

// ===================================================================
// RutaDiagnostica: un episodio de atención. Una paciente puede tener
// múltiples rutas a lo largo del tiempo (primera vez, reingreso, etc.)
// ===================================================================
export interface RutaDiagnostica {
  id: string
  codigo: string
  tipoIngreso: TipoIngreso
  tipoSospecha: Sospecha
  motivoIngreso: string
  fechaInicio: string
  fechaCierre?: string
  estadoRuta: EstadoRuta
  etapaActual: NombreEtapa
  diasSinAvance: number
  proximoPaso: string
  etapas: Etapa[]
  documentos: Documento[]
  citas: Cita[]
  alertas: Alerta[]
  acciones: AccionINEN[]
  // Historial consolidado de la ruta (opcional, para pantalla de historial)
  bitacoraSeguimiento?: RegistroSeguimiento[]
  documentosRuta?: DocumentoRuta[]
}

// ===================================================================
// Paciente: datos personales estables + historial de rutas.
// Los campos "legacy" (etapaActual, ruta, documentos, etc.) están
// sincronizados con la ruta activa para compatibilidad con todas
// las pantallas existentes.
// ===================================================================
export interface Paciente {
  id: string
  dni: string
  nombres: string
  apellidos: string
  edad: number
  telefono: string
  procedencia: string
  esProvincia: boolean
  idiomaPreferido: Idioma
  bajaAlfabetizacion: boolean
  cuidador?: Cuidador
  // Múltiples rutas diagnósticas
  rutaActivaId: string
  rutasDiagnosticas: RutaDiagnostica[]
  // Campos sincronizados desde la ruta activa (compatibilidad con pantallas existentes)
  tipoSospecha: Sospecha
  etapaActual: NombreEtapa
  riesgo: Riesgo
  diasSinAvance: number
  proximoPaso: string
  citaPerdida: boolean
  ruta: Etapa[]
  documentos: Documento[]
  citas: Cita[]
  alertas: Alerta[]
  acciones: AccionINEN[]
}

export interface NotificacionDemo {
  id: string
  canal: 'WhatsApp' | 'SMS' | 'Interna'
  titulo: string
  cuerpo: string
  hora: string
}
