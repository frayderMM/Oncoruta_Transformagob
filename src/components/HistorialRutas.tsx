import { useState } from 'react'
import type { RutaDiagnostica, Paciente } from '../types'
import { evaluarEstadoAvanceRuta, RIESGO_META } from '../lib/semaforo'
import { Card, SectionTitle } from './ui/Primitivos'
import RutaTimeline from './RutaTimeline'
import Icon from './ui/Icon'

const ESTADO_RUTA_CLASE: Record<string, string> = {
  Activa: 'bg-marca-50 text-marca-700',
  Finalizada: 'bg-exito/12 text-exito',
  Pausada: 'bg-precaucion/15 text-[#9a7400]',
  Reabierta: 'bg-ayuda/10 text-ayuda',
}

export default function HistorialRutas({
  paciente,
  onMarcarActiva,
  soloLectura = false,
}: {
  paciente: Paciente
  onMarcarActiva?: (rutaId: string) => void
  soloLectura?: boolean
}) {
  const [rutaExpandida, setRutaExpandida] = useState<string | null>(null)

  const rutasOrdenadas = [...paciente.rutasDiagnosticas].sort((a, b) => {
    // Activa primero, luego por fecha de inicio descendente
    if (a.estadoRuta === 'Activa' && b.estadoRuta !== 'Activa') return -1
    if (a.estadoRuta !== 'Activa' && b.estadoRuta === 'Activa') return 1
    return b.fechaInicio.localeCompare(a.fechaInicio)
  })

  return (
    <div className="space-y-3">
      {rutasOrdenadas.map((ruta) => {
        const ev = evaluarEstadoAvanceRuta(ruta, {
          esProvincia: paciente.esProvincia,
          bajaAlfabetizacion: paciente.bajaAlfabetizacion,
          cuidador: paciente.cuidador,
        })
        const meta = RIESGO_META[ev.nivel]
        const esActiva = ruta.id === paciente.rutaActivaId
        const expandida = rutaExpandida === ruta.id

        return (
          <div
            key={ruta.id}
            className={`tarjeta ac-surface overflow-hidden transition ${esActiva ? 'ring-2 ring-marca-300' : ''}`}
          >
            {/* Cabecera de la ruta */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-tinta ac-ink">{ruta.codigo}</span>
                    {esActiva && (
                      <span className="chip text-xs bg-marca-500 text-white">Activa</span>
                    )}
                    <span className={`chip text-xs ${ESTADO_RUTA_CLASE[ruta.estadoRuta] ?? 'bg-black/5 text-tinta/60'}`}>
                      {ruta.estadoRuta}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap text-sm text-tinta/60 ac-muted">
                    <span>{ruta.tipoIngreso}</span>
                    <span>·</span>
                    <span>{ruta.tipoSospecha}</span>
                    <span>·</span>
                    <span>{ruta.etapaActual}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`chip text-xs ${meta.clase}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.punto}`} aria-hidden="true" />
                      {meta.label}
                    </span>
                    <span className="text-xs text-tinta/50 ac-muted">
                      Inicio: {ruta.fechaInicio}
                      {ruta.fechaCierre ? ` · Cierre: ${ruta.fechaCierre}` : ''}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0">
                  {!soloLectura && onMarcarActiva && !esActiva && ruta.estadoRuta !== 'Finalizada' && (
                    <button
                      onClick={() => onMarcarActiva(ruta.id)}
                      className="btn-secundario text-xs py-1.5 px-3"
                    >
                      <Icon name="check" size={13} /> Marcar activa
                    </button>
                  )}
                  <button
                    onClick={() => setRutaExpandida(expandida ? null : ruta.id)}
                    className="chip text-xs bg-black/5 text-tinta/60 hover:bg-black/10 transition"
                  >
                    <Icon name={expandida ? 'left' : 'right'} size={13} />
                    {expandida ? 'Ocultar' : 'Ver ruta'}
                  </button>
                </div>
              </div>

              {/* Resumen motivo */}
              {!expandida && (
                <p className="text-xs text-tinta/50 ac-muted mt-2 italic">{ruta.motivoIngreso}</p>
              )}
            </div>

            {/* Detalle expandido */}
            {expandida && (
              <div className="border-t border-black/5 p-4 space-y-4 animate-fade-up">
                <div>
                  <p className="text-xs font-semibold text-tinta/50 uppercase tracking-wide mb-1">Motivo de ingreso</p>
                  <p className="text-sm text-tinta/75 ac-muted">{ruta.motivoIngreso}</p>
                </div>
                <div>
                  <SectionTitle>Etapas de la ruta</SectionTitle>
                  <RutaTimeline ruta={ruta.etapas} etapaActual={ruta.etapaActual} compacto />
                </div>
                {ruta.acciones.length > 0 && (
                  <div>
                    <SectionTitle>Gestiones registradas</SectionTitle>
                    <ol className="relative border-l-2 border-marca-100 ml-1 space-y-3">
                      {ruta.acciones.map((a) => (
                        <li key={a.id} className="ml-4 relative">
                          <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-marca-400 ring-4 ring-white" />
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="chip text-xs bg-marca-50 text-marca-700">{a.tipo}</span>
                            <span className="text-xs text-tinta/45 ac-muted">{a.fecha} · {a.autor}</span>
                          </div>
                          <p className="text-sm text-tinta/75 ac-muted mt-1">{a.detalle}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {paciente.rutasDiagnosticas.length === 0 && (
        <Card>
          <p className="text-sm text-tinta/55 ac-muted">Sin rutas registradas.</p>
        </Card>
      )}
    </div>
  )
}
