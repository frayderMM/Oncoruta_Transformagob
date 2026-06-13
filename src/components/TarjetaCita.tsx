import type { Cita } from '../types'
import { CITA_META } from '../lib/semaforo'
import Icon from './ui/Icon'

export default function TarjetaCita({
  cita,
  onConfirmar,
  onRecordatorio,
}: {
  cita: Cita
  onConfirmar?: (id: string) => void
  onRecordatorio?: (cita: Cita) => void
}) {
  const meta = CITA_META[cita.estado]
  const sinFecha = cita.fecha === 'Por programar'
  const puedeConfirmar = onConfirmar && cita.estado === 'Programada'

  return (
    <div className="tarjeta ac-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs text-marca-600 ac-ink font-semibold uppercase tracking-wide">
            {cita.tipo}
          </span>
          <h3 className="font-display font-bold text-lg text-tinta ac-ink">{cita.servicio}</h3>
        </div>
        <span className={`chip text-xs ${meta.clase}`}>{cita.estado}</span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-3 mt-3 text-sm">
        <span className="flex items-center gap-2 text-tinta/75 ac-muted">
          <Icon name="calendar" size={16} className="text-marca-500" />
          {sinFecha ? 'Por programar' : cita.fecha}
        </span>
        <span className="flex items-center gap-2 text-tinta/75 ac-muted">
          <Icon name="clock" size={16} className="text-marca-500" />
          {cita.hora}
        </span>
        <span className="flex items-center gap-2 text-tinta/75 ac-muted col-span-2">
          <Icon name="pin" size={16} className="text-marca-500" />
          {cita.lugar}
        </span>
      </div>

      {cita.documentos.length > 0 && (
        <p className="text-sm text-tinta/70 ac-muted mt-3">
          <span className="font-semibold">Lleva:</span> {cita.documentos.join(', ')}
        </p>
      )}
      <p className="text-sm text-tinta/60 ac-muted mt-1 leading-snug">{cita.indicaciones}</p>

      {(puedeConfirmar || onRecordatorio) && !sinFecha && (
        <div className="flex flex-wrap gap-2 mt-4">
          {puedeConfirmar && (
            <button onClick={() => onConfirmar?.(cita.id)} className="btn-primario text-sm py-2.5">
              <Icon name="check" size={16} /> Confirmar que asistiré
            </button>
          )}
          {cita.estado === 'Confirmada' && (
            <span className="chip bg-exito/12 text-exito text-sm">
              <Icon name="check" size={16} /> Asistencia confirmada
            </span>
          )}
          {onRecordatorio && (
            <button onClick={() => onRecordatorio(cita)} className="btn-secundario text-sm py-2.5">
              <Icon name="bell" size={16} /> Recordarme
            </button>
          )}
        </div>
      )}
    </div>
  )
}
