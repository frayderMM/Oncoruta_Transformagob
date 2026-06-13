import type {
  Paciente,
  Etapa,
  NombreEtapa,
  EstadoEtapa,
} from '../types'

// Orden canónico de la ruta diagnóstica (sección 10)
export const ETAPAS_ORDEN: NombreEtapa[] = [
  'Admisión',
  'Historia clínica',
  'Primera cita',
  'Exámenes',
  'Informe',
  'Cita diagnóstica',
]

const DESC_SIMPLE: Record<NombreEtapa, string> = {
  Admisión: 'Estamos revisando tus documentos para iniciar tu atención.',
  'Historia clínica':
    'Se abrió tu historia clínica. El siguiente paso es programar tu primera cita.',
  'Primera cita': 'Tienes una cita con el servicio. Recuerda llevar tus documentos.',
  Exámenes:
    'Te haremos exámenes de apoyo. Te diremos la fecha, el lugar y la preparación.',
  Informe: 'Cuando el informe esté listo, recibirás una alerta. Aún falta esperar.',
  'Cita diagnóstica':
    'El médico revisará tus resultados y te explicará los siguientes pasos.',
}

/** Construye las 6 etapas a partir de la etapa actual. */
function mkRuta(
  actualIdx: number,
  estadoActual: EstadoEtapa,
  fechas: Partial<Record<NombreEtapa, string>> = {},
): Etapa[] {
  return ETAPAS_ORDEN.map((nombre, i) => {
    let estado: EstadoEtapa
    if (i < actualIdx) estado = 'Completado'
    else if (i === actualIdx) estado = estadoActual
    else estado = 'Pendiente'
    return {
      nombre,
      orden: i + 1,
      estado,
      fecha: fechas[nombre],
      descripcionSimple: DESC_SIMPLE[nombre],
    }
  })
}

// ===================================================================
// PACIENTE 1 — María Quispe Huamán (caso estrella: riesgo ROJO)
// ===================================================================
const maria: Paciente = {
  id: 'pac-001',
  dni: '****5678',
  nombres: 'María',
  apellidos: 'Quispe Huamán',
  edad: 52,
  telefono: '999 ••• 999',
  procedencia: 'Ayacucho',
  esProvincia: true,
  idiomaPreferido: 'qu',
  tipoSospecha: 'Mama',
  etapaActual: 'Exámenes',
  riesgo: 'rojo',
  diasSinAvance: 8,
  proximoPaso: 'Coordinar el informe del examen, que está pendiente.',
  bajaAlfabetizacion: true,
  citaPerdida: false,
  ruta: mkRuta(3, 'Atrasado', {
    Admisión: '04/06/2026',
    'Historia clínica': '05/06/2026',
    'Primera cita': '07/06/2026',
    Exámenes: '09/06/2026',
  }),
  documentos: [
    { id: 'd1', nombre: 'DNI', etapa: 'Admisión', estado: 'Recibido', observacion: 'Correcto.', obligatorio: true },
    { id: 'd2', nombre: 'Hoja de referencia', etapa: 'Admisión', estado: 'Recibido', observacion: 'Recibida en admisión.', obligatorio: true },
    { id: 'd3', nombre: 'Exámenes previos', etapa: 'Exámenes', estado: 'Recibido', observacion: 'Mamografía de origen entregada.', obligatorio: true },
    { id: 'd4', nombre: 'Resultado de anatomía patológica', etapa: 'Informe', estado: 'Pendiente', observacion: 'Aún no está listo el informe del laboratorio.', obligatorio: true },
    { id: 'd5', nombre: 'Autorización de acompañante', etapa: 'General', estado: 'Recibido', observacion: 'Autoriza a su hija Ana.', obligatorio: false },
  ],
  citas: [
    { id: 'c1', tipo: 'Primera cita', servicio: 'Mastología', fecha: '07/06/2026', hora: '09:00', lugar: 'Consultorio 3 - Mód. B', estado: 'Realizada', indicaciones: 'Consulta inicial realizada.', documentos: ['DNI', 'Hoja de referencia'] },
    { id: 'c2', tipo: 'Examen', servicio: 'Ecografía mamaria', fecha: '09/06/2026', hora: '11:30', lugar: 'Imágenes - Piso 1', estado: 'Realizada', indicaciones: 'Examen tomado. En espera del informe.', documentos: ['DNI'] },
    { id: 'c3', tipo: 'Cita diagnóstica', servicio: 'Mastología', fecha: 'Por programar', hora: '—', lugar: 'Pendiente de informe', estado: 'Pendiente de programación', indicaciones: 'Se programará cuando llegue el informe del examen.', documentos: ['DNI', 'Resultado de anatomía patológica'] },
  ],
  alertas: [
    { id: 'a1', tipo: 'demora', nivel: 'rojo', mensaje: 'Llevas 8 días sin avance en la etapa de exámenes.', accionRecomendada: 'Comunícate con orientación o pide a tu cuidadora que llame al INEN.', estado: 'Nueva', fecha: '13/06/2026' },
    { id: 'a2', tipo: 'cita', nivel: 'amarillo', mensaje: 'Aún no tienes fecha para tu cita diagnóstica.', accionRecomendada: 'El INEN coordinará tu cita al recibir el informe.', estado: 'Vista', fecha: '12/06/2026' },
  ],
  cuidador: { nombre: 'Ana Quispe', parentesco: 'Hija', telefono: '988 ••• 888', estado: 'activo', recibeAlertas: true },
  acciones: [
    { id: 'ac1', fecha: '10/06/2026', autor: 'Navegadora L. Ríos', tipo: 'Llamada', detalle: 'Se llamó a la cuidadora. Confirmó que el examen ya fue tomado.' },
  ],
}

// ===================================================================
// PACIENTE 2 — Rosa López García (riesgo VERDE)
// ===================================================================
const rosa: Paciente = {
  id: 'pac-002',
  dni: '****1234',
  nombres: 'Rosa',
  apellidos: 'López García',
  edad: 38,
  telefono: '977 ••• 977',
  procedencia: 'Lima',
  esProvincia: false,
  idiomaPreferido: 'es',
  tipoSospecha: 'Cérvix',
  etapaActual: 'Primera cita',
  riesgo: 'verde',
  diasSinAvance: 1,
  proximoPaso: 'Asistir a tu primera cita el 15/06 a las 10:00.',
  bajaAlfabetizacion: false,
  citaPerdida: false,
  ruta: mkRuta(2, 'En proceso', {
    Admisión: '11/06/2026',
    'Historia clínica': '12/06/2026',
    'Primera cita': '15/06/2026',
  }),
  documentos: [
    { id: 'd1', nombre: 'DNI', etapa: 'Admisión', estado: 'Recibido', observacion: 'Correcto.', obligatorio: true },
    { id: 'd2', nombre: 'Hoja de referencia', etapa: 'Admisión', estado: 'Recibido', observacion: 'Recibida.', obligatorio: true },
    { id: 'd3', nombre: 'Exámenes previos', etapa: 'Primera cita', estado: 'Recibido', observacion: 'Resultado de PAP entregado.', obligatorio: true },
    { id: 'd4', nombre: 'Consentimiento informado', etapa: 'Primera cita', estado: 'No aplica', observacion: 'No requerido en esta etapa.', obligatorio: false },
  ],
  citas: [
    { id: 'c1', tipo: 'Primera cita', servicio: 'Ginecología oncológica', fecha: '15/06/2026', hora: '10:00', lugar: 'Consultorio 7 - Mód. A', estado: 'Confirmada', indicaciones: 'Llega 30 minutos antes. Lleva tu DNI y el resultado de PAP.', documentos: ['DNI', 'Hoja de referencia', 'Exámenes previos'] },
  ],
  alertas: [
    { id: 'a1', tipo: 'cita', nivel: 'verde', mensaje: 'Tu primera cita está confirmada para el 15/06 a las 10:00.', accionRecomendada: 'Llega 30 minutos antes con tus documentos.', estado: 'Vista', fecha: '13/06/2026' },
  ],
  cuidador: undefined,
  acciones: [],
}

// ===================================================================
// PACIENTE 3 — Juana Cárdenas Flores (riesgo AMARILLO, documentos)
// ===================================================================
const juana: Paciente = {
  id: 'pac-003',
  dni: '****9012',
  nombres: 'Juana',
  apellidos: 'Cárdenas Flores',
  edad: 64,
  telefono: '966 ••• 966',
  procedencia: 'Huancavelica',
  esProvincia: true,
  idiomaPreferido: 'es',
  tipoSospecha: 'Mama',
  etapaActual: 'Admisión',
  riesgo: 'amarillo',
  diasSinAvance: 5,
  proximoPaso: 'Llevar la copia física de tu hoja de referencia para terminar la admisión.',
  bajaAlfabetizacion: true,
  citaPerdida: false,
  ruta: mkRuta(0, 'Observado', { Admisión: '08/06/2026' }),
  documentos: [
    { id: 'd1', nombre: 'DNI', etapa: 'Admisión', estado: 'Recibido', observacion: 'Correcto.', obligatorio: true },
    { id: 'd2', nombre: 'Hoja de referencia', etapa: 'Admisión', estado: 'Pendiente', observacion: 'Debe llevar copia física a admisión.', obligatorio: true },
    { id: 'd3', nombre: 'Exámenes previos', etapa: 'Admisión', estado: 'Observado', observacion: 'Falta el resultado anterior legible.', obligatorio: true },
  ],
  citas: [
    { id: 'c1', tipo: 'Primera cita', servicio: 'Mastología', fecha: 'Por programar', hora: '—', lugar: 'Se programa al completar admisión', estado: 'Pendiente de programación', indicaciones: 'Primero debes completar tus documentos de admisión.', documentos: ['DNI', 'Hoja de referencia'] },
  ],
  alertas: [
    { id: 'a1', tipo: 'documento', nivel: 'amarillo', mensaje: 'Falta tu hoja de referencia para continuar la admisión.', accionRecomendada: 'Lleva la copia física a la ventanilla de orientación.', estado: 'Nueva', fecha: '13/06/2026' },
  ],
  cuidador: undefined,
  acciones: [],
}

// ===================================================================
// PACIENTE 4 — Elena Torres Rojas (riesgo AMARILLO, informe)
// ===================================================================
const elena: Paciente = {
  id: 'pac-004',
  dni: '****3456',
  nombres: 'Elena',
  apellidos: 'Torres Rojas',
  edad: 45,
  telefono: '955 ••• 955',
  procedencia: 'Lima',
  esProvincia: false,
  idiomaPreferido: 'es',
  tipoSospecha: 'Cérvix',
  etapaActual: 'Informe',
  riesgo: 'amarillo',
  diasSinAvance: 6,
  proximoPaso: 'Esperar el informe. El INEN te avisará cuando esté listo.',
  bajaAlfabetizacion: false,
  citaPerdida: false,
  ruta: mkRuta(4, 'En proceso', {
    Admisión: '02/06/2026',
    'Historia clínica': '03/06/2026',
    'Primera cita': '05/06/2026',
    Exámenes: '07/06/2026',
  }),
  documentos: [
    { id: 'd1', nombre: 'DNI', etapa: 'Admisión', estado: 'Recibido', observacion: 'Correcto.', obligatorio: true },
    { id: 'd2', nombre: 'Hoja de referencia', etapa: 'Admisión', estado: 'Recibido', observacion: 'Recibida.', obligatorio: true },
    { id: 'd3', nombre: 'Exámenes previos', etapa: 'Exámenes', estado: 'Recibido', observacion: 'Colposcopía realizada.', obligatorio: true },
    { id: 'd4', nombre: 'Resultado de anatomía patológica', etapa: 'Informe', estado: 'Pendiente', observacion: 'El laboratorio aún procesa el informe.', obligatorio: true },
  ],
  citas: [
    { id: 'c1', tipo: 'Examen', servicio: 'Colposcopía', fecha: '07/06/2026', hora: '08:30', lugar: 'Imágenes - Piso 1', estado: 'Realizada', indicaciones: 'Examen realizado.', documentos: ['DNI'] },
    { id: 'c2', tipo: 'Cita diagnóstica', servicio: 'Ginecología oncológica', fecha: 'Por programar', hora: '—', lugar: 'Pendiente de informe', estado: 'Pendiente de programación', indicaciones: 'Se programa al llegar el informe.', documentos: ['DNI'] },
  ],
  alertas: [
    { id: 'a1', tipo: 'demora', nivel: 'amarillo', mensaje: 'Tu informe lleva 6 días en proceso.', accionRecomendada: 'El INEN está dando seguimiento al laboratorio.', estado: 'Vista', fecha: '13/06/2026' },
  ],
  cuidador: { nombre: 'Lucía Torres', parentesco: 'Hermana', telefono: '944 ••• 944', estado: 'activo', recibeAlertas: true },
  acciones: [
    { id: 'ac1', fecha: '11/06/2026', autor: 'Navegador J. Mendoza', tipo: 'Coordinación', detalle: 'Se coordinó con laboratorio para priorizar el informe.' },
  ],
}

// ===================================================================
// PACIENTE 5 — Carmen Poma Sánchez (riesgo ROJO, historia clínica)
// ===================================================================
const carmen: Paciente = {
  id: 'pac-005',
  dni: '****7890',
  nombres: 'Carmen',
  apellidos: 'Poma Sánchez',
  edad: 59,
  telefono: '933 ••• 933',
  procedencia: 'Cusco',
  esProvincia: true,
  idiomaPreferido: 'qu',
  tipoSospecha: 'Mama',
  etapaActual: 'Historia clínica',
  riesgo: 'rojo',
  diasSinAvance: 9,
  proximoPaso: 'Programar tu primera cita. No tienes una cita registrada.',
  bajaAlfabetizacion: true,
  citaPerdida: true,
  ruta: mkRuta(1, 'Atrasado', {
    Admisión: '03/06/2026',
    'Historia clínica': '04/06/2026',
  }),
  documentos: [
    { id: 'd1', nombre: 'DNI', etapa: 'Admisión', estado: 'Recibido', observacion: 'Correcto.', obligatorio: true },
    { id: 'd2', nombre: 'Hoja de referencia', etapa: 'Admisión', estado: 'Recibido', observacion: 'Recibida.', obligatorio: true },
    { id: 'd3', nombre: 'Autorización de acompañante', etapa: 'General', estado: 'Pendiente', observacion: 'No tiene acompañante registrado.', obligatorio: false },
  ],
  citas: [
    { id: 'c1', tipo: 'Primera cita', servicio: 'Mastología', fecha: '06/06/2026', hora: '08:00', lugar: 'Consultorio 3 - Mód. B', estado: 'Perdida', indicaciones: 'No asistió a la cita programada.', documentos: ['DNI'] },
    { id: 'c2', tipo: 'Primera cita', servicio: 'Mastología', fecha: 'Por programar', hora: '—', lugar: 'Requiere reprogramación', estado: 'Pendiente de programación', indicaciones: 'Debe reprogramarse con apoyo del navegador.', documentos: ['DNI'] },
  ],
  alertas: [
    { id: 'a1', tipo: 'cita', nivel: 'rojo', mensaje: 'Perdiste tu primera cita y no tienes una nueva fecha.', accionRecomendada: 'Llamada prioritaria del navegador para reprogramar.', estado: 'Nueva', fecha: '13/06/2026' },
    { id: 'a2', tipo: 'cuidador', nivel: 'amarillo', mensaje: 'No tienes un cuidador registrado.', accionRecomendada: 'Sugerir registrar un familiar de contacto.', estado: 'Nueva', fecha: '12/06/2026' },
  ],
  cuidador: undefined,
  acciones: [],
}

export const PACIENTES: Paciente[] = [maria, rosa, juana, elena, carmen]

// Paciente que inicia sesión por defecto en el rol "paciente" / "cuidador"
export const PACIENTE_DEMO_ID = 'pac-001'
