import type { Etapa, NombreEtapa } from '../types'
import { ETAPA_META } from '../lib/semaforo'
import Icon, { type IconName } from './ui/Icon'
import { BotonAudio } from './ui/Primitivos'

const ICONO_ETAPA: Record<NombreEtapa, IconName> = {
  Admisión: 'doc',
  'Historia clínica': 'note',
  'Primera cita': 'calendar',
  Exámenes: 'search',
  Informe: 'flag',
  'Cita diagnóstica': 'heart',
}

export default function RutaTimeline({
  ruta,
  etapaActual,
  compacto = false,
}: {
  ruta: Etapa[]
  etapaActual: NombreEtapa
  compacto?: boolean
}) {
  return (
    <ol className="relative">
      {ruta.map((etapa, i) => {
        const meta = ETAPA_META[etapa.estado]
        const esActual = etapa.nombre === etapaActual
        const completado = etapa.estado === 'Completado'
        const ultimo = i === ruta.length - 1

        return (
          <li key={etapa.nombre} className="relative pl-14 pb-6 last:pb-0 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            {/* Línea del camino */}
            {!ultimo && (
              <span
                className={`absolute left-[21px] top-11 bottom-0 w-[3px] rounded-full ${
                  completado ? 'bg-marca-300' : 'bg-black/10'
                }`}
                aria-hidden="true"
              />
            )}

            {/* Nodo */}
            <span
              className={`absolute left-0 top-0 grid place-items-center w-11 h-11 rounded-2xl border-2 ${
                esActual
                  ? 'bg-marca-500 border-marca-500 text-white shadow-suave'
                  : completado
                    ? 'bg-marca-50 border-marca-200 text-marca-600'
                    : 'bg-white border-black/10 text-tinta/40'
              }`}
            >
              {esActual ? (
                <span className="absolute inset-0 rounded-2xl bg-marca-500 animate-pulso -z-10" />
              ) : null}
              <Icon name={ICONO_ETAPA[etapa.nombre]} size={20} />
            </span>

            {/* Contenido */}
            <div
              className={`tarjeta ac-surface px-4 py-3 ${
                esActual ? 'ring-2 ring-marca-200' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-tinta ac-ink">{etapa.nombre}</h3>
                  {esActual && (
                    <span className="chip bg-marca-500 text-white text-xs">Estás aquí</span>
                  )}
                </div>
                <span className={`chip text-xs border ${meta.clase}`}>
                  <span aria-hidden="true">{meta.icono}</span> {etapa.estado}
                </span>
              </div>

              {!compacto && (
                <p className="text-sm text-tinta/70 ac-muted mt-1.5 leading-snug">
                  {etapa.descripcionSimple}
                </p>
              )}

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-tinta/50 ac-muted">
                  {etapa.fecha ? `📅 ${etapa.fecha}` : 'Sin fecha aún'}
                </span>
                {esActual && !compacto && (
                  <BotonAudio texto={`${etapa.nombre}. ${etapa.descripcionSimple}`} label="Escuchar" />
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
