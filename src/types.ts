// ===================================================================
// Modelo de datos OncoRuta Mujer IA
// Basado en la sección 22 de la especificación.
// IMPORTANTE: ningún campo guarda diagnóstico, pronóstico ni decisión
// clínica. Solo información administrativa y de navegación.
// ===================================================================

export type Rol = 'paciente' | 'cuidador' | 'inen' | 'admin'

export type Riesgo = 'verde' | 'amarillo' | 'rojo'

export type Sospecha = 'Mama' | 'Cérvix'

export type Idioma = 'es' | 'qu'

export type NombreEtapa =
  | 'Admisión'
  | 'Historia clínica'
  | 'Primera cita'
  | 'Exámenes'
  | 'Informe'
  | 'Cita diagnóstica'

export type EstadoEtapa =
  | 'Pendiente'
  | 'En proceso'
  | 'Completado'
  | 'Observado'
  | 'Reprogramado'
  | 'Atrasado'

export interface Etapa {
  nombre: NombreEtapa
  orden: number
  estado: EstadoEtapa
  fecha?: string // fecha de inicio/cierre (formato simple para demo)
  descripcionSimple: string
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
  fecha: string // dd/mm/aaaa
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

export interface Paciente {
  id: string
  dni: string // enmascarado
  nombres: string
  apellidos: string
  edad: number
  telefono: string
  procedencia: string
  esProvincia: boolean
  idiomaPreferido: Idioma
  tipoSospecha: Sospecha
  etapaActual: NombreEtapa
  riesgo: Riesgo
  diasSinAvance: number
  proximoPaso: string
  bajaAlfabetizacion: boolean
  citaPerdida: boolean
  ruta: Etapa[]
  documentos: Documento[]
  citas: Cita[]
  alertas: Alerta[]
  cuidador?: Cuidador
  acciones: AccionINEN[]
}

export interface NotificacionDemo {
  id: string
  canal: 'WhatsApp' | 'SMS' | 'Interna'
  titulo: string
  cuerpo: string
  hora: string
}
