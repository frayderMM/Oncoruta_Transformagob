import { useState, useEffect, useRef } from 'react'
import type { Etapa, CampoDetalle, CitaRelacionada, EstudioRealizado, InformeDisponible, RegistroHistoriaClinica } from '../types'
import Icon from './ui/Icon'

interface Props {
  etapa: Etapa
  onCerrar: () => void
  onVerHistorial?: () => void
}

export default function DetalleEtapaModal({ etapa, onCerrar, onVerHistorial }: Props) {
  const d = etapa.detalle!
  const esHistoriaClinica = etapa.nombre === 'Historia clínica'
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({ top: true, bottom: false })

  // Detectar posición de scroll para las sombras indicadoras
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const check = () => {
      setScrollState({
        top: el.scrollTop < 8,
        bottom: el.scrollTop + el.clientHeight >= el.scrollHeight - 8,
      })
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    return () => el.removeEventListener('scroll', check)
  }, [])

  // Metadatos del panel izquierdo según etapa
  const metadatos = esHistoriaClinica
    ? [
        { icon: 'doc' as const, label: 'Código HC', valor: d.codigoHistoriaClinica ?? '—' },
        { icon: 'calendar' as const, label: 'Fecha de registro', valor: d.fechaRegistro ?? '—' },
        { icon: 'calendar' as const, label: 'Última actualización', valor: d.ultimaActualizacion ?? '—' },
        { icon: 'check' as const, label: 'Estado', valor: d.estadoHistoriaClinica ?? '—' },
        { icon: 'users' as const, label: 'Área responsable', valor: d.responsableArea },
        { icon: 'flag' as const, label: 'Ruta asociada', valor: d.registroAsociadoRuta ?? '—' },
      ]
    : [
        { icon: 'calendar' as const, label: 'Fecha de inicio', valor: d.fechaInicio ?? '—' },
        { icon: 'calendar' as const, label: 'Fecha de cierre', valor: d.fechaFin ?? '—' },
        { icon: 'home' as const, label: 'Lugar de atención', valor: d.lugarServicio },
        { icon: 'users' as const, label: 'Área responsable', valor: d.responsableArea },
      ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-sm p-0 lg:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar() }}
    >
      <div className="bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl w-full lg:max-w-5xl h-[93vh] lg:h-auto lg:max-h-[88vh] flex flex-col lg:flex-row overflow-hidden min-h-0">

        {/* ── Panel izquierdo: metadata fija ── */}
        <aside className="lg:w-64 shrink-0 bg-gradient-to-b from-marca-50 to-white border-b lg:border-b-0 lg:border-r border-black/8 flex flex-col">
          {/* Handle de arrastre en móvil */}
          <div className="flex justify-center pt-3 pb-1 lg:hidden">
            <div className="w-10 h-1 rounded-full bg-black/15" />
          </div>

          {/* Título + estado */}
          <div className="px-5 pt-4 pb-3 lg:pt-6">
            <div className="flex items-center gap-2 lg:mb-3">
              <div className="grid place-items-center w-9 h-9 rounded-xl bg-marca-500 text-white shrink-0">
                <Icon name="flag" size={17} />
              </div>
              <div className="min-w-0">
                <h2 className="font-display font-bold text-tinta leading-tight text-base lg:text-lg truncate">
                  {etapa.nombre}
                </h2>
                <span className="chip bg-exito/12 text-exito text-xs mt-0.5 inline-flex items-center gap-1">
                  <Icon name="check" size={11} />Completada
                </span>
              </div>
              {/* Botón cerrar visible en móvil junto al título */}
              <button
                onClick={onCerrar}
                className="lg:hidden ml-auto shrink-0 w-8 h-8 rounded-full bg-black/6 hover:bg-black/12 flex items-center justify-center transition"
                aria-label="Cerrar"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          </div>

          {/* Metadatos — en móvil horizontal scroll, en desktop lista vertical */}
          <div className="px-5 pb-4 lg:pb-6 flex-1">
            {/* Móvil: chips horizontales */}
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden no-scrollbar">
              {metadatos.map((m) => (
                <div key={m.label} className="shrink-0 rounded-xl border border-black/8 bg-white px-3 py-2 text-xs">
                  <p className="text-tinta/45 whitespace-nowrap">{m.label}</p>
                  <p className="font-semibold text-tinta whitespace-nowrap mt-0.5">{m.valor}</p>
                </div>
              ))}
            </div>
            {/* Desktop: lista vertical */}
            <div className="hidden lg:flex flex-col gap-3">
              {metadatos.map((m) => (
                <div key={m.label}>
                  <p className="text-xs text-tinta/45 mb-0.5">{m.label}</p>
                  <p className="text-sm font-semibold text-tinta flex items-center gap-1.5">
                    <Icon name={m.icon} size={13} className="text-marca-400 shrink-0" />
                    {m.valor}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Aviso de seguridad — solo desktop */}
          <div className="hidden lg:block px-5 py-4 border-t border-black/6">
            <p className="text-xs text-tinta/38 leading-relaxed">
              Esta información resume el avance de la ruta. OncoRuta no interpreta resultados médicos.
            </p>
          </div>
        </aside>

        {/* ── Panel derecho: contenido con scroll ── */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Botón cerrar — solo desktop */}
          <div className="hidden lg:flex justify-end px-5 pt-4 shrink-0">
            <button
              onClick={onCerrar}
              className="w-9 h-9 rounded-full bg-black/6 hover:bg-black/12 flex items-center justify-center transition"
              aria-label="Cerrar"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Sombra superior cuando no está al tope */}
          <div
            className={`h-4 shrink-0 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 pointer-events-none ${
              scrollState.top ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Contenido scrollable */}
          <div ref={scrollRef} className="overflow-y-auto flex-1 px-5 lg:px-7 pb-6 space-y-6">

            {/* Resumen operativo */}
            <div className="rounded-2xl bg-marca-50 border border-marca-100 p-4">
              <p className="text-xs font-semibold text-marca-600 uppercase tracking-wide mb-1.5">
                Resumen operativo
              </p>
              <p className="text-sm text-tinta/80 leading-relaxed">{d.resumenPaciente}</p>
            </div>

            {/* ── Admisión ── */}
            {d.datosAdmision && (
              <SeccionTablaKV titulo="Datos de admisión" campos={d.datosAdmision} />
            )}

            {/* ── Historia clínica ── */}
            {esHistoriaClinica && d.datosHistoriaClinica && (
              <div>
                <SeccionTablaKV titulo="Datos registrados" campos={d.datosHistoriaClinica} />
                <p className="text-xs text-tinta/40 mt-2 italic">
                  Resumen de navegación y seguimiento. No incluye historia médica completa.
                </p>
                {onVerHistorial && (
                  <button
                    onClick={() => { onCerrar(); onVerHistorial() }}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-marca-500 hover:bg-marca-600 transition text-white text-sm font-semibold"
                  >
                    <Icon name="doc" size={16} /> Ver historial clínico completo
                  </button>
                )}
              </div>
            )}

            {/* ── Registros asociados (Historia clínica) ── */}
            {d.registrosAsociados && (
              <div>
                <SectionLabel icon="doc" titulo="Registros asociados a esta ruta" />
                <TablaRegistrosHC filas={d.registrosAsociados} />
              </div>
            )}

            {/* ── Primera cita ── */}
            {d.citasRelacionadas && (
              <div>
                <SectionLabel icon="calendar" titulo="Citas y programaciones relacionadas" />
                <p className="text-xs text-tinta/55 mb-3 leading-relaxed">
                  Seguimiento de citas asociadas a esta ruta. La indicación médica corresponde al personal del INEN.
                </p>
                <TablaCitas filas={d.citasRelacionadas} />
              </div>
            )}

            {/* ── Exámenes ── */}
            {d.estudiosRealizados && (
              <div>
                <SectionLabel icon="search" titulo="Estudios realizados" />
                <TablaEstudios filas={d.estudiosRealizados} />
              </div>
            )}

            {/* ── Informe ── */}
            {d.informesDisponibles && (
              <div>
                <SectionLabel icon="doc" titulo="Informes disponibles" />
                <TablaInformes filas={d.informesDisponibles} />
              </div>
            )}

            {/* ── Cita diagnóstica ── */}
            {d.resumenCierreRuta && (
              <div>
                <SeccionTablaKV titulo="Resumen de cierre de ruta" campos={d.resumenCierreRuta} acento />
                <div className="mt-3 rounded-2xl bg-exito/8 border border-exito/20 px-4 py-3">
                  <p className="text-sm text-exito font-medium flex items-center gap-2">
                    <Icon name="check" size={16} />
                    La ruta diagnóstica fue finalizada. El personal médico explicó los siguientes pasos de atención.
                  </p>
                </div>
              </div>
            )}

            {/* Documentos asociados */}
            {d.documentos.length > 0 && (
              <div>
                <SectionLabel icon="doc" titulo="Documentos asociados" />
                <div className="grid sm:grid-cols-2 gap-2">
                  {d.documentos.map((doc) => (
                    <div key={doc} className="flex items-center gap-2.5 rounded-xl border border-black/8 px-3 py-2 text-sm text-tinta/70">
                      <Icon name="check" size={14} className="text-exito shrink-0" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones realizadas */}
            {d.accionesRealizadas.length > 0 && (
              <div>
                <SectionLabel icon="flag" titulo="Acciones realizadas" />
                <ul className="space-y-2">
                  {d.accionesRealizadas.map((accion) => (
                    <li key={accion} className="flex items-center gap-2.5 text-sm text-tinta/70">
                      <span className="w-5 h-5 rounded-full bg-marca-50 flex items-center justify-center shrink-0">
                        <Icon name="check" size={12} className="text-marca-500" />
                      </span>
                      {accion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Próximo paso */}
            {d.proximoPasoDetalle && (
              <div className="rounded-2xl border-2 border-marca-200 bg-marca-50/40 p-4">
                <p className="text-xs font-semibold text-marca-600 uppercase tracking-wide mb-1">
                  Paso siguiente definido
                </p>
                <p className="text-sm text-tinta/80 font-medium">{d.proximoPasoDetalle}</p>
              </div>
            )}

            {/* Aviso de seguridad — móvil */}
            <p className="lg:hidden text-xs text-tinta/38 text-center leading-relaxed border-t border-black/6 pt-4">
              Esta información resume el avance de la ruta. OncoRuta no interpreta resultados médicos.
            </p>
          </div>

          {/* Sombra inferior cuando hay más contenido */}
          <div
            className={`h-5 shrink-0 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 pointer-events-none ${
              scrollState.bottom ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Subcomponentes ────────────────────────────────────────────────────────────

function SectionLabel({ icon, titulo }: { icon: 'calendar' | 'doc' | 'flag' | 'search'; titulo: string }) {
  return (
    <p className="text-sm font-semibold text-tinta/70 mb-2.5 flex items-center gap-1.5">
      <Icon name={icon} size={15} className="text-marca-400" /> {titulo}
    </p>
  )
}

function SeccionTablaKV({ titulo, campos, acento }: { titulo: string; campos: CampoDetalle[]; acento?: boolean }) {
  return (
    <div>
      <p className="text-sm font-semibold text-tinta/70 mb-2.5">{titulo}</p>
      <div className={`rounded-2xl border overflow-hidden ${acento ? 'border-marca-200' : 'border-black/8'}`}>
        {campos.map((c, i) => (
          <div
            key={c.label}
            className={`flex items-start gap-3 px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-black/[0.02]' : 'bg-white'}`}
          >
            <span className="text-tinta/50 shrink-0 w-44 lg:w-52">{c.label}</span>
            <span className="font-medium text-tinta">{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ESTADO_CHIP: Record<string, string> = {
  Realizada: 'bg-exito/12 text-exito',
  Completado: 'bg-exito/12 text-exito',
  Disponible: 'bg-marca-50 text-marca-700',
  Registrado: 'bg-ayuda/10 text-ayuda',
  Pendiente: 'bg-precaucion/15 text-[#9a7400]',
}

function ChipEstado({ estado }: { estado: string }) {
  return <span className={`chip text-xs ${ESTADO_CHIP[estado] ?? 'bg-black/6 text-tinta/60'}`}>{estado}</span>
}

function TablaRegistrosHC({ filas }: { filas: RegistroHistoriaClinica[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/8">
      <table className="w-full text-sm min-w-[540px]">
        <thead>
          <tr className="bg-black/[0.03] border-b border-black/8">
            <Th>Fecha</Th><Th>Tipo de registro</Th><Th>Servicio / Área</Th><Th>Descripción</Th><Th>Estado</Th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className={`border-b border-black/5 last:border-0 ${i % 2 ? 'bg-black/[0.015]' : ''}`}>
              <Td className="whitespace-nowrap">{f.fecha}</Td>
              <Td>{f.tipoRegistro}</Td>
              <Td>{f.servicioArea}</Td>
              <Td className="text-tinta/60">{f.descripcion}</Td>
              <Td><ChipEstado estado={f.estado} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablaCitas({ filas }: { filas: CitaRelacionada[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/8">
      <table className="w-full text-sm min-w-[620px]">
        <thead>
          <tr className="bg-black/[0.03] border-b border-black/8">
            <Th>Fecha</Th><Th>Hora</Th><Th>Tipo</Th><Th>Servicio</Th><Th>Lugar</Th><Th>Estado</Th><Th>Observación</Th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className={`border-b border-black/5 last:border-0 ${i % 2 ? 'bg-black/[0.015]' : ''}`}>
              <Td className="whitespace-nowrap">{f.fecha}</Td>
              <Td>{f.hora}</Td>
              <Td>{f.tipo}</Td>
              <Td>{f.servicio}</Td>
              <Td>{f.lugar}</Td>
              <Td><ChipEstado estado={f.estado} /></Td>
              <Td className="text-tinta/55">{f.observacion}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablaEstudios({ filas }: { filas: EstudioRealizado[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/8">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="bg-black/[0.03] border-b border-black/8">
            <Th>Fecha</Th><Th>Estudio</Th><Th>Servicio</Th><Th>Estado</Th><Th>Documento</Th><Th>Observación</Th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i} className={`border-b border-black/5 last:border-0 ${i % 2 ? 'bg-black/[0.015]' : ''}`}>
              <Td className="whitespace-nowrap">{f.fecha}</Td>
              <Td>{f.estudio}</Td>
              <Td>{f.servicio}</Td>
              <Td><ChipEstado estado={f.estado} /></Td>
              <Td className="text-tinta/55">{f.documentoAsociado}</Td>
              <Td className="text-tinta/55">{f.observacion}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablaInformes({ filas }: { filas: InformeDisponible[] }) {
  const [expandido, setExpandido] = useState<number | null>(null)
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/8">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="bg-black/[0.03] border-b border-black/8">
            <Th>Fecha</Th><Th>Tipo de informe</Th><Th>Servicio</Th><Th>Estado</Th><Th>Acción</Th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <>
              <tr key={i} className={`border-b border-black/5 ${i % 2 ? 'bg-black/[0.015]' : ''}`}>
                <Td className="whitespace-nowrap">{f.fecha}</Td>
                <Td>{f.tipoInforme}</Td>
                <Td>{f.servicio}</Td>
                <Td><ChipEstado estado={f.estado} /></Td>
                <Td>
                  <button
                    onClick={() => setExpandido(expandido === i ? null : i)}
                    className="text-xs text-marca-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Icon name={expandido === i ? 'left' : 'right'} size={12} />
                    {expandido === i ? 'Ocultar' : 'Ver resumen'}
                  </button>
                </Td>
              </tr>
              {expandido === i && (
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
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-2.5 text-xs font-semibold text-tinta/55 uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 text-tinta/80 align-top ${className}`}>{children}</td>
}
