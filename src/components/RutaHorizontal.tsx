import { useState } from 'react'
import type { RutaDiagnostica, DocumentoRuta, EstudioRealizado, CitaRelacionada, Paciente } from '../types'
import { useApp } from '../context/AppContext'
import { Card } from './ui/Primitivos'
import Icon, { type IconName } from './ui/Icon'
import DocumentoViewerModal from './DocumentoViewerModal'
import AgendarCitaModal from './AgendarCitaModal'

// ── Types & constants ──────────────────────────────────────────────────────────

type TabId = 'admision' | 'hc' | 'citas' | 'examenes' | 'informes' | 'cita-diag'

interface TabDef {
  id: TabId
  label: string
  icon: IconName
  etapaNombre: string
}

const TABS: TabDef[] = [
  { id: 'admision',   label: 'Admisión',          icon: 'user',     etapaNombre: 'Admisión' },
  { id: 'hc',         label: 'Historia clínica',   icon: 'note',     etapaNombre: 'Historia clínica' },
  { id: 'citas',      label: 'Citas',              icon: 'calendar', etapaNombre: 'Primera cita' },
  { id: 'examenes',   label: 'Exámenes',           icon: 'search',   etapaNombre: 'Exámenes' },
  { id: 'informes',   label: 'Informes',           icon: 'doc',      etapaNombre: 'Informe' },
  { id: 'cita-diag',  label: 'Cita diagnóstica',   icon: 'flag',     etapaNombre: 'Cita diagnóstica' },
]

const CHIP: Record<string, string> = {
  Completado:        'bg-exito/12 text-exito',
  Realizada:         'bg-exito/12 text-exito',
  Registrado:        'bg-exito/12 text-exito',
  Validado:          'bg-exito/12 text-exito',
  Recibido:          'bg-exito/12 text-exito',
  Atendido:          'bg-exito/12 text-exito',
  Disponible:        'bg-marca-50 text-marca-700',
  Programado:        'bg-marca-50 text-marca-700',
  Programada:        'bg-marca-50 text-marca-700',
  'En proceso':      'bg-marca-50 text-marca-700',
  Pendiente:         'bg-precaucion/15 text-[#9a7400]',
  'Pendiente de cita': 'bg-precaucion/15 text-[#9a7400]',
}

const DEMO_EXAM: EstudioRealizado = {
  fecha: '—',
  estudio: 'Biopsia de muestra (pendiente, demo)',
  servicio: 'Patología',
  estado: 'Pendiente de cita',
  documentoAsociado: '—',
  observacion: 'Pendiente de programación para esta ruta',
  imagenUrl: '/documentos/13_biopsia_pendiente_agendar_mock.png',
}

// ── Shared UI helpers ──────────────────────────────────────────────────────────

function Chip({ estado }: { estado: string }) {
  return (
    <span className={`chip text-xs ${CHIP[estado] ?? 'bg-black/6 text-tinta/60'}`}>{estado}</span>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-2.5 text-xs font-semibold text-tinta/55 uppercase tracking-wide whitespace-nowrap bg-black/[0.03]">
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 text-sm text-tinta/80 align-top ${className}`}>{children}</td>
}

function FilaKV({ label, valor, chip }: { label: string; valor: string; chip?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-black/5 last:border-0 text-sm">
      <span className="text-tinta/45 shrink-0 w-52">{label}</span>
      {chip ? <Chip estado={valor} /> : <span className="font-medium text-tinta">{valor}</span>}
    </div>
  )
}

function SecLabel({ children }: { children: string }) {
  return <p className="text-sm font-semibold text-tinta/70 mb-3">{children}</p>
}

function Resumen({ children }: { children: string }) {
  return (
    <div className="rounded-2xl bg-marca-50/50 border border-marca-200/40 px-4 py-3">
      <p className="text-sm text-tinta/80 leading-relaxed">{children}</p>
    </div>
  )
}

// ── Panel Admisión ─────────────────────────────────────────────────────────────

function PanelAdmision({
  ruta,
  documentosRuta,
  onVerDoc,
  paciente,
}: {
  ruta: RutaDiagnostica
  documentosRuta: DocumentoRuta[]
  onVerDoc: (doc: DocumentoRuta) => void
  paciente?: Paciente
}) {
  const d = ruta.etapas.find((e) => e.nombre === 'Admisión')?.detalle
  const docs = documentosRuta.filter((doc) => doc.etapa === 'Admisión')

  const datosPaciente: { icon: IconName; label: string; value: string }[] = paciente ? [
    { icon: 'user',    label: 'Nombre completo',    value: `${paciente.nombres} ${paciente.apellidos}` },
    { icon: 'shield',  label: 'DNI',                value: paciente.dni },
    { icon: 'clock',   label: 'Edad',               value: `${paciente.edad} años` },
    { icon: 'pin',     label: 'Procedencia',        value: `${paciente.procedencia}${paciente.esProvincia ? ' · Provincia' : ''}` },
    { icon: 'phone',   label: 'Teléfono',           value: paciente.telefono },
    { icon: 'globe',   label: 'Idioma preferido',   value: paciente.idiomaPreferido === 'qu' ? 'Quechua / Español' : 'Español' },
    ...(paciente.cuidador
      ? [{ icon: 'users' as IconName, label: 'Cuidadora/or', value: `${paciente.cuidador.nombre} (${paciente.cuidador.parentesco})` }]
      : []),
    ...(paciente.bajaAlfabetizacion
      ? [{ icon: 'help' as IconName, label: 'Necesidad especial', value: 'Orientación en lenguaje simple' }]
      : []),
  ] : []

  return (
    <div className="space-y-4">
      <Resumen>
        {d?.resumenPaciente ??
          'Se validaron los documentos iniciales para iniciar la atención en el INEN.'}
      </Resumen>

      {datosPaciente.length > 0 && (
        <Card>
          <SecLabel>Datos del paciente</SecLabel>
          <div className="divide-y divide-black/5">
            {datosPaciente.map((f) => (
              <div key={f.label} className="flex items-center gap-3 py-2.5">
                <div className="w-7 h-7 rounded-lg bg-marca-50 flex items-center justify-center shrink-0">
                  <Icon name={f.icon} size={14} className="text-marca-500" />
                </div>
                <span className="text-xs text-tinta/45 w-36 shrink-0">{f.label}</span>
                <span className="text-sm font-medium text-tinta">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {d?.datosAdmision && d.datosAdmision.length > 0 && (
        <Card>
          <SecLabel>Datos de admisión</SecLabel>
          {d.datosAdmision.map((f) => (
            <FilaKV key={f.label} label={f.label} valor={f.value}
              chip={f.label.toLowerCase().includes('estado')} />
          ))}
        </Card>
      )}

      <Card>
        <SecLabel>Documentos de admisión</SecLabel>
        <div className="overflow-x-auto rounded-2xl border border-black/8">
          <table className="w-full text-sm min-w-[440px]">
            <thead>
              <tr className="border-b border-black/8">
                <Th>Documento</Th><Th>Fecha</Th><Th>Estado</Th><Th>Acción</Th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-sm text-tinta/40 italic text-center">
                    Sin documentos registrados
                  </td>
                </tr>
              )}
              {docs.map((doc, i) => (
                <tr
                  key={doc.id}
                  className={`border-b border-black/5 last:border-0 ${i % 2 ? 'bg-black/[0.015]' : ''}`}
                >
                  <Td className="font-medium">{doc.nombre}</Td>
                  <Td className="whitespace-nowrap">{doc.fecha}</Td>
                  <Td><Chip estado={doc.estado} /></Td>
                  <Td>
                    {doc.imagenUrl ? (
                      <button
                        onClick={() => onVerDoc(doc)}
                        className="inline-flex items-center gap-1 text-xs text-marca-600 font-semibold hover:underline"
                      >
                        <Icon name="doc" size={13} /> Ver
                      </button>
                    ) : (
                      <span className="text-xs text-tinta/30">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Panel Historia clínica — datos mock ───────────────────────────────────────

interface Atencion {
  fecha: string
  etapa: string
  servicio: string
  responsable: string
  resultado: string
  titulo: string
  detalles: string[]
  docs?: string[]
  icon: IconName
  colorBg: string
  colorText: string
  dot: string
}

const ATENCIONES_2026: Atencion[] = [
  {
    fecha: '04/06/2026', etapa: 'Admisión', servicio: 'Módulo de Admisión e Informes',
    responsable: 'Personal de Admisión', resultado: 'Completado',
    titulo: 'Ingreso y validación de documentos',
    docs: ['DNI (validado)', 'Hoja de referencia', 'Ticket N° 2026-004389', 'Exámenes previos (2 docs)'],
    detalles: [
      'DNI presentado y verificado en sistema',
      'Hoja de referencia recibida y registrada',
      'Ticket de atención N° 2026-004389 asignado',
      'Exámenes previos presentados: 2 documentos recibidos',
      'Teléfono de contacto actualizado en sistema',
      'Cuidadora Ana Quispe (Hija) registrada como contacto',
    ],
    icon: 'user', colorBg: 'bg-marca-50', colorText: 'text-marca-600', dot: 'bg-marca-400',
  },
  {
    fecha: '05/06/2026', etapa: 'Historia clínica', servicio: 'Gestión de Historia Clínica',
    responsable: 'Unidad de Gestión HC', resultado: 'Verificada',
    titulo: 'Apertura y verificación de historia clínica',
    docs: ['Ficha de datos personales (HC-2026-001)'],
    detalles: [
      'Historia clínica aperturada: código HC-2026-001',
      'Tipo de ingreso registrado: Primera vez · Sospecha mama',
      'Canal de comunicación preferido: WhatsApp y llamada telefónica',
      'Idioma preferido: Español / Quechua registrado',
      'Necesidad de apoyo en lenguaje simple registrada',
      'Ruta diagnóstica Ruta 2026-001 asociada al expediente',
    ],
    icon: 'note', colorBg: 'bg-marca-50', colorText: 'text-marca-600', dot: 'bg-marca-400',
  },
  {
    fecha: '06/06/2026', etapa: 'Seguimiento', servicio: 'OncoRuta — Navegación',
    responsable: 'Navegadora L. Ríos', resultado: 'Enviado',
    titulo: 'Recordatorio de primera cita enviado',
    detalles: [
      'Mensaje enviado por WhatsApp al número registrado',
      'Indicaciones de la cita comunicadas a la paciente y cuidadora',
      'Confirmación de lectura registrada en sistema',
    ],
    icon: 'whatsapp', colorBg: 'bg-exito/12', colorText: 'text-exito', dot: 'bg-exito',
  },
  {
    fecha: '07/06/2026', etapa: 'Primera cita', servicio: 'Mamas y Tejidos Blandos — Consultorio 3',
    responsable: 'Especialista de Mama', resultado: 'Completada',
    titulo: 'Primera atención médica en especialidad',
    docs: ['Constancia de primera atención (Doc. 05)'],
    detalles: [
      'Atención realizada en Servicio de Mamas y Tejidos Blandos',
      'Revisión de documentos e historia clínica presentados',
      'Indicación de estudios complementarios de apoyo',
      'Constancia de primera atención emitida',
      'Próxima acción: programación de exámenes indicados',
    ],
    icon: 'calendar', colorBg: 'bg-marca-50', colorText: 'text-marca-600', dot: 'bg-marca-400',
  },
  {
    fecha: '10/06/2026', etapa: 'Exámenes', servicio: 'Servicio de Imagenología',
    responsable: 'Técnico de Imagenología', resultado: 'Realizado',
    titulo: 'Mamografía bilateral realizada',
    docs: ['Orden de examen (Doc. 06)', 'Imágenes mamografía bilateral (Doc. 10)'],
    detalles: [
      'Estudio realizado en Servicio de Imagenología',
      'Preparación previa seguida correctamente por la paciente',
      'Duración aproximada: 20 minutos',
      'Imágenes registradas y almacenadas en el sistema',
    ],
    icon: 'search', colorBg: 'bg-exito/12', colorText: 'text-exito', dot: 'bg-exito',
  },
  {
    fecha: '10/06/2026', etapa: 'Seguimiento', servicio: 'OncoRuta — Sistema automático',
    responsable: 'Sistema OncoRuta', resultado: 'Enviado',
    titulo: 'Recordatorio de estudios enviado por SMS',
    detalles: [
      'SMS enviado con recordatorio de estudios programados',
      'Confirmación de asistencia recibida por la paciente',
    ],
    icon: 'sms', colorBg: 'bg-exito/12', colorText: 'text-exito', dot: 'bg-exito',
  },
  {
    fecha: '11/06/2026', etapa: 'Exámenes', servicio: 'Servicio de Imagenología',
    responsable: 'Técnico de Imagenología', resultado: 'Realizado',
    titulo: 'Ecografía mamaria realizada',
    docs: ['Imágenes ecografía mamaria (Doc. 11)'],
    detalles: [
      'Estudio complementario realizado en Imagenología',
      'Duración aproximada: 15 minutos',
      'Imágenes almacenadas y disponibles para revisión médica',
      'Estudio complementario al realizado el día anterior',
    ],
    icon: 'search', colorBg: 'bg-exito/12', colorText: 'text-exito', dot: 'bg-exito',
  },
  {
    fecha: '12/06/2026', etapa: 'Exámenes', servicio: 'Servicio correspondiente',
    responsable: 'Personal especializado', resultado: 'Realizado',
    titulo: 'Procedimiento indicado por médico realizado',
    docs: ['Registro de procedimiento (Doc. 12)', 'Constancia de estudio (Doc. 07)'],
    detalles: [
      'Procedimiento realizado según indicación médica de primera cita',
      'Consentimiento informado firmado previo al procedimiento',
      'Registro de procedimiento actualizado en el sistema',
      'Constancia de estudio realizado emitida',
    ],
    icon: 'search', colorBg: 'bg-exito/12', colorText: 'text-exito', dot: 'bg-exito',
  },
  {
    fecha: '12/06/2026', etapa: 'Seguimiento', servicio: 'Navegación OncoRuta',
    responsable: 'Navegadora L. Ríos', resultado: 'Confirmado',
    titulo: 'Confirmación de estudios completados — llamada',
    detalles: [
      'Llamada telefónica realizada a la paciente y su cuidadora',
      'Se confirmó la realización de los tres estudios programados',
      'Indicaciones para la espera del informe comunicadas',
      'Estado de la paciente: sin incidencias reportadas',
    ],
    icon: 'phone', colorBg: 'bg-exito/12', colorText: 'text-exito', dot: 'bg-exito',
  },
  {
    fecha: '15/06/2026', etapa: 'Informe', servicio: 'Servicio de Apoyo Diagnóstico',
    responsable: 'Apoyo Diagnóstico', resultado: 'Disponible',
    titulo: 'Informe de estudios disponible',
    docs: ['Informe de estudios (Doc. 08)'],
    detalles: [
      'Informe emitido por el Servicio de Apoyo Diagnóstico',
      'Informe disponible para revisión por el médico especialista',
      'Notificación interna generada a la navegadora y al servicio',
      'Registro en sistema actualizado con fecha de disponibilidad',
    ],
    icon: 'doc', colorBg: 'bg-marca-50', colorText: 'text-marca-600', dot: 'bg-marca-400',
  },
  {
    fecha: '18/06/2026', etapa: 'Cita diagnóstica', servicio: 'Consultorio Especializado — Módulo B',
    responsable: 'Médico Especialista', resultado: 'Completada',
    titulo: 'Cita diagnóstica — revisión de estudios y cierre de ruta',
    docs: ['Resumen de cita diagnóstica (Doc. 09)'],
    detalles: [
      'Consulta realizada en Consultorio Especializado',
      'Revisión de todos los estudios de la ruta por el especialista',
      'Información de hallazgos entregada a la paciente y cuidadora',
      'Resumen de cita diagnóstica emitido',
      'Ruta diagnóstica Ruta 2026-001 finalizada y cerrada en el sistema',
    ],
    icon: 'flag', colorBg: 'bg-marca-50', colorText: 'text-marca-600', dot: 'bg-marca-400',
  },
  {
    fecha: '18/06/2026', etapa: 'Seguimiento', servicio: 'Navegación OncoRuta',
    responsable: 'Navegadora L. Ríos', resultado: 'Completado',
    titulo: 'Cierre de ruta y registro final en sistema',
    detalles: [
      'Ruta 2026-001 cerrada en el sistema por la navegadora',
      'Registro de cierre: todas las etapas completadas sin incidencias',
      'Indicaciones de próximos pasos comunicadas a la paciente',
      'Expediente actualizado con cierre de ruta',
    ],
    icon: 'check', colorBg: 'bg-exito/12', colorText: 'text-exito', dot: 'bg-exito',
  },
]

const ATENCIONES_2025: Atencion[] = [
  {
    fecha: '04/11/2025', etapa: 'Reingreso', servicio: 'Módulo de Admisión',
    responsable: 'Personal de Admisión', resultado: 'Completado',
    titulo: 'Reingreso registrado — control de seguimiento',
    docs: ['DNI (validado)', 'Hoja de referencia anterior'],
    detalles: [
      'DNI y hoja de referencia anterior verificados',
      'Historia clínica previa verificada en sistema',
      'Motivo: control de seguimiento post-procedimiento de cérvix',
      'Ruta 2025-004 aperturada en sistema',
    ],
    icon: 'user', colorBg: 'bg-marca-50', colorText: 'text-marca-600', dot: 'bg-marca-400',
  },
  {
    fecha: '05/11/2025', etapa: 'Validación', servicio: 'Gestión de Historia Clínica',
    responsable: 'Unidad de Gestión HC', resultado: 'Validado',
    titulo: 'Validación de datos y documentos',
    docs: ['Documentos de colposcopía previa'],
    detalles: [
      'Expediente clínico revisado y validado',
      'Documentos de colposcopía previa recibidos y registrados',
      'Ruta diagnóstica Ruta 2025-004 asociada al expediente',
    ],
    icon: 'note', colorBg: 'bg-marca-50', colorText: 'text-marca-600', dot: 'bg-marca-400',
  },
  {
    fecha: '06/11/2025', etapa: 'Seguimiento', servicio: 'OncoRuta — Navegación',
    responsable: 'Navegadora L. Ríos', resultado: 'Enviado',
    titulo: 'Cita de evaluación programada y recordatorio enviado',
    detalles: [
      'Cita programada en Ginecología oncológica para el 10/11/2025',
      'Recordatorio enviado por WhatsApp a la paciente',
      'Indicaciones previas a la evaluación comunicadas',
    ],
    icon: 'whatsapp', colorBg: 'bg-exito/12', colorText: 'text-exito', dot: 'bg-exito',
  },
  {
    fecha: '10/11/2025', etapa: 'Evaluación médica', servicio: 'Ginecología oncológica — Consultorio 7',
    responsable: 'Especialista en Ginecología Oncológica', resultado: 'Completada',
    titulo: 'Evaluación médica de control',
    detalles: [
      'Evaluación realizada en Ginecología oncológica',
      'Revisión de antecedentes y documentos de ruta previa',
      'Indicación de colposcopía de control',
      'Próxima acción: programación de colposcopía',
    ],
    icon: 'calendar', colorBg: 'bg-marca-50', colorText: 'text-marca-600', dot: 'bg-marca-400',
  },
  {
    fecha: '13/11/2025', etapa: 'Exámenes', servicio: 'Servicio de Imágenes — Piso 1',
    responsable: 'Técnico de Imágenes', resultado: 'Realizado',
    docs: ['Resultados de colposcopía de control'],
    titulo: 'Colposcopía de control realizada',
    detalles: [
      'Estudio realizado en Servicio de Imágenes',
      'Resultados de colposcopía entregados y procesados en sistema',
      'Imágenes almacenadas en expediente',
    ],
    icon: 'search', colorBg: 'bg-exito/12', colorText: 'text-exito', dot: 'bg-exito',
  },
  {
    fecha: '17/11/2025', etapa: 'Informe', servicio: 'Apoyo Diagnóstico',
    responsable: 'Apoyo Diagnóstico', resultado: 'Disponible',
    titulo: 'Informe de control disponible',
    docs: ['Informe de colposcopía de control'],
    detalles: [
      'Informe emitido por el servicio de apoyo diagnóstico',
      'Disponible para revisión por el médico especialista',
      'Notificación interna generada a la navegadora',
    ],
    icon: 'doc', colorBg: 'bg-marca-50', colorText: 'text-marca-600', dot: 'bg-marca-400',
  },
  {
    fecha: '20/11/2025', etapa: 'Cita diagnóstica', servicio: 'Ginecología oncológica — Consultorio 7',
    responsable: 'Especialista en Ginecología Oncológica', resultado: 'Completada',
    titulo: 'Cita diagnóstica de control y cierre de ruta',
    detalles: [
      'Consulta realizada en Ginecología oncológica',
      'Revisión de resultados del estudio de control',
      'Información entregada a la paciente y cuidadora',
      'Ruta 2025-004 finalizada y cerrada en el sistema',
    ],
    icon: 'flag', colorBg: 'bg-marca-50', colorText: 'text-marca-600', dot: 'bg-marca-400',
  },
  {
    fecha: '20/11/2025', etapa: 'Seguimiento', servicio: 'Navegación OncoRuta',
    responsable: 'Navegadora L. Ríos', resultado: 'Completado',
    titulo: 'Cierre de ruta 2025 y registro final',
    detalles: [
      'Ruta 2025-004 cerrada en el sistema',
      'Proceso completado satisfactoriamente',
      'Expediente actualizado con cierre de ruta',
    ],
    icon: 'check', colorBg: 'bg-exito/12', colorText: 'text-exito', dot: 'bg-exito',
  },
]

function TimelineItem({ ev, isLast }: { ev: Atencion; isLast: boolean }) {
  return (
    <div className="flex gap-3 relative">
      {!isLast && (
        <div className="absolute left-4 top-10 w-px bottom-0 bg-gradient-to-b from-black/12 to-transparent" />
      )}
      <div className={`w-8 h-8 rounded-xl shrink-0 mt-2 z-10 flex items-center justify-center ${ev.colorBg}`}>
        <Icon name={ev.icon} size={14} className={ev.colorText} />
      </div>
      <div className="flex-1 pb-5 min-w-0">
        {/* Cabecera */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="text-[11px] text-tinta/40 font-semibold">{ev.fecha}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ev.colorBg} ${ev.colorText}`}>
            {ev.etapa}
          </span>
        </div>
        <p className="text-sm font-semibold text-tinta leading-snug mb-2">{ev.titulo}</p>

        {/* Mini-card de detalle estructurado */}
        <div className="rounded-xl border border-black/6 bg-black/[0.018] divide-y divide-black/5 mb-3">
          <div className="grid grid-cols-2 gap-x-3 px-3 py-2">
            <div>
              <p className="text-[9px] text-tinta/35 font-bold uppercase tracking-wider mb-0.5">Servicio / Área</p>
              <p className="text-xs text-tinta/70 font-medium leading-snug">{ev.servicio}</p>
            </div>
            <div>
              <p className="text-[9px] text-tinta/35 font-bold uppercase tracking-wider mb-0.5">Responsable</p>
              <p className="text-xs text-tinta/70 font-medium leading-snug">{ev.responsable}</p>
            </div>
          </div>
          <div className={`px-3 py-2 flex items-center justify-between gap-2`}>
            <p className="text-[9px] text-tinta/35 font-bold uppercase tracking-wider">Resultado</p>
            <span className={`text-[11px] font-bold ${ev.colorText}`}>{ev.resultado}</span>
          </div>
          {ev.docs && ev.docs.length > 0 && (
            <div className="px-3 py-2">
              <p className="text-[9px] text-tinta/35 font-bold uppercase tracking-wider mb-1.5">Documentos vinculados</p>
              <div className="flex flex-wrap gap-1.5">
                {ev.docs.map((doc, k) => (
                  <span key={k} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-white border border-black/8 text-tinta/60 font-medium">
                    <Icon name="doc" size={10} className="text-tinta/35" />
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detalles con viñetas */}
        <ul className="space-y-1">
          {ev.detalles.map((det, j) => (
            <li key={j} className="flex items-start gap-1.5 text-xs text-tinta/55">
              <span className={`w-1.5 h-1.5 rounded-full ${ev.dot} mt-1 shrink-0`} />
              {det}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Panel Historia clínica ─────────────────────────────────────────────────────

function PanelHistoriaClinica({
  ruta,
  documentosRuta,
  onVerDoc,
  onVerHistorial,
  paciente,
}: {
  ruta: RutaDiagnostica
  documentosRuta: DocumentoRuta[]
  onVerDoc: (doc: DocumentoRuta) => void
  onVerHistorial: () => void
  paciente?: Paciente
}) {
  const [mostrar2025, setMostrar2025] = useState(false)
  const d = ruta.etapas.find((e) => e.nombre === 'Historia clínica')?.detalle
  const docHC = documentosRuta.filter((doc) => doc.etapa === 'Historia clínica')
  const rutasAnteriores = paciente?.rutasDiagnosticas.filter((r) => r.id !== ruta.id) ?? []

  return (
    <div className="space-y-4">

      {/* ── 1. Ficha de identidad HC ── */}
      <div className="rounded-2xl border border-black/8 bg-gradient-to-br from-marca-50/60 to-white overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-black/6">
          <div className="w-10 h-10 rounded-xl bg-marca-100 flex items-center justify-center shrink-0">
            <Icon name="note" size={19} className="text-marca-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-tinta/40 font-semibold uppercase tracking-widest mb-0.5">Historia clínica</p>
            <p className="text-xl font-bold text-tinta tracking-tight">{d?.codigoHistoriaClinica ?? '—'}</p>
          </div>
          <Chip estado={d?.estadoHistoriaClinica ?? 'Verificada'} />
        </div>
        <div className="grid grid-cols-3 divide-x divide-black/6">
          {[
            { label: 'Registro', value: d?.fechaRegistro ?? '—', icon: 'calendar' as const },
            { label: 'Actualización', value: d?.ultimaActualizacion ?? '—', icon: 'clock' as const },
            { label: 'Área', value: 'Gestión HC', icon: 'shield' as const },
          ].map((f) => (
            <div key={f.label} className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon name={f.icon} size={11} className="text-tinta/35" />
                <p className="text-[10px] text-tinta/40 font-semibold uppercase tracking-wide">{f.label}</p>
              </div>
              <p className="text-sm font-semibold text-tinta">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. Rutas registradas ── */}
      <Card>
        <SecLabel>Rutas diagnósticas registradas</SecLabel>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-marca-50/60 border border-marca-100">
            <div className="w-8 h-8 rounded-xl bg-marca-100 flex items-center justify-center shrink-0">
              <Icon name="ruta" size={14} className="text-marca-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-sm font-bold text-tinta">{ruta.codigo}</span>
                <Chip estado={ruta.estadoRuta} />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-marca-500 text-white uppercase tracking-wide">
                  Activa
                </span>
              </div>
              <p className="text-xs text-tinta/50">
                {ruta.tipoIngreso} · {ruta.tipoSospecha} · {ruta.fechaInicio}{ruta.fechaCierre ? ` – ${ruta.fechaCierre}` : ''}
              </p>
            </div>
          </div>
          {rutasAnteriores.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-black/8">
              <div className="w-8 h-8 rounded-xl bg-black/[0.04] flex items-center justify-center shrink-0">
                <Icon name="ruta" size={14} className="text-tinta/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-semibold text-tinta/70">{r.codigo}</span>
                  <Chip estado={r.estadoRuta} />
                </div>
                <p className="text-xs text-tinta/40">
                  {r.tipoIngreso} · {r.tipoSospecha} · {r.fechaInicio}{r.fechaCierre ? ` – ${r.fechaCierre}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 3. Historial completo de atenciones — Ruta 2026 ── */}
      <Card>
        <p className="text-sm font-semibold text-tinta/70 mb-3">Historial de atenciones — {ruta.codigo}</p>
        <div className="mt-1">
          {ATENCIONES_2026.map((ev, i) => (
            <TimelineItem key={i} ev={ev} isLast={i === ATENCIONES_2026.length - 1} />
          ))}
        </div>
      </Card>

      {/* ── 4. Historial ruta 2025 — colapsable ── */}
      <Card>
        <button
          onClick={() => setMostrar2025(!mostrar2025)}
          className="w-full flex items-center justify-between text-left gap-3"
        >
          <p className="text-sm font-semibold text-tinta/70">
            Historial de atenciones — Ruta 2025-004 (Cérvix · Reingreso)
          </p>
          <Icon
            name="right"
            size={16}
            className={`text-tinta/40 transition-transform shrink-0 ${mostrar2025 ? 'rotate-90' : ''}`}
          />
        </button>
        {mostrar2025 && (
          <div className="mt-3 pt-3 border-t border-black/5">
            {ATENCIONES_2025.map((ev, i) => (
              <TimelineItem key={i} ev={ev} isLast={i === ATENCIONES_2025.length - 1} />
            ))}
          </div>
        )}
      </Card>

      {/* ── 5. Documento HC + acceso al historial ── */}
      <div className="flex flex-wrap gap-3">
        {docHC.map(
          (doc) =>
            doc.imagenUrl && (
              <button
                key={doc.id}
                onClick={() => onVerDoc(doc)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-black/8 bg-white hover:border-marca-300 hover:bg-marca-50/50 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-black/[0.04] group-hover:bg-marca-100 flex items-center justify-center transition-colors">
                  <Icon name="doc" size={16} className="text-tinta/50 group-hover:text-marca-600 transition-colors" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-tinta/35 font-semibold uppercase tracking-wide">Documento</p>
                  <p className="text-sm font-semibold text-tinta/80 group-hover:text-marca-700 transition-colors">{doc.nombre}</p>
                </div>
              </button>
            ),
        )}
        <button
          onClick={onVerHistorial}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-marca-500 hover:bg-marca-600 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Icon name="note" size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wide">Resumen operativo</p>
            <p className="text-sm font-semibold text-white">Ver historial clínico</p>
          </div>
        </button>
      </div>
    </div>
  )
}

// ── Panel Citas ────────────────────────────────────────────────────────────────

function PanelCitas({
  ruta,
  citasExtra,
  rutaFinalizada,
}: {
  ruta: RutaDiagnostica
  citasExtra: CitaRelacionada[]
  rutaFinalizada: boolean
}) {
  const citasBase =
    ruta.etapas.find((e) => e.nombre === 'Primera cita')?.detalle?.citasRelacionadas ?? []
  const todas = [...citasBase, ...citasExtra]

  return (
    <div className="space-y-4">
      <Resumen>Estas son las citas y programaciones asociadas a tu ruta diagnóstica.</Resumen>

      <Card>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <SecLabel>Citas y programaciones</SecLabel>
          {rutaFinalizada ? (
            <span className="text-xs text-tinta/40 italic">
              Ruta finalizada · Para una nueva atención, crea una nueva ruta
            </span>
          ) : (
            <button className="inline-flex items-center gap-1 text-xs text-marca-600 font-semibold border border-marca-200 rounded-lg px-3 py-1.5 hover:bg-marca-50 transition">
              <Icon name="plus" size={13} /> Agendar nueva cita
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-black/8">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-black/8">
                <Th>Fecha</Th><Th>Hora</Th><Th>Tipo</Th>
                <Th>Servicio</Th><Th>Lugar</Th><Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {todas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-sm text-tinta/40 italic text-center">
                    Sin citas registradas
                  </td>
                </tr>
              )}
              {todas.map((c, i) => (
                <tr
                  key={i}
                  className={`border-b border-black/5 last:border-0 ${i % 2 ? 'bg-black/[0.015]' : ''}`}
                >
                  <Td className="whitespace-nowrap">{c.fecha}</Td>
                  <Td className="whitespace-nowrap">{c.hora}</Td>
                  <Td>{c.tipo}</Td>
                  <Td>{c.servicio}</Td>
                  <Td>{c.lugar}</Td>
                  <Td><Chip estado={c.estado} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Panel Exámenes ─────────────────────────────────────────────────────────────

function PanelExamenes({
  examenes,
  onAgendar,
  onVerDoc,
}: {
  examenes: EstudioRealizado[]
  onAgendar: (e: EstudioRealizado) => void
  onVerDoc: (doc: DocumentoRuta) => void
}) {
  return (
    <div className="space-y-4">
      <Resumen>
        Aquí se muestran los estudios solicitados dentro de la ruta. Si algún estudio está pendiente,
        puedes solicitar o agendar una cita.
      </Resumen>

      <Card>
        <SecLabel>Estudios de la ruta</SecLabel>
        <div className="overflow-x-auto rounded-2xl border border-black/8">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-black/8">
                <Th>Fecha</Th><Th>Estudio</Th><Th>Servicio</Th>
                <Th>Estado</Th><Th>Documento</Th><Th>Acción</Th>
              </tr>
            </thead>
            <tbody>
              {examenes.map((e, i) => (
                <tr
                  key={i}
                  className={`border-b border-black/5 last:border-0 ${i % 2 ? 'bg-black/[0.015]' : ''}`}
                >
                  <Td className="whitespace-nowrap">{e.fecha}</Td>
                  <Td>{e.estudio}</Td>
                  <Td>{e.servicio}</Td>
                  <Td><Chip estado={e.estado} /></Td>
                  <Td className="text-tinta/55">{e.documentoAsociado}</Td>
                  <Td>
                    {e.estado === 'Pendiente de cita' && (
                      <button
                        onClick={() => onAgendar(e)}
                        className="inline-flex items-center gap-1 text-xs text-marca-600 font-semibold hover:underline"
                      >
                        <Icon name="calendar" size={13} /> Agendar cita
                      </button>
                    )}
                    {e.estado === 'Programado' && (
                      <span className="text-xs text-marca-600 font-medium">✓ Programado</span>
                    )}
                    {e.imagenUrl ? (
                      <button
                        onClick={() => onVerDoc({ id: `exam-${i}`, nombre: e.estudio, etapa: 'Exámenes', fecha: e.fecha, estado: e.estado, imagenUrl: e.imagenUrl })}
                        className="inline-flex items-center gap-1 text-xs text-marca-600 font-semibold hover:underline"
                      >
                        <Icon name="doc" size={13} /> Ver
                      </button>
                    ) : e.estado === 'Completado' ? (
                      <span className="text-xs text-tinta/35">—</span>
                    ) : null}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-tinta/40 mt-3 italic">
          Los estudios fueron realizados según indicación médica. OncoRuta registra el seguimiento; no interpreta resultados.
        </p>
      </Card>
    </div>
  )
}

// ── Panel Informes ─────────────────────────────────────────────────────────────

function PanelInformes({ ruta }: { ruta: RutaDiagnostica }) {
  const [expandido, setExpandido] = useState<number | null>(null)
  const informes =
    ruta.etapas.find((e) => e.nombre === 'Informe')?.detalle?.informesDisponibles ?? []

  return (
    <div className="space-y-4">
      <Resumen>
        Aquí se muestran los informes disponibles asociados a los estudios de la ruta.
      </Resumen>

      <Card>
        <SecLabel>Informes disponibles</SecLabel>
        <div className="overflow-x-auto rounded-2xl border border-black/8">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-black/8">
                <Th>Fecha</Th><Th>Tipo de informe</Th><Th>Servicio</Th>
                <Th>Estado</Th><Th>Acción</Th>
              </tr>
            </thead>
            <tbody>
              {informes.map((inf, i) => (
                <React.Fragment key={i}>
                  <tr
                    className={`border-b border-black/5 ${
                      expandido === i ? 'bg-marca-50/30' : i % 2 ? 'bg-black/[0.015]' : ''
                    }`}
                  >
                    <Td className="whitespace-nowrap">{inf.fecha}</Td>
                    <Td>{inf.tipoInforme}</Td>
                    <Td>{inf.servicio}</Td>
                    <Td><Chip estado={inf.estado} /></Td>
                    <Td>
                      <button
                        onClick={() => setExpandido(expandido === i ? null : i)}
                        className="inline-flex items-center gap-1 text-xs text-marca-600 font-semibold hover:underline"
                      >
                        <Icon name="doc" size={13} /> Ver resumen
                      </button>
                    </Td>
                  </tr>
                  {expandido === i && (
                    <tr className="border-b border-black/5 bg-ayuda/5">
                      <td colSpan={5} className="px-4 py-3">
                        <p className="text-xs text-ayuda/80 leading-relaxed">{inf.resumenSeguro}</p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Panel Cita diagnóstica ─────────────────────────────────────────────────────

function PanelCitaDiagnostica({
  ruta,
  documentosRuta,
  onVerDoc,
  onVerHistorial,
}: {
  ruta: RutaDiagnostica
  documentosRuta: DocumentoRuta[]
  onVerDoc: (doc: DocumentoRuta) => void
  onVerHistorial: () => void
}) {
  const d = ruta.etapas.find((e) => e.nombre === 'Cita diagnóstica')?.detalle
  const docResumen = documentosRuta.find((doc) => doc.id === 'doc-resumen')

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-exito/10 to-marca-50 border border-exito/20 px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-exito/15 text-exito shrink-0 mt-0.5">
            <Icon name="check" size={20} />
          </span>
          <div>
            <p className="font-semibold text-tinta mb-1">Ruta diagnóstica finalizada</p>
            <p className="text-sm text-tinta/75 leading-relaxed">{d?.resumenPaciente}</p>
          </div>
        </div>
      </div>

      {d?.resumenCierreRuta && d.resumenCierreRuta.length > 0 && (
        <Card>
          <SecLabel>Resumen de la cita diagnóstica</SecLabel>
          {d.resumenCierreRuta.map((f) => (
            <FilaKV key={f.label} label={f.label} valor={f.value}
              chip={f.label.toLowerCase().includes('estado')} />
          ))}
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        {docResumen?.imagenUrl && (
          <button
            onClick={() => onVerDoc(docResumen)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-marca-300 text-marca-700 text-sm font-semibold hover:bg-marca-50 transition"
          >
            <Icon name="doc" size={15} /> Ver resumen de cita diagnóstica
          </button>
        )}
        <button
          onClick={onVerHistorial}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-marca-500 text-white text-sm font-semibold hover:bg-marca-600 transition"
        >
          <Icon name="note" size={15} /> Ver historial clínico resumido
        </button>
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────

import React from 'react'

interface Props {
  ruta: RutaDiagnostica
  documentosRuta: DocumentoRuta[]
  onVerHistorial: () => void
}

function tabInicial(ruta: RutaDiagnostica): TabId {
  if (ruta.estadoRuta === 'Finalizada') return 'cita-diag'
  const map: Partial<Record<string, TabId>> = {
    'Admisión':         'admision',
    'Historia clínica': 'hc',
    'Primera cita':     'citas',
    'Exámenes':         'examenes',
    'Informe':          'informes',
    'Cita diagnóstica': 'cita-diag',
  }
  return map[ruta.etapaActual] ?? 'admision'
}

export default function RutaHorizontal({ ruta, documentosRuta, onVerHistorial }: Props) {
  const { pacienteActivo } = useApp()
  const paciente = pacienteActivo()
  const [tabActivo, setTabActivo] = useState<TabId>(() => tabInicial(ruta))
  const [docViewer, setDocViewer] = useState<DocumentoRuta | null>(null)
  const [agendarTarget, setAgendarTarget] = useState<EstudioRealizado | null>(null)
  const [citasExtra, setCitasExtra] = useState<CitaRelacionada[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const baseExamenes =
    ruta.etapas.find((e) => e.nombre === 'Exámenes')?.detalle?.estudiosRealizados ?? []
  const [examenes, setExamenes] = useState<EstudioRealizado[]>([...baseExamenes, DEMO_EXAM])

  const rutaFinalizada = ruta.estadoRuta === 'Finalizada'

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleConfirmarCita = (fecha: string, hora: string, obs: string) => {
    if (!agendarTarget) return
    setExamenes((prev) =>
      prev.map((e) =>
        e === agendarTarget
          ? { ...e, estado: 'Programado', fecha, observacion: `Cita programada: ${fecha} ${hora}` }
          : e,
      ),
    )
    setCitasExtra((prev) => [
      ...prev,
      {
        fecha,
        hora,
        tipo: 'Estudio programado',
        servicio: agendarTarget.servicio,
        lugar: 'Por confirmar',
        estado: 'Programada',
        observacion: `${agendarTarget.estudio}${obs ? ' — ' + obs : ''}`,
      },
    ])
    setAgendarTarget(null)
    showToast('Cita agendada correctamente. Se enviará recordatorio a la paciente/cuidadora.')
  }

  const etapaEstado = (nombre: string) =>
    ruta.etapas.find((e) => e.nombre === nombre)?.estado ?? 'Pendiente'

  const etapaFecha = (nombre: string) =>
    ruta.etapas.find((e) => e.nombre === nombre)?.fecha ?? ''

  return (
    <div className="space-y-4">
      {/* ── Tabs ── */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
        <div className="flex items-end gap-1 min-w-max border-b border-black/8 pb-0">
          {TABS.map((tab) => {
            const activo = tabActivo === tab.id
            const completado = etapaEstado(tab.etapaNombre) === 'Completado'

            return (
              <button
                key={tab.id}
                onClick={() => setTabActivo(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-xl transition-colors ${
                  activo
                    ? 'text-marca-700 bg-white border border-b-white border-black/8 -mb-px z-10'
                    : 'text-tinta/45 hover:text-tinta/70 hover:bg-black/[0.03] rounded-t-xl'
                }`}
              >
                {activo && (
                  <span
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #014B8C, #026BB3, #03B1EC)' }}
                  />
                )}
                <Icon
                  name={completado && !activo ? 'check' : tab.icon}
                  size={15}
                  className={completado && !activo ? 'text-exito' : ''}
                />
                {tab.label}
                {completado && !activo && (
                  <span className="w-1.5 h-1.5 rounded-full bg-exito shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Panel de detalle ── */}
      <div className="pt-1 animate-fade-up">
        {tabActivo === 'admision' && (
          <PanelAdmision ruta={ruta} documentosRuta={documentosRuta} onVerDoc={setDocViewer} paciente={paciente} />
        )}
        {tabActivo === 'hc' && (
          <PanelHistoriaClinica
            ruta={ruta}
            documentosRuta={documentosRuta}
            onVerDoc={setDocViewer}
            onVerHistorial={onVerHistorial}
            paciente={paciente}
          />
        )}
        {tabActivo === 'citas' && (
          <PanelCitas ruta={ruta} citasExtra={citasExtra} rutaFinalizada={rutaFinalizada} />
        )}
        {tabActivo === 'examenes' && (
          <PanelExamenes examenes={examenes} onAgendar={setAgendarTarget} onVerDoc={setDocViewer} />
        )}
        {tabActivo === 'informes' && <PanelInformes ruta={ruta} />}
        {tabActivo === 'cita-diag' && (
          <PanelCitaDiagnostica
            ruta={ruta}
            documentosRuta={documentosRuta}
            onVerDoc={setDocViewer}
            onVerHistorial={onVerHistorial}
          />
        )}
      </div>

      {/* Modales */}
      {docViewer && (
        <DocumentoViewerModal doc={docViewer} onCerrar={() => setDocViewer(null)} />
      )}
      {agendarTarget && (
        <AgendarCitaModal
          estudio={agendarTarget}
          onConfirmar={handleConfirmarCita}
          onCancelar={() => setAgendarTarget(null)}
        />
      )}

      {/* Toast de confirmación */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-tinta text-white text-sm px-5 py-3 rounded-2xl shadow-lg animate-fade-up max-w-sm text-center leading-snug">
          {toast}
        </div>
      )}
    </div>
  )
}
