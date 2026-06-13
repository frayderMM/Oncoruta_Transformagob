import { useApp } from '../context/AppContext'
import Icon from './ui/Icon'

const CANAL_META = {
  WhatsApp: { icono: 'whatsapp' as const, color: 'bg-[#25D366]', etiqueta: 'WhatsApp' },
  SMS: { icono: 'sms' as const, color: 'bg-ayuda', etiqueta: 'SMS' },
  Interna: { icono: 'bell' as const, color: 'bg-marca-500', etiqueta: 'OncoRuta' },
}

/** Stack flotante de notificaciones simuladas. */
export default function NotificacionDemo() {
  const { notificaciones, descartarNotificacion } = useApp()
  if (notificaciones.length === 0) return null

  return (
    <div className="fixed z-50 bottom-24 md:bottom-6 right-4 left-4 md:left-auto md:w-[360px] space-y-2 pointer-events-none">
      {notificaciones.slice(0, 4).map((n) => {
        const meta = CANAL_META[n.canal]
        return (
          <div
            key={n.id}
            className="pointer-events-auto bg-white rounded-2xl shadow-suave border border-black/5 p-3.5 animate-slide-in flex gap-3"
          >
            <span className={`shrink-0 grid place-items-center w-9 h-9 rounded-xl text-white ${meta.color}`}>
              <Icon name={meta.icono} size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-tinta">{meta.etiqueta}</span>
                <span className="text-[11px] text-tinta/40">{n.hora}</span>
              </div>
              <p className="text-sm font-semibold text-tinta leading-tight mt-0.5">{n.titulo}</p>
              <p className="text-sm text-tinta/70 leading-snug mt-0.5">{n.cuerpo}</p>
            </div>
            <button
              onClick={() => descartarNotificacion(n.id)}
              className="shrink-0 text-tinta/30 hover:text-tinta self-start"
              aria-label="Cerrar notificación"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
