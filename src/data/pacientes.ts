import type {
  Paciente,
  RutaDiagnostica,
  Etapa,
  NombreEtapa,
  EstadoEtapa,
  TipoIngreso,
  Sospecha,
} from '../types'

// ===================================================================
// Orden canónico de las etapas por tipo de ingreso
// ===================================================================
export const ETAPAS_ORDEN: NombreEtapa[] = [
  'Admisión',
  'Historia clínica',
  'Primera cita',
  'Exámenes',
  'Informe',
  'Cita diagnóstica',
]

export const ETAPAS_REINGRESO: NombreEtapa[] = [
  'Reingreso',
  'Validación de datos y documentos',
  'Programación de cita',
  'Evaluación médica',
  'Exámenes',
  'Informe',
  'Cita diagnóstica / indicación médica',
]

export const TODAS_ETAPAS: NombreEtapa[] = [
  ...new Set([...ETAPAS_ORDEN, ...ETAPAS_REINGRESO]),
]

export function getEtapasParaTipo(tipoIngreso: TipoIngreso): NombreEtapa[] {
  return tipoIngreso === 'Primera vez' || tipoIngreso === 'Nueva sospecha'
    ? ETAPAS_ORDEN
    : ETAPAS_REINGRESO
}

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
  // Reingreso
  Reingreso: 'Registramos tu nuevo ingreso. Verificaremos tus datos anteriores.',
  'Validación de datos y documentos':
    'Revisamos tu historia clínica existente y tus documentos actuales.',
  'Programación de cita':
    'Coordinaremos tu próxima cita según la disponibilidad del servicio.',
  'Evaluación médica': 'El médico te evaluará y revisará tus antecedentes.',
  'Cita diagnóstica / indicación médica':
    'El médico revisará tus resultados y te indicará los siguientes pasos a seguir.',
}

function mkRuta(
  actualIdx: number,
  estadoActual: EstadoEtapa,
  fechas: Partial<Record<NombreEtapa, string>> = {},
): Etapa[] {
  return ETAPAS_ORDEN.map((nombre, i) => {
    const estado: EstadoEtapa =
      i < actualIdx ? 'Completado' : i === actualIdx ? estadoActual : 'Pendiente'
    return { nombre, orden: i + 1, estado, fecha: fechas[nombre], descripcionSimple: DESC_SIMPLE[nombre] }
  })
}

function mkRutaReingreso(
  actualIdx: number,
  estadoActual: EstadoEtapa,
  fechas: Partial<Record<NombreEtapa, string>> = {},
): Etapa[] {
  return ETAPAS_REINGRESO.map((nombre, i) => {
    const estado: EstadoEtapa =
      i < actualIdx ? 'Completado' : i === actualIdx ? estadoActual : 'Pendiente'
    return { nombre, orden: i + 1, estado, fecha: fechas[nombre], descripcionSimple: DESC_SIMPLE[nombre] }
  })
}

// Helpers para acceder a rutas desde el paciente
export function getRutaActiva(p: Paciente): RutaDiagnostica | undefined {
  return p.rutasDiagnosticas.find((r) => r.id === p.rutaActivaId)
}

export function getRutaPorId(p: Paciente, rutaId: string): RutaDiagnostica | undefined {
  return p.rutasDiagnosticas.find((r) => r.id === rutaId)
}

// Crea una nueva ruta desde un formulario de alta
export function crearRutaInicial(params: {
  id: string
  codigo: string
  tipoIngreso: TipoIngreso
  tipoSospecha: Sospecha
  motivoIngreso: string
  fechaInicio: string
}): RutaDiagnostica {
  const etapas =
    params.tipoIngreso === 'Primera vez' || params.tipoIngreso === 'Nueva sospecha'
      ? mkRuta(0, 'En proceso', { Admisión: params.fechaInicio })
      : mkRutaReingreso(0, 'En proceso', { Reingreso: params.fechaInicio })

  const hoy = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return {
    id: params.id,
    codigo: params.codigo,
    tipoIngreso: params.tipoIngreso,
    tipoSospecha: params.tipoSospecha,
    motivoIngreso: params.motivoIngreso,
    fechaInicio: params.fechaInicio,
    estadoRuta: 'Activa',
    etapaActual:
      params.tipoIngreso === 'Primera vez' || params.tipoIngreso === 'Nueva sospecha'
        ? 'Admisión'
        : 'Reingreso',
    diasSinAvance: 0,
    proximoPaso:
      params.tipoIngreso === 'Primera vez' || params.tipoIngreso === 'Nueva sospecha'
        ? 'Completar documentos de admisión.'
        : 'Presentarse a validación de datos y documentos anteriores.',
    etapas,
    documentos: [
      {
        id: 'd-new-1',
        nombre: 'DNI',
        etapa: 'Admisión',
        estado: 'Pendiente',
        observacion: 'Por entregar en admisión.',
        obligatorio: true,
      },
      {
        id: 'd-new-2',
        nombre: 'Hoja de referencia',
        etapa: 'Admisión',
        estado: 'Pendiente',
        observacion: 'Documento requerido para iniciar la ruta.',
        obligatorio: true,
      },
    ],
    citas: [],
    alertas: [
      {
        id: 'a-new-1',
        tipo: 'sistema',
        nivel: 'verde',
        mensaje: 'Nueva ruta diagnóstica creada. Bienvenida al proceso de acompañamiento.',
        accionRecomendada: 'Completa tus documentos de admisión para comenzar.',
        estado: 'Nueva',
        fecha: hoy,
      },
    ],
    acciones: [
      {
        id: 'ac-new-1',
        fecha: hoy,
        autor: 'Sistema',
        tipo: 'Actualización',
        detalle: `Nueva ruta creada: ${params.codigo} · ${params.tipoIngreso} · ${params.tipoSospecha}.`,
      },
    ],
  }
}

// ===================================================================
// PACIENTE 1 — María Quispe Gonzales
// Dos rutas: Ruta 2026-001 (completada, Mama) + Ruta 2025-004 (finalizada, Cérvix)
// ===================================================================

const rutaMaria001a: RutaDiagnostica = {
  id: 'ruta-001-a',
  codigo: 'Ruta 2026-001',
  tipoIngreso: 'Primera vez',
  tipoSospecha: 'Mama',
  motivoIngreso: 'Sospecha de nódulo mamario. Referida desde centro de salud de Ayacucho.',
  fechaInicio: '04/06/2026',
  fechaCierre: '18/06/2026',
  estadoRuta: 'Finalizada',
  etapaActual: 'Cita diagnóstica',
  diasSinAvance: 0,
  proximoPaso: 'Seguir las indicaciones del personal del INEN.',
  etapas: [
    {
      nombre: 'Admisión',
      orden: 1,
      estado: 'Completado',
      fecha: '04/06/2026',
      descripcionSimple: DESC_SIMPLE['Admisión'],
      detalle: {
        fechaInicio: '04/06/2026',
        fechaFin: '04/06/2026',
        lugarServicio: 'Módulo de admisión INEN',
        responsableArea: 'Admisión / Referencias',
        resumenPaciente:
          'Se validaron tus datos de ingreso y documentos iniciales para iniciar la atención en el INEN.',
        documentos: ['DNI', 'Hoja de referencia', 'Exámenes previos presentados'],
        accionesRealizadas: [
          'Validación de identidad',
          'Revisión de referencia',
          'Registro de datos de contacto',
        ],
        proximoPasoDetalle: 'Validar o aperturar historia clínica.',
        datosAdmision: [
          { label: 'Código de atención', value: 'ADM-2026-001' },
          { label: 'Fecha de ingreso', value: '04/06/2026' },
          { label: 'Tipo de ingreso', value: 'Primera vez' },
          { label: 'Procedencia', value: 'Ayacucho' },
          { label: 'Idioma preferido', value: 'Español / Quechua' },
          { label: 'Cuidador registrado', value: 'Ana Quispe' },
          { label: 'Estado de documentos', value: 'Completos' },
        ],
      },
    },
    {
      nombre: 'Historia clínica',
      orden: 2,
      estado: 'Completado',
      fecha: '05/06/2026',
      descripcionSimple: DESC_SIMPLE['Historia clínica'],
      detalle: {
        lugarServicio: 'Archivo / Registro de historia clínica',
        responsableArea: 'Gestión de historia clínica',
        resumenPaciente:
          'Se verificó la historia clínica de la paciente y se asociaron los registros administrativos de esta ruta diagnóstica.',
        documentos: [
          'Ficha de datos personales',
          'Registro de contacto',
          'Datos de cuidador / familiar',
        ],
        accionesRealizadas: [
          'Historia clínica verificada',
          'Teléfono de contacto actualizado',
          'Idioma preferido registrado',
          'Cuidadora registrada',
        ],
        proximoPasoDetalle: 'Programar primera cita.',
        // Campos específicos de HC (reemplazan fechaInicio/fechaFin en el modal)
        codigoHistoriaClinica: 'HC-2026-001',
        fechaRegistro: '05/06/2026',
        ultimaActualizacion: '18/06/2026',
        estadoHistoriaClinica: 'Verificada',
        registroAsociadoRuta: 'Ruta 2026-001 · Primera vez · Mama',
        datosHistoriaClinica: [
          { label: 'Código de historia clínica', value: 'HC-2026-001' },
          { label: 'Fecha de registro', value: '05/06/2026' },
          { label: 'Última actualización', value: '18/06/2026' },
          { label: 'Estado de historia clínica', value: 'Verificada' },
          { label: 'Área responsable', value: 'Gestión de historia clínica' },
          { label: 'Registro asociado a la ruta', value: 'Ruta 2026-001 · Primera vez · Mama' },
        ],
        registrosAsociados: [
          { fecha: '05/06/2026', tipoRegistro: 'Verificación de historia clínica', servicioArea: 'Gestión de historia clínica', descripcion: 'Historia clínica verificada para continuar atención', estado: 'Registrado' },
          { fecha: '07/06/2026', tipoRegistro: 'Registro de primera atención', servicioArea: 'Mamas y Tejidos Blandos', descripcion: 'Atención inicial registrada en la ruta', estado: 'Registrado' },
          { fecha: '10/06/2026', tipoRegistro: 'Registro de estudio', servicioArea: 'Apoyo diagnóstico', descripcion: 'Programación de estudio asociada a la ruta', estado: 'Registrado' },
          { fecha: '15/06/2026', tipoRegistro: 'Registro de informe', servicioArea: 'Apoyo diagnóstico', descripcion: 'Informe asociado a la ruta diagnóstica', estado: 'Registrado' },
          { fecha: '18/06/2026', tipoRegistro: 'Registro de cita diagnóstica', servicioArea: 'Consultorio especializado', descripcion: 'Cierre de ruta registrado por el personal correspondiente', estado: 'Registrado' },
        ],
      },
    },
    {
      nombre: 'Primera cita',
      orden: 3,
      estado: 'Completado',
      fecha: '07/06/2026',
      descripcionSimple: DESC_SIMPLE['Primera cita'],
      detalle: {
        fechaInicio: '07/06/2026',
        fechaFin: '07/06/2026',
        lugarServicio: 'Consultorio de Mamas y Tejidos Blandos',
        responsableArea: 'Especialidad médica',
        resumenPaciente:
          'Se realizó la primera evaluación médica y se indicaron programaciones de apoyo diagnóstico.',
        documentos: ['Constancia de atención', 'Indicaciones para exámenes'],
        accionesRealizadas: [
          'Asistencia registrada',
          'Evaluación inicial realizada',
          'Programaciones de apoyo indicadas por el médico',
        ],
        proximoPasoDetalle: 'Realizar estudios programados.',
        citasRelacionadas: [
          { fecha: '07/06/2026', hora: '09:00', tipo: 'Primera atención', servicio: 'Mamas y Tejidos Blandos', lugar: 'Consultorio 204', estado: 'Realizada', observacion: 'Evaluación inicial completada' },
          { fecha: '10/06/2026', hora: '08:30', tipo: 'Estudio programado', servicio: 'Mamografía', lugar: 'Imagenología', estado: 'Realizada', observacion: 'Asistir con indicaciones previas' },
          { fecha: '11/06/2026', hora: '10:00', tipo: 'Estudio programado', servicio: 'Ecografía mamaria', lugar: 'Imagenología', estado: 'Realizada', observacion: 'Programada después de primera cita' },
          { fecha: '12/06/2026', hora: '11:30', tipo: 'Procedimiento indicado', servicio: 'Apoyo diagnóstico', lugar: 'Servicio correspondiente', estado: 'Realizada', observacion: 'Según indicación médica' },
          { fecha: '18/06/2026', hora: '09:30', tipo: 'Cita diagnóstica', servicio: 'Consultorio especializado', lugar: 'INEN', estado: 'Realizada', observacion: 'Revisión médica de documentos' },
        ],
      },
    },
    {
      nombre: 'Exámenes',
      orden: 4,
      estado: 'Completado',
      fecha: '10/06/2026',
      descripcionSimple: DESC_SIMPLE['Exámenes'],
      detalle: {
        fechaInicio: '10/06/2026',
        fechaFin: '12/06/2026',
        lugarServicio: 'Servicios de apoyo diagnóstico',
        responsableArea: 'Apoyo diagnóstico',
        resumenPaciente:
          'Se realizaron los estudios solicitados por el personal médico.',
        documentos: [
          'Orden de examen',
          'Registro de atención',
          'Documento de estudio realizado',
        ],
        accionesRealizadas: [
          'Estudios programados',
          'Estudios realizados',
          'Documentos enviados para informe',
        ],
        proximoPasoDetalle: 'Esperar informe.',
        estudiosRealizados: [
          { fecha: '10/06/2026', estudio: 'Mamografía bilateral', servicio: 'Imagenología', estado: 'Completado', documentoAsociado: 'Documento de estudio disponible', observacion: 'Estudio realizado', imagenUrl: '/documentos/10_mamografia_bilateral_mock.png' },
          { fecha: '11/06/2026', estudio: 'Ecografía mamaria', servicio: 'Imagenología', estado: 'Completado', documentoAsociado: 'Documento de estudio disponible', observacion: 'Estudio realizado', imagenUrl: '/documentos/11_ecografia_mamaria_mock.png' },
          { fecha: '12/06/2026', estudio: 'Procedimiento indicado por médico', servicio: 'Servicio correspondiente', estado: 'Completado', documentoAsociado: 'Registro de procedimiento disponible', observacion: 'Según indicación médica', imagenUrl: '/documentos/12_registro_procedimiento_mock.png' },
        ],
      },
    },
    {
      nombre: 'Informe',
      orden: 5,
      estado: 'Completado',
      fecha: '15/06/2026',
      descripcionSimple: DESC_SIMPLE['Informe'],
      detalle: {
        fechaInicio: '15/06/2026',
        fechaFin: '16/06/2026',
        lugarServicio: 'Área correspondiente de informes',
        responsableArea: 'Servicio de apoyo diagnóstico',
        resumenPaciente:
          'Los documentos del estudio quedaron disponibles para revisión del personal médico.',
        documentos: ['Informe disponible', 'Documento emitido por el INEN'],
        accionesRealizadas: [
          'Informe generado',
          'Informe asociado a la ruta',
          'Cita diagnóstica programada',
        ],
        proximoPasoDetalle: 'Asistir a cita diagnóstica.',
        informesDisponibles: [
          { fecha: '15/06/2026', tipoInforme: 'Informe de imagenología', servicio: 'Imagenología', estado: 'Disponible', resumenSeguro: 'Documento disponible para revisión por el personal médico. OncoRuta no interpreta resultados.' },
          { fecha: '16/06/2026', tipoInforme: 'Informe de procedimiento', servicio: 'Servicio correspondiente', estado: 'Disponible', resumenSeguro: 'Documento disponible para revisión por el personal médico. OncoRuta no interpreta resultados.' },
          { fecha: '18/06/2026', tipoInforme: 'Resumen de cita diagnóstica', servicio: 'Consultorio especializado', estado: 'Disponible', resumenSeguro: 'Documento disponible para revisión por el personal médico. OncoRuta no interpreta resultados.' },
        ],
      },
    },
    {
      nombre: 'Cita diagnóstica',
      orden: 6,
      estado: 'Completado',
      fecha: '18/06/2026',
      descripcionSimple: DESC_SIMPLE['Cita diagnóstica'],
      detalle: {
        fechaInicio: '18/06/2026',
        fechaFin: '18/06/2026',
        lugarServicio: 'Consultorio especializado INEN',
        responsableArea: 'Médico especialista',
        resumenPaciente:
          'El personal médico revisó los documentos disponibles y explicó los siguientes pasos de atención.',
        documentos: [
          'Resumen de cita',
          'Indicaciones entregadas por el personal médico',
        ],
        accionesRealizadas: [
          'Cita realizada',
          'Orientación médica entregada',
          'Ruta diagnóstica marcada como finalizada',
        ],
        proximoPasoDetalle: 'Seguir las indicaciones del personal del INEN.',
        resumenCierreRuta: [
          { label: 'Fecha de cita', value: '18/06/2026' },
          { label: 'Servicio', value: 'Consultorio especializado INEN' },
          { label: 'Estado de la cita', value: 'Realizada' },
          { label: 'Documentos revisados', value: 'Informes disponibles de la ruta' },
          { label: 'Indicación general', value: 'Seguir las indicaciones entregadas por el personal del INEN' },
          { label: 'Estado de ruta', value: 'Finalizada' },
        ],
      },
    },
  ],
  documentos: [
    { id: 'd1', nombre: 'DNI', etapa: 'Admisión', estado: 'Recibido', observacion: 'Correcto.', obligatorio: true },
    { id: 'd2', nombre: 'Hoja de referencia', etapa: 'Admisión', estado: 'Recibido', observacion: 'Recibida en admisión.', obligatorio: true },
    { id: 'd3', nombre: 'Exámenes previos', etapa: 'Exámenes', estado: 'Recibido', observacion: 'Mamografía de origen entregada.', obligatorio: true },
    { id: 'd4', nombre: 'Resultado de anatomía patológica', etapa: 'Informe', estado: 'Recibido', observacion: 'Informe recibido y procesado.', obligatorio: true },
    { id: 'd5', nombre: 'Autorización de acompañante', etapa: 'General', estado: 'Recibido', observacion: 'Autoriza a su hija Ana.', obligatorio: false },
  ],
  citas: [
    { id: 'c1', tipo: 'Primera cita', servicio: 'Mastología', fecha: '07/06/2026', hora: '09:00', lugar: 'Consultorio 3 - Mód. B', estado: 'Realizada', indicaciones: 'Consulta inicial realizada.', documentos: ['DNI', 'Hoja de referencia'] },
    { id: 'c2', tipo: 'Examen', servicio: 'Ecografía mamaria', fecha: '10/06/2026', hora: '11:30', lugar: 'Imágenes - Piso 1', estado: 'Realizada', indicaciones: 'Examen realizado satisfactoriamente.', documentos: ['DNI'] },
    { id: 'c3', tipo: 'Cita diagnóstica', servicio: 'Mastología', fecha: '18/06/2026', hora: '10:00', lugar: 'Consultorio especializado INEN', estado: 'Realizada', indicaciones: 'Cita diagnóstica completada.', documentos: ['DNI', 'Resultado de anatomía patológica'] },
  ],
  alertas: [
    { id: 'a1', tipo: 'sistema', nivel: 'verde', mensaje: 'Tu ruta diagnóstica fue completada satisfactoriamente.', accionRecomendada: 'Sigue las indicaciones del personal del INEN.', estado: 'Atendida', fecha: '18/06/2026' },
  ],
  acciones: [
    { id: 'ac1', fecha: '10/06/2026', autor: 'Navegadora L. Ríos', tipo: 'Llamada', detalle: 'Se llamó a la cuidadora. Confirmó asistencia al examen.' },
    { id: 'ac2', fecha: '18/06/2026', autor: 'Navegadora L. Ríos', tipo: 'Actualización', detalle: 'Ruta diagnóstica finalizada. Todas las etapas completadas.' },
  ],
  bitacoraSeguimiento: [
    { fecha: '04/06/2026', accion: 'Registro de ingreso', responsable: 'Admisión', canal: 'Presencial', resultado: 'Completado' },
    { fecha: '05/06/2026', accion: 'Historia clínica verificada', responsable: 'Gestión HC', canal: 'Sistema', resultado: 'Completado' },
    { fecha: '06/06/2026', accion: 'Recordatorio de primera cita', responsable: 'OncoRuta', canal: 'WhatsApp simulado', resultado: 'Enviado' },
    { fecha: '10/06/2026', accion: 'Recordatorio de estudio', responsable: 'OncoRuta', canal: 'SMS simulado', resultado: 'Enviado' },
    { fecha: '12/06/2026', accion: 'Confirmación de estudios realizados', responsable: 'Navegadora L. Ríos', canal: 'Llamada', resultado: 'Completado' },
    { fecha: '15/06/2026', accion: 'Informe recibido por el servicio', responsable: 'Apoyo diagnóstico', canal: 'Sistema', resultado: 'Completado' },
    { fecha: '18/06/2026', accion: 'Ruta marcada como finalizada', responsable: 'Personal INEN', canal: 'Sistema', resultado: 'Completado' },
  ],
  documentosRuta: [
    { id: 'doc-dni', nombre: 'DNI', etapa: 'Admisión', fecha: '04/06/2026', estado: 'Validado', imagenUrl: '/documentos/01_validacion_dni_admision.png' },
    { id: 'doc-referencia', nombre: 'Hoja de referencia', etapa: 'Admisión', fecha: '04/06/2026', estado: 'Validado', imagenUrl: '/documentos/02_hoja_referencia.png' },
    { id: 'doc-ticket', nombre: 'Ticket de atención', etapa: 'Admisión', fecha: '04/06/2026', estado: 'Validado', imagenUrl: '/documentos/03_ticket_admision.png' },
    { id: 'doc-examenes-previos-1', nombre: 'Examen previo presentado 1', etapa: 'Admisión', fecha: '04/06/2026', estado: 'Recibido', imagenUrl: '/documentos/examen1.png' },
    { id: 'doc-examenes-previos-2', nombre: 'Examen previo presentado 2', etapa: 'Admisión', fecha: '04/06/2026', estado: 'Recibido', imagenUrl: '/documentos/examen2.png' },
    { id: 'doc-ficha-hc', nombre: 'Ficha de datos personales', etapa: 'Historia clínica', fecha: '05/06/2026', estado: 'Registrado', imagenUrl: '/documentos/04_ficha_historia_clinica.png' },
    { id: 'doc-primera-cita', nombre: 'Constancia de primera atención', etapa: 'Primera cita', fecha: '07/06/2026', estado: 'Disponible', imagenUrl: '/documentos/05_constancia_primera_cita.png' },
    { id: 'doc-orden', nombre: 'Orden de examen', etapa: 'Exámenes', fecha: '10/06/2026', estado: 'Disponible', imagenUrl: '/documentos/06_orden_examen.png' },
    { id: 'doc-estudio', nombre: 'Documento de estudio realizado', etapa: 'Exámenes', fecha: '12/06/2026', estado: 'Disponible', imagenUrl: '/documentos/07_constancia_estudio_realizado.png' },
    { id: 'doc-informe', nombre: 'Informe disponible', etapa: 'Informe', fecha: '16/06/2026', estado: 'Disponible', imagenUrl: '/documentos/08_informe_disponible.png' },
    { id: 'doc-resumen', nombre: 'Resumen de cita diagnóstica', etapa: 'Cita diagnóstica', fecha: '18/06/2026', estado: 'Disponible', imagenUrl: '/documentos/09_resumen_cita_diagnostica.png' },
  ],
}

const rutaMaria001b: RutaDiagnostica = {
  id: 'ruta-001-b',
  codigo: 'Ruta 2025-004',
  tipoIngreso: 'Reingreso',
  tipoSospecha: 'Cérvix',
  motivoIngreso: 'Control de seguimiento post-procedimiento de cérvix.',
  fechaInicio: '04/11/2025',
  fechaCierre: '20/11/2025',
  estadoRuta: 'Finalizada',
  etapaActual: 'Cita diagnóstica / indicación médica',
  diasSinAvance: 0,
  proximoPaso: 'Ruta finalizada. Seguimiento completado satisfactoriamente.',
  etapas: mkRutaReingreso(6, 'Completado', {
    Reingreso: '04/11/2025',
    'Validación de datos y documentos': '05/11/2025',
    'Programación de cita': '06/11/2025',
    'Evaluación médica': '10/11/2025',
    Exámenes: '13/11/2025',
    Informe: '17/11/2025',
    'Cita diagnóstica / indicación médica': '20/11/2025',
  }),
  documentos: [
    { id: 'db1', nombre: 'DNI', etapa: 'Reingreso', estado: 'Recibido', observacion: 'Verificado.', obligatorio: true },
    { id: 'db2', nombre: 'Hoja de referencia anterior', etapa: 'Validación de datos y documentos', estado: 'Recibido', observacion: 'Historia clínica previa verificada.', obligatorio: true },
    { id: 'db3', nombre: 'Resultados de colposcopía', etapa: 'Exámenes', estado: 'Recibido', observacion: 'Entregados y procesados.', obligatorio: true },
  ],
  citas: [
    { id: 'cb1', tipo: 'Primera cita', servicio: 'Ginecología oncológica', fecha: '10/11/2025', hora: '09:00', lugar: 'Consultorio 7 - Mód. A', estado: 'Realizada', indicaciones: 'Evaluación realizada.', documentos: ['DNI'] },
    { id: 'cb2', tipo: 'Examen', servicio: 'Colposcopía', fecha: '13/11/2025', hora: '08:30', lugar: 'Imágenes - Piso 1', estado: 'Realizada', indicaciones: 'Examen realizado.', documentos: ['DNI'] },
    { id: 'cb3', tipo: 'Cita diagnóstica', servicio: 'Ginecología oncológica', fecha: '20/11/2025', hora: '10:00', lugar: 'Consultorio 7 - Mód. A', estado: 'Realizada', indicaciones: 'Se explicaron los resultados y los pasos siguientes.', documentos: ['DNI'] },
  ],
  alertas: [],
  acciones: [
    { id: 'acb1', fecha: '04/11/2025', autor: 'Navegadora L. Ríos', tipo: 'Actualización', detalle: 'Reingreso registrado. Historia clínica verificada.' },
    { id: 'acb2', fecha: '20/11/2025', autor: 'Navegadora L. Ríos', tipo: 'Actualización', detalle: 'Ruta finalizada. Proceso completado.' },
  ],
}

const maria: Paciente = {
  id: 'pac-001',
  dni: '****5678',
  nombres: 'María',
  apellidos: 'Quispe Gonzales',
  edad: 52,
  telefono: '999 ••• 999',
  procedencia: 'Ayacucho',
  esProvincia: true,
  idiomaPreferido: 'qu',
  bajaAlfabetizacion: true,
  cuidador: { nombre: 'Ana Quispe', parentesco: 'Hija', telefono: '988 ••• 888', estado: 'activo', recibeAlertas: true },
  rutaActivaId: 'ruta-001-a',
  rutasDiagnosticas: [rutaMaria001a, rutaMaria001b],
  // Legacy (sincronizado con ruta activa)
  tipoSospecha: 'Mama',
  etapaActual: 'Cita diagnóstica',
  riesgo: 'verde',
  diasSinAvance: 0,
  proximoPaso: rutaMaria001a.proximoPaso,
  citaPerdida: false,
  ruta: rutaMaria001a.etapas,
  documentos: rutaMaria001a.documentos,
  citas: rutaMaria001a.citas,
  alertas: rutaMaria001a.alertas,
  acciones: rutaMaria001a.acciones,
}

// ===================================================================
// PACIENTE 2 — Rosa López García (Avance normal)
// ===================================================================
const rutaRosa002a: RutaDiagnostica = {
  id: 'ruta-002-a',
  codigo: 'Ruta 2026-002',
  tipoIngreso: 'Primera vez',
  tipoSospecha: 'Cérvix',
  motivoIngreso: 'Resultado de PAP alterado. Referida para colposcopía.',
  fechaInicio: '11/06/2026',
  estadoRuta: 'Activa',
  etapaActual: 'Primera cita',
  diasSinAvance: 1,
  proximoPaso: 'Asistir a tu primera cita el 15/06 a las 10:00.',
  etapas: mkRuta(2, 'En proceso', {
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
  acciones: [],
}

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
  bajaAlfabetizacion: false,
  cuidador: undefined,
  rutaActivaId: 'ruta-002-a',
  rutasDiagnosticas: [rutaRosa002a],
  tipoSospecha: 'Cérvix',
  etapaActual: 'Primera cita',
  riesgo: 'verde',
  diasSinAvance: 1,
  proximoPaso: rutaRosa002a.proximoPaso,
  citaPerdida: false,
  ruta: rutaRosa002a.etapas,
  documentos: rutaRosa002a.documentos,
  citas: rutaRosa002a.citas,
  alertas: rutaRosa002a.alertas,
  acciones: rutaRosa002a.acciones,
}

// ===================================================================
// PACIENTE 3 — Juana Cárdenas Flores (Posible retraso, documentos)
// ===================================================================
const rutaJuana003a: RutaDiagnostica = {
  id: 'ruta-003-a',
  codigo: 'Ruta 2026-004',
  tipoIngreso: 'Primera vez',
  tipoSospecha: 'Mama',
  motivoIngreso: 'Masa palpable en mama izquierda. Referida desde posta médica.',
  fechaInicio: '08/06/2026',
  estadoRuta: 'Activa',
  etapaActual: 'Admisión',
  diasSinAvance: 5,
  proximoPaso: 'Llevar la copia física de tu hoja de referencia para terminar la admisión.',
  etapas: mkRuta(0, 'Observado', { Admisión: '08/06/2026' }),
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
  acciones: [],
}

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
  bajaAlfabetizacion: true,
  cuidador: undefined,
  rutaActivaId: 'ruta-003-a',
  rutasDiagnosticas: [rutaJuana003a],
  tipoSospecha: 'Mama',
  etapaActual: 'Admisión',
  riesgo: 'amarillo',
  diasSinAvance: 5,
  proximoPaso: rutaJuana003a.proximoPaso,
  citaPerdida: false,
  ruta: rutaJuana003a.etapas,
  documentos: rutaJuana003a.documentos,
  citas: rutaJuana003a.citas,
  alertas: rutaJuana003a.alertas,
  acciones: rutaJuana003a.acciones,
}

// ===================================================================
// PACIENTE 4 — Elena Torres Rojas (Posible retraso, informe)
// ===================================================================
const rutaElena004a: RutaDiagnostica = {
  id: 'ruta-004-a',
  codigo: 'Ruta 2026-005',
  tipoIngreso: 'Primera vez',
  tipoSospecha: 'Cérvix',
  motivoIngreso: 'Sangrado irregular. Referida para colposcopía.',
  fechaInicio: '02/06/2026',
  estadoRuta: 'Activa',
  etapaActual: 'Informe',
  diasSinAvance: 6,
  proximoPaso: 'Esperar el informe. El INEN te avisará cuando esté listo.',
  etapas: mkRuta(4, 'En proceso', {
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
  acciones: [
    { id: 'ac1', fecha: '11/06/2026', autor: 'Navegador J. Mendoza', tipo: 'Coordinación', detalle: 'Se coordinó con laboratorio para priorizar el informe.' },
  ],
}

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
  bajaAlfabetizacion: false,
  cuidador: { nombre: 'Lucía Torres', parentesco: 'Hermana', telefono: '944 ••• 944', estado: 'activo', recibeAlertas: true },
  rutaActivaId: 'ruta-004-a',
  rutasDiagnosticas: [rutaElena004a],
  tipoSospecha: 'Cérvix',
  etapaActual: 'Informe',
  riesgo: 'amarillo',
  diasSinAvance: 6,
  proximoPaso: rutaElena004a.proximoPaso,
  citaPerdida: false,
  ruta: rutaElena004a.etapas,
  documentos: rutaElena004a.documentos,
  citas: rutaElena004a.citas,
  alertas: rutaElena004a.alertas,
  acciones: rutaElena004a.acciones,
}

// ===================================================================
// PACIENTE 5 — Carmen Poma Sánchez (Retraso prioritario, reingreso)
// ===================================================================
const rutaCarmen005a: RutaDiagnostica = {
  id: 'ruta-005-a',
  codigo: 'Ruta 2026-003',
  tipoIngreso: 'Reingreso',
  tipoSospecha: 'Mama',
  motivoIngreso: 'Nueva sospecha en mama derecha tras seguimiento anterior.',
  fechaInicio: '03/06/2026',
  estadoRuta: 'Activa',
  etapaActual: 'Validación de datos y documentos',
  diasSinAvance: 9,
  proximoPaso: 'Programar cita de evaluación médica. Contactar a la navegadora.',
  etapas: mkRutaReingreso(1, 'Atrasado', {
    Reingreso: '03/06/2026',
    'Validación de datos y documentos': '04/06/2026',
  }),
  documentos: [
    { id: 'd1', nombre: 'DNI', etapa: 'Reingreso', estado: 'Recibido', observacion: 'Correcto.', obligatorio: true },
    { id: 'd2', nombre: 'Hoja de referencia', etapa: 'Reingreso', estado: 'Recibido', observacion: 'Recibida.', obligatorio: true },
    { id: 'd3', nombre: 'Historia clínica anterior', etapa: 'Validación de datos y documentos', estado: 'Recibido', observacion: 'Historia clínica existente verificada.', obligatorio: true },
    { id: 'd4', nombre: 'Autorización de acompañante', etapa: 'General', estado: 'Pendiente', observacion: 'No tiene acompañante registrado.', obligatorio: false },
  ],
  citas: [
    { id: 'c1', tipo: 'Primera cita', servicio: 'Mastología', fecha: 'Por programar', hora: '—', lugar: 'Requiere coordinación', estado: 'Pendiente de programación', indicaciones: 'Debe coordinarse con apoyo del navegador.', documentos: ['DNI'] },
  ],
  alertas: [
    { id: 'a1', tipo: 'demora', nivel: 'rojo', mensaje: 'Llevas 9 días sin avance en la validación de documentos.', accionRecomendada: 'Llamada prioritaria del navegador para retomar el proceso.', estado: 'Nueva', fecha: '13/06/2026' },
    { id: 'a2', tipo: 'cuidador', nivel: 'amarillo', mensaje: 'No tienes un acompañante registrado.', accionRecomendada: 'Sugerir registrar un familiar de contacto.', estado: 'Nueva', fecha: '12/06/2026' },
  ],
  acciones: [],
}

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
  bajaAlfabetizacion: true,
  cuidador: undefined,
  rutaActivaId: 'ruta-005-a',
  rutasDiagnosticas: [rutaCarmen005a],
  tipoSospecha: 'Mama',
  etapaActual: 'Validación de datos y documentos',
  riesgo: 'rojo',
  diasSinAvance: 9,
  proximoPaso: rutaCarmen005a.proximoPaso,
  citaPerdida: false,
  ruta: rutaCarmen005a.etapas,
  documentos: rutaCarmen005a.documentos,
  citas: rutaCarmen005a.citas,
  alertas: rutaCarmen005a.alertas,
  acciones: rutaCarmen005a.acciones,
}

export const PACIENTES: Paciente[] = [maria, rosa, juana, elena, carmen]

export const PACIENTE_DEMO_ID = 'pac-001'
