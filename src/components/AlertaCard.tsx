import type { Alerta } from '../types'
import { RIESGO_META } from '../lib/semaforo'
import Icon from './ui/Icon'
import { BotonAudio } from './ui/Primitivos'

export default function AlertaCard({
  alerta,
  onEntendido,
  onNotificarCuidador,
  rolINEN = false,
}: {
  alerta: Alerta
  onEntendido?: (id: string) => void
  onNotificarCuidador?: (alerta: Alerta) => void
  rolINEN?: boolean
}) {
  const meta = RIESGO_META[alerta.nivel]
  const borde =
    alerta.nivel === 'rojo'
      ? 'border-riesgo/40'
      : alerta.nivel === 'amarillo'
        ? 'border-precaucion/50'
        : 'border-exito/40'
  const atendida = alerta.estado === 'Atendida' || alerta.estado === 'Entendida'

  return (
    <div className={`tarjeta ac-surface p-4 border-l-4 ${borde}`}>
      <div className="flex items-start gap-3">
        <span className={`chip shrink-0 ${meta.clase}`}>
          <Icon name={alerta.nivel === 'verde' ? 'check' : 'alert'} size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`chip text-xs ${meta.clase}`}>{meta.label}</span>
            <span className="text-xs text-tinta/45 ac-muted">{alerta.fecha}</span>
            {atendida && (
              <span className="chip text-xs bg-exito/12 text-exito">
                <Icon name="check" size={13} /> {alerta.estado}
              </span>
            )}
          </div>
          <p className="font-semibold text-tinta ac-ink mt-1.5 leading-snug">{alerta.mensaje}</p>
          <p className="text-sm text-tinta/65 ac-muted mt-1">
            <span className="font-medium">Qué hacer:</span> {alerta.accionRecomendada}
          </p>

          {!atendida && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {onEntendido && !rolINEN && (
                <button onClick={() => onEntendido(alerta.id)} className="btn-suave text-sm">
                  <Icon name="check" size={16} /> Entendido
                </button>
              )}
              {onNotificarCuidador && !rolINEN && (
                <button
                  onClick={() => onNotificarCuidador(alerta)}
                  className="text-sm font-semibold text-marca-600 ac-ink hover:underline inline-flex items-center gap-1.5"
                >
                  <Icon name="users" size={16} /> Avisar a mi cuidador
                </button>
              )}
              <BotonAudio texto={`${alerta.mensaje}. ${alerta.accionRecomendada}`} label="Escuchar" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
