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
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-marca-500 text-white shrink-0">
        <svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M20 44 C20 30, 28 24, 32 16 C36 24, 44 30, 44 44" stroke="white" strokeWidth="5" strokeLinecap="round" />
          <circle cx="32" cy="44" r="5" fill="#F76C8C" />
        </svg>
      </span>
      <div className="leading-none">
        <p className="font-display font-extrabold text-tinta ac-ink text-[15px]">OncoRuta</p>
        <p className="text-[11px] text-marca-600 font-semibold -mt-0.5">Mujer IA</p>
      </div>
    </div>
  )
}

const NAV_PACIENTE: { p: Pantalla; icon: IconName; label: string }[] = [
  { p: 'home', icon: 'home', label: 'Inicio' },
  { p: 'ruta', icon: 'ruta', label: 'Mi ruta' },
  { p: 'citas', icon: 'calendar', label: 'Mis citas' },
  { p: 'documentos', icon: 'doc', label: 'Documentos' },
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
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-black/5">
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
                    pantalla === it.p
                      ? 'bg-marca-50 text-marca-700'
                      : 'text-tinta/60 hover:text-tinta hover:bg-black/5'
                  }`}
                >
                  <Icon name={it.icon} size={16} /> {it.label}
                </button>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-xs font-semibold text-tinta ac-ink">{sesion.nombre}</p>
              <p className="text-[11px] text-tinta/50 ac-muted">{rolLabel}</p>
            </div>
            <button
              onClick={cerrarSesion}
              className="grid place-items-center w-9 h-9 rounded-xl bg-black/5 text-tinta/60 hover:bg-black/10"
              aria-label="Salir"
              title={tr('salir', idioma)}
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
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
            className="fixed z-40 right-4 bottom-20 md:bottom-6 grid place-items-center w-14 h-14 rounded-2xl bg-marca-500 text-white shadow-suave hover:bg-marca-600"
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
