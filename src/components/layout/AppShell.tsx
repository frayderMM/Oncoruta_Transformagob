import { useState, type ReactNode } from 'react'
import { useApp, type Pantalla } from '../../context/AppContext'
import { useAccesibilidad } from '../../context/AccesibilidadContext'
import { tr } from '../../data/i18n'
import Icon, { type IconName } from '../ui/Icon'
import BarraAccesibilidad from './BarraAccesibilidad'
import BottomNav from './BottomNav'
import NotificacionDemo from '../NotificacionDemo'
import ChatIANoClinico from '../ChatIANoClinico'

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/20 border border-white/25 text-white shrink-0">
        <svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M20 44 C20 30, 28 24, 32 16 C36 24, 44 30, 44 44" stroke="white" strokeWidth="5" strokeLinecap="round" />
          <circle cx="32" cy="44" r="5" fill="#72D0F3" />
        </svg>
      </span>
      <div className="leading-none">
        <p className="font-display font-extrabold text-white text-[15px]">OncoRuta</p>
        <p className="text-[11px] text-white/70 font-semibold -mt-0.5">Mujer IA</p>
      </div>
    </div>
  )
}

const NAV_PACIENTE: { p: Pantalla; icon: IconName; label: string }[] = [
  { p: 'home', icon: 'home', label: 'Inicio' },
  { p: 'ruta', icon: 'ruta', label: 'Mi ruta' },
  { p: 'alertas', icon: 'bell', label: 'Alertas' },
  { p: 'cuidador', icon: 'users', label: 'Cuidador' },
  { p: 'accesibilidad', icon: 'settings', label: 'Accesibilidad' },
]

const NAV_INEN: { p: Pantalla; icon: IconName; label: string }[] = [
  { p: 'panel', icon: 'users', label: 'Panel de pacientes' },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const { sesion, pantalla, ir, cerrarSesion, pacienteActivo } = useApp()
  const { idioma } = useAccesibilidad()
  const [chatAbierto, setChatAbierto] = useState(false)
  if (!sesion) return <>{children}</>

  const esPaciente = sesion.rol === 'paciente'
  const esCuidador = sesion.rol === 'cuidador'
  const esINEN = sesion.rol === 'inen'
  const esAdmin = sesion.rol === 'admin'
  const nav = esPaciente ? NAV_PACIENTE : esINEN ? NAV_INEN : []

  const rolLabel = esPaciente
    ? 'Paciente'
    : esCuidador
      ? 'Cuidador'
      : esINEN
        ? 'Personal INEN'
        : 'Administrador'

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <BarraAccesibilidad />

      {/* Cabecera */}
      <header className="sticky top-0 z-30 bg-inen shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Logo />

          {/* Nav escritorio */}
          {nav.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {nav.map((it) => (
                <button
                  key={it.p}
                  onClick={() => ir(it.p)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    pantalla === it.p || (pantalla === 'historial' && it.p === 'ruta')
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon name={it.icon} size={16} /> {it.label}
                </button>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-xs font-semibold text-white">{sesion.nombre}</p>
              <p className="text-[11px] text-white/60">{rolLabel}</p>
            </div>
            <button
              onClick={cerrarSesion}
              className="grid place-items-center w-9 h-9 rounded-xl bg-white/15 text-white hover:bg-white/25 transition"
              aria-label="Salir"
              title={tr('salir', idioma)}
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>

        {/* Sub-header de página para pantallas de detalle */}
        {pantalla === 'historial' && (
          <div className="border-t border-white/15 bg-white/10 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 h-10 flex items-center gap-3">
              <button
                onClick={() => ir('ruta')}
                className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition font-medium"
              >
                <Icon name="left" size={15} /> Mi Ruta
              </button>
              <Icon name="right" size={13} className="text-white/30" />
              <span className="text-sm font-semibold text-white">
                Historial clínico resumido
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Contenido */}
      <main className={`flex-1 w-full max-w-6xl mx-auto px-4 py-5 ${esPaciente || esCuidador ? 'pb-24 md:pb-8' : 'pb-8'}`}>
        {children}
      </main>

      {/* Navegación inferior móvil (paciente/cuidador) */}
      {(esPaciente || esCuidador) && <BottomNav />}

      {/* Chat IA flotante (paciente/cuidador) */}
      {(esPaciente || esCuidador) && (
        <>
          <button
            onClick={() => setChatAbierto((v) => !v)}
            className="fixed z-40 right-4 bottom-20 md:bottom-6 grid place-items-center w-14 h-14 rounded-2xl bg-inen-btn text-white shadow-suave hover:opacity-90 transition"
            aria-label="Abrir asistente"
          >
            <Icon name={chatAbierto ? 'close' : 'chat'} size={24} />
          </button>
          {chatAbierto && (
            <div className="fixed z-40 right-4 bottom-36 md:bottom-24 w-[calc(100vw-2rem)] sm:w-[380px] tarjeta overflow-hidden shadow-suave">
              <ChatIANoClinico paciente={pacienteActivo()} embebido />
            </div>
          )}
        </>
      )}

      <NotificacionDemo />

      {/* Pie discreto */}
      {(esINEN || esAdmin) && (
        <footer className="border-t border-black/5 py-3 text-center text-xs text-tinta/40">
          OncoRuta Mujer IA · Prototipo MVP · Transformagob 2026 · Datos ficticios
        </footer>
      )}
    </div>
  )
}
