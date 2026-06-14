import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type {
  CitaRelacionada,
  EstudioRealizado,
  InformeDisponible,
  RegistroSeguimiento,
  DocumentoRuta,
  Etapa,
} from '../types'
import { Card, AvisoSeguridad } from '../components/ui/Primitivos'
import DetalleEtapaModal from '../components/DetalleEtapaModal'
import DocumentoViewerModal from '../components/DocumentoViewerModal'
import Icon from '../components/ui/Icon'

// ─── Tipos de tab ─────────────────────────────────────────────────────────────
type Tab =
  | 'resumen'
  | 'hc'
  | 'ruta'
  | 'citas'
  | 'estudios'
  | 'informes'
  | 'documentos'
  | 'seguimiento'

const TABS: { id: Tab; label: string }[] = [
  { id: 'resumen', label: 'Resumen general' },
  { id: 'hc', label: 'Historia clínica' },
  { id: 'ruta', label: 'Ruta diagnóstica' },
  { id: 'citas', label: 'Citas' },
  { id: 'estudios', label: 'Estudios' },
  { id: 'informes', label: 'Informes' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'seguimiento', label: 'Seguimiento' },
]

// ─── Chips de estado ──────────────────────────────────────────────────────────
const CHIP_ESTADO: Record<string, string> = {
  Realizada: 'bg-exito/12 text-exito',
  Completado: 'bg-exito/12 text-exito',
  Disponible: 'bg-marca-50 text-marca-700',
  Validado: 'bg-exito/12 text-exito',
  Registrado: 'bg-ayuda/10 text-ayuda',
  Enviado: 'bg-marca-50 text-marca-700',
  Finalizada: 'bg-exito/12 text-exito',
  Pendiente: 'bg-precaucion/15 text-[#9a7400]',
}

function Chip({ estado }: { estado: string }) {
  return (
    <span className={`chip text-xs ${CHIP_ESTADO[estado] ?? 'bg-black/6 text-tinta/60'}`}>
      {estado}
    </span>
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

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function HistorialClinico() {
  const { ir, pacienteActivo } = useApp()
  const [tab, setTab] = useState<Tab>('resumen')
  const [etapaDetalle, setEtapaDetalle] = useState<Etapa | null>(null)
  const [informeExpandido, setInformeExpandido] = useState<number | null>(null)
  const [docViewer, setDocViewer] = useState<DocumentoRuta | null>(null)

  const p = pacienteActivo()
  if (!p) return null

  const ruta = p.rutasDiagnosticas.find((r) => r.id === p.rutaActivaId)
  if (!ruta) return null

  // Agregar datos de etapas
  const etapaHC = ruta.etapas.find((e) => e.nombre === 'Historia clínica')
  const etapaPrimeraCita = ruta.etapas.find((e) => e.nombre === 'Primera cita')
  const etapaExamenes = ruta.etapas.find((e) => e.nombre === 'Exámenes')
  const etapaInforme = ruta.etapas.find((e) => e.nombre === 'Informe')

  const citasRelacionadas: CitaRelacionada[] =
    etapaPrimeraCita?.detalle?.citasRelacionadas ?? []
  const estudiosRealizados: EstudioRealizado[] =
    etapaExamenes?.detalle?.estudiosRealizados ?? []
  const informesDisponibles: InformeDisponible[] =
    etapaInforme?.detalle?.informesDisponibles ?? []
  const bitacora: RegistroSeguimiento[] = ruta.bitacoraSeguimiento ?? []
  const documentosRuta: DocumentoRuta[] = ruta.documentosRuta ?? []

  const completadas = ruta.etapas.filter((e) => e.estado === 'Completado').length

  // KPIs
  const kpis = [
    { icon: 'check' as const, label: 'Etapas completadas', valor: `${completadas}/${ruta.etapas.length}`, tono: 'bg-exito/10 text-exito' },
    { icon: 'calendar' as const, label: 'Citas registradas', valor: String(citasRelacionadas.length || ruta.citas.length), tono: 'bg-marca-50 text-marca-700' },
    { icon: 'search' as const, label: 'Estudios realizados', valor: String(estudiosRealizados.length), tono: 'bg-marca-50 text-marca-700' },
    { icon: 'doc' as const, label: 'Informes disponibles', valor: String(informesDisponibles.length), tono: 'bg-ayuda/10 text-ayuda' },
    { icon: 'doc' as const, label: 'Documentos asociados', valor: String(documentosRuta.length || ruta.documentos.length), tono: 'bg-black/5 text-tinta/60' },
    { icon: 'alert' as const, label: 'Alertas pendientes', valor: String(ruta.alertas.filter((a) => a.estado === 'Nueva' || a.estado === 'Vista').length), tono: 'bg-riesgo/10 text-riesgo' },
  ]

  return (
    <div className="animate-fade-up">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Aviso de seguridad */}
        <div className="rounded-2xl bg-ayuda/8 border border-ayuda/20 px-4 py-3 flex items-start gap-2.5">
          <Icon name="shield" size={16} className="text-ayuda shrink-0 mt-0.5" />
          <p className="text-xs text-tinta/65 leading-relaxed">
            OncoRuta muestra información de seguimiento y documentos asociados. La interpretación
            médica corresponde al personal del INEN.
          </p>
        </div>

        {/* ── Card de paciente ── */}
        <div className="rounded-3xl bg-gradient-to-br from-marca-500 to-rosa-500 text-white p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="grid place-items-center w-14 h-14 rounded-2xl bg-white/20 shrink-0">
              <Icon name="user" size={28} />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-extrabold">
                {p.nombres} {p.apellidos}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 mt-3 text-sm text-white/85">
                <span><span className="text-white/55 text-xs">Edad</span><br />{p.edad} años</span>
                <span><span className="text-white/55 text-xs">DNI</span><br />00000000</span>
                <span><span className="text-white/55 text-xs">Procedencia</span><br />{p.procedencia}</span>
                <span><span className="text-white/55 text-xs">Idioma</span><br />Español / Quechua</span>
                <span><span className="text-white/55 text-xs">Cuidadora</span><br />{p.cuidador?.nombre ?? '—'}</span>
                <span><span className="text-white/55 text-xs">Tipo</span><br />{ruta.tipoIngreso}</span>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-white/60 uppercase tracking-wide">Ruta</p>
              <p className="font-bold">{ruta.codigo}</p>
              <p className="text-sm text-white/80">{ruta.tipoSospecha}</p>
              <span className="chip bg-white/20 text-white text-xs mt-1 inline-block">
                {ruta.estadoRuta}
              </span>
              <p className="text-xs text-white/60 mt-1">
                {ruta.fechaInicio} → {ruta.fechaCierre ?? '—'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
          <div className="flex gap-1 min-w-max border-b border-black/8 pb-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-xl transition-all ${
                  tab === t.id
                    ? 'bg-white border border-black/8 border-b-white text-marca-700 -mb-px'
                    : 'text-tinta/55 hover:text-tinta hover:bg-black/4'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Contenido de tabs ── */}
        <div className="animate-fade-up">
          {/* ── 1. Resumen general ── */}
          {tab === 'resumen' && (
            <div className="space-y-5">
              <Card>
                <p className="text-sm text-tinta/70 leading-relaxed">
                  Esta ruta diagnóstica fue completada. La paciente pasó por admisión, verificación
                  de historia clínica, primera cita, exámenes, informe y cita diagnóstica. Todas
                  las etapas fueron registradas y la ruta fue cerrada el {ruta.fechaCierre}.
                </p>
              </Card>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {kpis.map((k) => (
                  <Card key={k.label}>
                    <span className={`grid place-items-center w-9 h-9 rounded-xl ${k.tono}`}>
                      <Icon name={k.icon} size={18} />
                    </span>
                    <p className="font-display text-2xl font-extrabold text-tinta mt-2">{k.valor}</p>
                    <p className="text-xs text-tinta/55 mt-0.5">{k.label}</p>
                  </Card>
                ))}
              </div>
              <Card>
                <p className="text-xs font-semibold text-tinta/50 uppercase tracking-wide mb-3">
                  Progreso de la ruta
                </p>
                {ruta.etapas.map((e) => (
                  <div key={e.nombre} className="flex items-center gap-3 py-1.5">
                    <Icon name="check" size={14} className={e.estado === 'Completado' ? 'text-exito' : 'text-black/20'} />
                    <span className="text-sm text-tinta/80 flex-1">{e.nombre}</span>
                    {e.fecha && <span className="text-xs text-tinta/45">{e.fecha}</span>}
                    <Chip estado={e.estado} />
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* ── 2. Datos de historia clínica ── */}
          {tab === 'hc' && (
            <div className="space-y-5">
              <Card>
                <p className="text-sm font-semibold text-tinta/70 mb-3">Datos administrativos</p>
                <FilaKV label="Código de historia clínica" valor={etapaHC?.detalle?.codigoHistoriaClinica ?? 'HC-2026-001'} />
                <FilaKV label="Fecha de registro" valor={etapaHC?.detalle?.fechaRegistro ?? '05/06/2026'} />
                <FilaKV label="Última actualización" valor={etapaHC?.detalle?.ultimaActualizacion ?? '18/06/2026'} />
                <FilaKV label="Estado" valor={etapaHC?.detalle?.estadoHistoriaClinica ?? 'Verificada'} chip />
                <FilaKV label="Área responsable" valor={etapaHC?.detalle?.responsableArea ?? 'Gestión de historia clínica'} />
                <FilaKV label="Ruta asociada" valor={etapaHC?.detalle?.registroAsociadoRuta ?? `${ruta.codigo} · ${ruta.tipoIngreso} · ${ruta.tipoSospecha}`} />
                <FilaKV label="Registro asociado" valor="Proceso diagnóstico finalizado" chip />
              </Card>
              <Card>
                <p className="text-sm font-semibold text-tinta/70 mb-3">Datos de contacto actualizados</p>
                <FilaKV label="Teléfono actualizado" valor="Sí" />
                <FilaKV label="Canal preferido" valor="WhatsApp y llamada" />
                <FilaKV label="Idioma preferido" valor="Español / Quechua" />
                <FilaKV label="Necesidad de apoyo" valor="Orientación en lenguaje simple" />
                <FilaKV label="Cuidador / familiar" valor={p.cuidador?.nombre ?? '—'} />
              </Card>
              <p className="text-xs text-tinta/40 italic px-1">
                Esta sección muestra el resumen administrativo de la historia clínica, no sus datos
                clínicos ni diagnósticos. La historia clínica completa está resguardada por el INEN.
              </p>
            </div>
          )}

          {/* ── 3. Ruta diagnóstica ── */}
          {tab === 'ruta' && (
            <div className="space-y-3">
              <Card>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-black/8 mb-4">
                  <InfoMini label="Código" valor={ruta.codigo} />
                  <InfoMini label="Tipo" valor={ruta.tipoIngreso} />
                  <InfoMini label="Sospecha" valor={ruta.tipoSospecha} />
                  <InfoMini label="Estado" valor={ruta.estadoRuta} />
                  <InfoMini label="Inicio" valor={ruta.fechaInicio} />
                  <InfoMini label="Cierre" valor={ruta.fechaCierre ?? '—'} />
                </div>
                <ol className="space-y-3">
                  {ruta.etapas.map((etapa) => (
                    <li
                      key={etapa.nombre}
                      role={etapa.detalle ? 'button' : undefined}
                      onClick={() => etapa.detalle && setEtapaDetalle(etapa)}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                        etapa.detalle
                          ? 'border-marca-100 hover:border-marca-300 cursor-pointer hover:bg-marca-50/40 transition'
                          : 'border-black/8'
                      }`}
                    >
                      <span className="grid place-items-center w-8 h-8 rounded-xl bg-exito/10 text-exito shrink-0">
                        <Icon name="check" size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-tinta truncate">{etapa.nombre}</p>
                        {etapa.fecha && (
                          <p className="text-xs text-tinta/45">{etapa.fecha}</p>
                        )}
                      </div>
                      <Chip estado={etapa.estado} />
                      {etapa.detalle && (
                        <span className="text-xs text-marca-600 font-medium flex items-center gap-0.5 shrink-0">
                          <Icon name="right" size={12} /> Ver detalle
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          )}

          {/* ── 4. Citas ── */}
          {tab === 'citas' && (
            <Card>
              <p className="text-sm font-semibold text-tinta/70 mb-3">
                Citas y programaciones registradas
              </p>
              <div className="overflow-x-auto rounded-2xl border border-black/8">
                <table className="w-full text-sm min-w-[620px]">
                  <thead>
                    <tr className="border-b border-black/8">
                      <Th>Fecha</Th><Th>Hora</Th><Th>Tipo</Th>
                      <Th>Servicio</Th><Th>Lugar</Th><Th>Estado</Th><Th>Observación</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {(citasRelacionadas.length > 0 ? citasRelacionadas : ruta.citas.map((c) => ({
                      fecha: c.fecha, hora: c.hora, tipo: c.tipo, servicio: c.servicio,
                      lugar: c.lugar, estado: c.estado, observacion: c.indicaciones,
                    }))).map((f, i) => (
                      <tr key={i} className={`border-b border-black/5 last:border-0 ${i % 2 ? 'bg-black/[0.015]' : ''}`}>
                        <Td className="whitespace-nowrap">{f.fecha}</Td>
                        <Td>{f.hora}</Td>
                        <Td>{f.tipo}</Td>
                        <Td>{f.servicio}</Td>
                        <Td>{f.lugar}</Td>
                        <Td><Chip estado={f.estado} /></Td>
                        <Td className="text-tinta/55">{f.observacion}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── 5. Estudios ── */}
          {tab === 'estudios' && (
            <Card>
              <p className="text-sm font-semibold text-tinta/70 mb-3">Estudios realizados</p>
              <div className="overflow-x-auto rounded-2xl border border-black/8">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-black/8">
                      <Th>Fecha</Th><Th>Estudio</Th><Th>Servicio</Th>
                      <Th>Estado</Th><Th>Documento</Th><Th>Observación</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiosRealizados.map((f, i) => (
                      <tr key={i} className={`border-b border-black/5 last:border-0 ${i % 2 ? 'bg-black/[0.015]' : ''}`}>
                        <Td className="whitespace-nowrap">{f.fecha}</Td>
                        <Td>{f.estudio}</Td>
                        <Td>{f.servicio}</Td>
                        <Td><Chip estado={f.estado} /></Td>
                        <Td className="text-tinta/55">{f.documentoAsociado}</Td>
                        <Td className="text-tinta/55">{f.observacion}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-tinta/40 mt-3 italic">
                Los estudios fueron realizados según indicación médica. OncoRuta registra el
                seguimiento; no interpreta resultados.
              </p>
            </Card>
          )}

          {/* ── 6. Informes ── */}
          {tab === 'informes' && (
            <Card>
              <p className="text-sm font-semibold text-tinta/70 mb-3">Informes disponibles</p>
              <div className="overflow-x-auto rounded-2xl border border-black/8">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="border-b border-black/8">
                      <Th>Fecha</Th><Th>Tipo de informe</Th><Th>Servicio</Th>
                      <Th>Estado</Th><Th>Acción</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {informesDisponibles.map((f, i) => (
                      <>
                        <tr key={i} className={`border-b border-black/5 ${i % 2 ? 'bg-black/[0.015]' : ''}`}>
                          <Td className="whitespace-nowrap">{f.fecha}</Td>
                          <Td>{f.tipoInforme}</Td>
                          <Td>{f.servicio}</Td>
                          <Td><Chip estado={f.estado} /></Td>
                          <Td>
                            <button
                              onClick={() => setInformeExpandido(informeExpandido === i ? null : i)}
                              className="text-xs text-marca-600 font-semibold hover:underline flex items-center gap-1"
                            >
                              <Icon name={informeExpandido === i ? 'left' : 'right'} size={12} />
                              {informeExpandido === i ? 'Ocultar' : 'Ver resumen'}
                            </button>
                          </Td>
                        </tr>
                        {informeExpandido === i && (
                          <tr key={`${i}-exp`}>
                            <td colSpan={5} className="px-4 py-3 text-xs text-tinta/60 italic bg-marca-50/40 border-b border-black/5">
                              {f.resumenSeguro}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── 7. Documentos ── */}
          {tab === 'documentos' && (
            <Card>
              <p className="text-sm font-semibold text-tinta/70 mb-3">
                Documentos asociados a la ruta
              </p>
              <div className="overflow-x-auto rounded-2xl border border-black/8">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-black/8">
                      <Th>Documento</Th><Th>Etapa asociada</Th>
                      <Th>Fecha</Th><Th>Estado</Th><Th>Acción</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentosRuta.map((f, i) => (
                      <tr key={i} className={`border-b border-black/5 last:border-0 ${i % 2 ? 'bg-black/[0.015]' : ''}`}>
                        <Td className="font-medium">{f.nombre}</Td>
                        <Td>{f.etapa}</Td>
                        <Td className="whitespace-nowrap">{f.fecha}</Td>
                        <Td><Chip estado={f.estado} /></Td>
                        <Td>
                          {f.imagenUrl && (
                            <button
                              onClick={() => setDocViewer(f)}
                              className="inline-flex items-center gap-1 text-xs text-marca-600 font-semibold hover:underline"
                            >
                              <Icon name="doc" size={13} /> Ver
                            </button>
                          )}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── 8. Seguimiento ── */}
          {tab === 'seguimiento' && (
            <div className="space-y-5">
              <Card>
                <p className="text-sm font-semibold text-tinta/70 mb-3">
                  Bitácora de seguimiento
                </p>
                <div className="overflow-x-auto rounded-2xl border border-black/8">
                  <table className="w-full text-sm min-w-[520px]">
                    <thead>
                      <tr className="border-b border-black/8">
                        <Th>Fecha</Th><Th>Acción</Th><Th>Responsable</Th>
                        <Th>Canal</Th><Th>Resultado</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {bitacora.map((f, i) => (
                        <tr key={i} className={`border-b border-black/5 last:border-0 ${i % 2 ? 'bg-black/[0.015]' : ''}`}>
                          <Td className="whitespace-nowrap">{f.fecha}</Td>
                          <Td>{f.accion}</Td>
                          <Td>{f.responsable}</Td>
                          <Td>{f.canal}</Td>
                          <Td><Chip estado={f.resultado} /></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Acciones del personal */}
              {ruta.acciones.length > 0 && (
                <Card>
                  <p className="text-sm font-semibold text-tinta/70 mb-3">
                    Acciones registradas por el equipo
                  </p>
                  <ul className="space-y-3">
                    {ruta.acciones.map((ac) => (
                      <li key={ac.id} className="flex gap-3 text-sm">
                        <span className="text-tinta/40 whitespace-nowrap w-24 shrink-0">{ac.fecha}</span>
                        <div>
                          <span className="chip text-xs bg-black/5 text-tinta/60 mr-2">{ac.tipo}</span>
                          <span className="text-tinta/70">{ac.detalle}</span>
                          <p className="text-xs text-tinta/40 mt-0.5">{ac.autor}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* ── Card de cierre ── */}
        <div className="rounded-3xl bg-gradient-to-br from-exito/90 to-marca-500 text-white p-5">
          <div className="flex items-start gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/20 shrink-0">
              <Icon name="check" size={20} />
            </span>
            <div className="flex-1">
              <p className="font-display font-bold text-lg">Resumen de cierre de ruta</p>
              <p className="text-white/90 text-sm mt-1 leading-relaxed">
                La ruta diagnóstica fue finalizada el {ruta.fechaCierre}. El personal médico revisó
                los documentos disponibles y explicó los siguientes pasos de atención. OncoRuta
                conserva el historial de esta ruta para que puedas revisar qué se hizo y cuándo.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => ir('ruta')}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition text-sm font-semibold"
                >
                  ← Volver a Mi Ruta
                </button>
                <button
                  onClick={() => {
                    alert(
                      'Descarga simulada: en una versión con backend, aquí se generaría un PDF con el resumen de tu ruta diagnóstica.',
                    )
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-marca-700 hover:bg-white/90 transition text-sm font-semibold"
                >
                  Descargar resumen simulado
                </button>
              </div>
            </div>
          </div>
        </div>

        <AvisoSeguridad />
      </div>

      {/* Modal de detalle de etapa */}
      {etapaDetalle?.detalle && (
        <DetalleEtapaModal etapa={etapaDetalle} onCerrar={() => setEtapaDetalle(null)} />
      )}

      {/* Visor de documento */}
      {docViewer && (
        <DocumentoViewerModal doc={docViewer} onCerrar={() => setDocViewer(null)} />
      )}
    </div>
  )
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function FilaKV({ label, valor, chip }: { label: string; valor: string; chip?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-black/5 last:border-0 text-sm">
      <span className="text-tinta/45 shrink-0 w-48">{label}</span>
      {chip ? (
        <Chip estado={valor} />
      ) : (
        <span className="font-medium text-tinta">{valor}</span>
      )}
    </div>
  )
}

function InfoMini({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-tinta/45 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-tinta">{valor}</p>
    </div>
  )
}
