import type { Documento } from '../types'
import { DOC_META } from '../lib/semaforo'
import Icon from './ui/Icon'

export default function ChecklistDocumentos({
  documentos,
  onMarcar,
}: {
  documentos: Documento[]
  onMarcar?: (docId: string) => void
}) {
  return (
    <ul className="space-y-2.5">
      {documentos.map((d) => {
        const meta = DOC_META[d.estado]
        const accionable = onMarcar && (d.estado === 'Pendiente' || d.estado === 'Observado')
        return (
          <li key={d.id} className="tarjeta ac-surface p-4 flex items-start gap-3">
            <span className={`chip shrink-0 ${meta.clase}`} aria-hidden="true">
              {meta.icono}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-tinta ac-ink">{d.nombre}</span>
                {d.obligatorio && (
                  <span className="text-[11px] text-rosa-600 font-medium">Obligatorio</span>
                )}
                <span className={`chip text-xs ${meta.clase}`}>{d.estado}</span>
              </div>
              <p className="text-sm text-tinta/65 ac-muted mt-0.5">{d.observacion}</p>
            </div>
            {accionable && (
              <button
                onClick={() => onMarcar?.(d.id)}
                className="btn-suave text-sm shrink-0"
                aria-label={`Marcar ${d.nombre} como listo`}
              >
                <Icon name="check" size={16} /> Listo
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
