import type { Riesgo } from '../types'
import { RIESGO_META } from '../lib/semaforo'

/** Estado de avance de la ruta diagnóstica. Nunca depende solo del color:
 *  muestra punto + icono + texto. No es una valoración clínica. */
export default function SemaforoRiesgo({
  nivel,
  motivos,
  size = 'md',
}: {
  nivel: Riesgo
  motivos?: string[]
  size?: 'sm' | 'md' | 'lg'
}) {
  const meta = RIESGO_META[nivel]

  if (size === 'sm') {
    return (
      <span className={`chip text-xs ${meta.clase}`}>
        <span className={`w-2 h-2 rounded-full ${meta.punto}`} aria-hidden="true" />
        <span aria-hidden="true">{meta.icono}</span>
        {meta.label}
      </span>
    )
  }

  return (
    <div className="tarjeta ac-surface p-4">
      <div className="flex items-center gap-3">
        {/* Las 3 luces, siempre visibles, la activa resaltada */}
        <div className="flex flex-col gap-1.5 bg-tinta/90 rounded-full p-1.5">
          {(['rojo', 'amarillo', 'verde'] as Riesgo[]).map((n) => (
            <span
              key={n}
              className={`rounded-full ${size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} ${RIESGO_META[n].punto} ${
                n === nivel ? '' : 'opacity-25'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <div>
          <p className="text-xs text-tinta/50 ac-muted font-medium uppercase tracking-wide">
            Estado de avance de la ruta
          </p>
          <p className={`font-display font-bold ${size === 'lg' ? 'text-lg' : ''}`}>
            <span aria-hidden="true">{meta.icono}</span> {meta.label}
          </p>
        </div>
      </div>

      {motivos && motivos.length > 0 && (
        <ul className="mt-3 space-y-1">
          {motivos.map((m, i) => (
            <li key={i} className="text-sm text-tinta/70 ac-muted flex gap-2">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${meta.punto}`} aria-hidden="true" />
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
