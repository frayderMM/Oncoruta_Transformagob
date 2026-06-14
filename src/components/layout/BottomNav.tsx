import { useApp, type Pantalla } from '../../context/AppContext'
import { useAccesibilidad } from '../../context/AccesibilidadContext'
import { tr } from '../../data/i18n'
import Icon, { type IconName } from '../ui/Icon'

const ITEMS: { p: Pantalla; icon: IconName; key: 'sedes_inen' | 'inicio' | 'mi_ruta' | 'alertas' }[] = [
  { p: 'sedes', icon: 'map', key: 'sedes_inen' },
  { p: 'home', icon: 'home', key: 'inicio' },
  { p: 'ruta', icon: 'ruta', key: 'mi_ruta' },
  { p: 'alertas', icon: 'bell', key: 'alertas' },
]

export default function BottomNav() {
  const { pantalla, ir, pacienteActivo } = useApp()
  const { idioma } = useAccesibilidad()
  const p = pacienteActivo()
  const alertasNuevas = p?.alertas.filter((a) => a.estado === 'Nueva').length ?? 0

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-black/5 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
        {ITEMS.map((it) => {
          const activo = pantalla === it.p
          return (
            <button
              key={it.p}
              onClick={() => ir(it.p)}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 ${
                activo ? 'text-marca-600' : 'text-tinta/45'
              }`}
            >
              <Icon name={it.icon} size={22} />
              {it.key === 'alertas' && alertasNuevas > 0 && (
                <span className="absolute top-1.5 right-1/2 translate-x-3.5 bg-riesgo text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 grid place-items-center px-1">
                  {alertasNuevas}
                </span>
              )}
              <span className="text-[10px] font-medium leading-none">{tr(it.key, idioma)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
