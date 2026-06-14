import { useState } from 'react'
import type { Rol } from '../types'
import { useApp } from '../context/AppContext'
import BarraAccesibilidad from '../components/layout/BarraAccesibilidad'
import Icon, { type IconName } from '../components/ui/Icon'
import SedesINEN from './SedesINEN'

// ── Modal: Cosas fundamentales para primera cita ──────────────────
const DOCS_CHECKLIST = [
  { id: 'd1', label: 'Documento Nacional de Identidad (DNI)' },
  { id: 'd2', label: 'Hoja de referencia médica' },
  { id: 'd3', label: 'Resultados de exámenes e informes médicos previos (si los tienes)' },
  { id: 'd5', label: 'Carné de seguro (SIS, EsSalud u otro)' },
]

const ANTES_CHECKLIST = [
  { id: 'a1', label: 'Confirma la fecha y hora de tu cita' },
  { id: 'a2', label: 'Lleva todos tus documentos en una carpeta' },
  { id: 'a3', label: 'Si vienes de provincia, revisa la ubicación del INEN' },
]

const RUTA_PASOS: { label: string; sub?: string; mapa?: true }[] = [
  { label: 'Llega al INEN', sub: 'Av. Angamos Este 2520, Surquillo', mapa: true },
  { label: 'Pide tu ticket de admisión', sub: 'Ventanilla de la Torre de atención ambulatoria' },
  { label: 'Presenta documentos en Admisión', sub: 'DNI, referencia, exámenes, seguro' },
  { label: 'Apertura de historia clínica', sub: 'El personal genera tu HC en el sistema INEN' },
  { label: 'Traslado al módulo de citas', sub: 'Con tu HC lista, te dirigen al módulo de citas' },
  { label: 'Primera cita médica programada', sub: 'Recibirás fecha, hora y consultorio' },
]

const NOTIFICACIONES = [
  'Tengas una nueva cita',
  'Necesites presentar documentos',
  'Tengas exámenes pendientes',
  'Existan cambios en tu atención',
]

function PrimeraCitaModal({ onClose, onVerMapa }: { onClose: () => void; onVerMapa: () => void }) {
  const allIds = [...DOCS_CHECKLIST, ...ANTES_CHECKLIST].map((i) => i.id)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const lista = (items: typeof DOCS_CHECKLIST) =>
    items.map((item) => (
      <button
        key={item.id}
        onClick={() => toggle(item.id)}
        className="flex items-start gap-3 w-full text-left py-2 px-3 rounded-xl hover:bg-black/4 transition"
      >
        <span
          className="mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center border-2 transition"
          style={{
            borderColor: checked.has(item.id) ? '#E91E63' : '#D1D5DB',
            background: checked.has(item.id) ? '#E91E63' : '#fff',
          }}
        >
          {checked.has(item.id) && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className={`text-sm leading-snug ${checked.has(item.id) ? 'line-through text-tinta/40' : 'text-tinta/80'}`}>
          {item.label}
        </span>
      </button>
    ))

  const todo = allIds.every((id) => checked.has(id))

  return (
    <div className="fixed inset-0 z-[3000] bg-black/70 flex items-center justify-center p-3" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="px-5 py-4 bg-marca-500 text-white rounded-t-2xl flex items-start justify-between gap-3">
          <div>
            <p className="font-display font-extrabold text-lg leading-tight">👋 Cosas fundamentales</p>
            <p className="text-white/80 text-sm mt-0.5">para tu primera cita en el INEN</p>
          </div>
          <button onClick={onClose} className="shrink-0 grid place-items-center w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25">
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Documentos */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-marca-600 mb-1">📄 Documentos que debes llevar</p>
            <div className="bg-marca-50 rounded-xl divide-y divide-black/5">
              {lista(DOCS_CHECKLIST)}
            </div>
          </div>

          {/* Antes de venir */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-marca-600 mb-1">✅ Antes de venir</p>
            <div className="bg-green-50 rounded-xl divide-y divide-black/5">
              {lista(ANTES_CHECKLIST)}
            </div>
          </div>

          {/* Banner cuando todo marcado */}
          {todo && (
            <div className="flex items-center gap-3 bg-green-500 text-white rounded-2xl px-4 py-3 animate-fade-up">
              <span className="text-2xl">✅</span>
              <p className="font-bold text-sm leading-snug">¡Estás lista para tu primera atención en el INEN!</p>
            </div>
          )}

        </div>

        {/* Pie */}
        <div className="px-5 py-3 border-t border-black/8 flex items-center justify-between">
          <p className="text-xs text-tinta/45">{checked.size}/{allIds.length} ítems marcados</p>
          <button
            onClick={onClose}
            className="btn-primario px-5 py-2 text-sm"
          >
            Entendido <Icon name="right" size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

const ROLES: { rol: Rol; titulo: string; desc: string; icon: IconName }[] = [
  { rol: 'paciente', titulo: 'Paciente', desc: 'Veo mi ruta, citas y documentos.', icon: 'user' },
  { rol: 'cuidador', titulo: 'Cuidador / familiar', desc: 'Acompaño a una paciente.', icon: 'users' },
  { rol: 'inen', titulo: 'Personal INEN', desc: 'Hago seguimiento de pacientes.', icon: 'heart' },
  { rol: 'admin', titulo: 'Administrador', desc: 'Configuro la plataforma.', icon: 'settings' },
]

export default function Login() {
  const { iniciarSesion, ir } = useApp()
  const [rolSel, setRolSel] = useState<Rol>('paciente')
  const [modalPrimeraCita, setModalPrimeraCita] = useState(false)
  const [mapaAbierto, setMapaAbierto] = useState(false)

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <BarraAccesibilidad />
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Lado de marca */}
        <div className="relative hidden lg:flex flex-col justify-between p-10 bg-marca-500 text-white overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-marca-400/40 blur-2xl" />
          <div className="absolute -left-16 bottom-10 w-72 h-72 rounded-full bg-rosa-500/30 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-white/15">
                <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
                  <path d="M20 44 C20 30, 28 24, 32 16 C36 24, 44 30, 44 44" stroke="white" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="32" cy="44" r="5" fill="#F76C8C" />
                </svg>
              </span>
              <div>
                <p className="font-display text-2xl font-extrabold leading-none">OncoRuta</p>
                <p className="text-white/80 font-semibold">Mujer IA</p>
              </div>
            </div>
          </div>
          <div className="relative max-w-md">
            <h1 className="font-display text-4xl font-extrabold leading-tight">
              Tu camino claro hacia un diagnóstico oportuno.
            </h1>
            <p className="mt-4 text-white/85 text-lg leading-relaxed">
              Te acompañamos paso a paso en tu proceso en el INEN: qué sigue, qué llevar, cuándo es tu
              cita y quién puede ayudarte.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm bg-white/12 rounded-2xl px-4 py-3">
              <Icon name="shield" size={20} />
              No damos diagnósticos. Solo orientamos y acompañamos.
            </div>
          </div>
          <p className="relative text-white/60 text-sm">Transformagob 2026 · Reto INEN · Prototipo</p>
        </div>

        {/* Lado de acceso */}
        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-marca-500 text-white">
                <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
                  <path d="M20 44 C20 30, 28 24, 32 16 C36 24, 44 30, 44 44" stroke="white" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="32" cy="44" r="5" fill="#F76C8C" />
                </svg>
              </span>
              <div>
                <p className="font-display text-xl font-extrabold leading-none ac-ink">OncoRuta Mujer IA</p>
                <p className="text-sm text-marca-600 font-semibold">Tu camino claro</p>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-tinta ac-ink">Ingresar</h2>
            <p className="text-tinta/60 ac-muted mt-1">Elige cómo quieres entrar a la demostración.</p>

            {/* Selector de rol */}
            <div className="grid sm:grid-cols-2 gap-3 mt-5">
              {ROLES.map((r) => (
                <button
                  key={r.rol}
                  onClick={() => setRolSel(r.rol)}
                  className={`text-left rounded-2xl border-2 p-4 transition ${
                    rolSel === r.rol
                      ? 'border-marca-500 bg-marca-50'
                      : 'border-black/8 bg-white hover:border-marca-200'
                  }`}
                >
                  <span
                    className={`grid place-items-center w-9 h-9 rounded-xl mb-2 ${
                      rolSel === r.rol ? 'bg-marca-500 text-white' : 'bg-black/5 text-tinta/50'
                    }`}
                  >
                    <Icon name={r.icon} size={18} />
                  </span>
                  <p className="font-semibold text-tinta ac-ink text-sm">{r.titulo}</p>
                  <p className="text-xs text-tinta/55 ac-muted mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>

            {/* Campos (demo) */}
            <div className="mt-5 space-y-3">
              <div>
                <label className="text-sm font-medium text-tinta/70 ac-muted">DNI o correo</label>
                <input
                  defaultValue={rolSel === 'paciente' ? '****5678' : 'demo@inen.gob.pe'}
                  className="w-full mt-1 bg-white border border-black/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-marca-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-tinta/70 ac-muted">Contraseña o código</label>
                <input
                  type="password"
                  defaultValue="demo1234"
                  className="w-full mt-1 bg-white border border-black/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-marca-200"
                />
              </div>
            </div>

            <button onClick={() => iniciarSesion(rolSel)} className="btn-primario w-full mt-5 py-3.5 text-base">
              Ingresar como {ROLES.find((r) => r.rol === rolSel)?.titulo}
              <Icon name="right" size={18} />
            </button>

            {rolSel === 'paciente' && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setModalPrimeraCita(true)}
                  className="flex flex-col items-start gap-1 rounded-2xl border border-marca-200 bg-marca-50 px-3 py-3 text-left hover:bg-marca-100 transition"
                >
                  <span className="text-xl">📋</span>
                  <p className="text-xs font-semibold text-marca-700 leading-snug">Cosas esenciales para tu primera cita</p>
                </button>
                <button
                  onClick={() => setMapaAbierto(true)}
                  className="flex flex-col items-start gap-1 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-3 text-left hover:bg-blue-100 transition"
                >
                  <span className="text-xl">🗺️</span>
                  <p className="text-xs font-semibold text-blue-700 leading-snug">Consultar mapa del INEN</p>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 text-sm">
              <button onClick={() => ir('registro')} className="text-marca-600 ac-ink font-semibold hover:underline">
                Registrarme
              </button>
              <span className="inline-flex items-center gap-1.5 text-ayuda font-semibold">
                <Icon name="help" size={16} /> Necesito ayuda
              </span>
            </div>

            {modalPrimeraCita && (
              <PrimeraCitaModal
                onClose={() => setModalPrimeraCita(false)}
                onVerMapa={() => setMapaAbierto(true)}
              />
            )}

            {mapaAbierto && (
              <div className="fixed inset-0 z-[3000] bg-gray-50 flex flex-col">
                <button
                  onClick={() => setMapaAbierto(false)}
                  className="absolute top-3 right-3 z-[3100] grid place-items-center w-9 h-9 rounded-xl bg-white shadow-suave text-tinta/60 hover:bg-black/5"
                >
                  <Icon name="close" size={18} />
                </button>
                <div className="flex-1 overflow-y-auto p-4 pt-12">
                  <SedesINEN />
                </div>
              </div>
            )}

            <p className="text-xs text-tinta/45 ac-muted mt-6 text-center">
              Acceso de demostración · No usa datos reales · Cualquier credencial ingresa
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
