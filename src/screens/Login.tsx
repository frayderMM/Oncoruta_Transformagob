import { useState } from 'react'
import type { Rol } from '../types'
import { useApp } from '../context/AppContext'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import BarraAccesibilidad from '../components/layout/BarraAccesibilidad'
import Icon, { type IconName } from '../components/ui/Icon'
import { tr } from '../data/i18n'
import SedesINEN from './SedesINEN'

// ── Checklist primera cita ────────────────────────────────────────
const DOCS = [
  { id: 'd1', es: 'Documento Nacional de Identidad (DNI)',              qu: 'DNI (Identidad qillqa)' },
  { id: 'd2', es: 'Hoja de referencia médica',                          qu: 'Hampiq qillqa (referencia)' },
  { id: 'd3', es: 'Resultados de exámenes e informes médicos previos',  qu: 'Ñawpaq taripay qillqakuna' },
  { id: 'd4', es: 'Carné de seguro (SIS, EsSalud u otro)',              qu: 'Seguro qillqa (SIS, EsSalud)' },
]

const ANTES = [
  { id: 'a1', es: 'Confirma la fecha y hora de tu cita',                qu: 'Tupanaykipa p\'unchaw, horap\'ita sut\'inchaspa' },
  { id: 'a2', es: 'Lleva todos tus documentos en una carpeta',          qu: 'Qillqakunata huk carpetapi apay' },
  { id: 'a3', es: 'Si vienes de provincia, revisa la ubicación del INEN', qu: 'Llaqtamanta hamunkichu, INEN-pa kikillanpi qhaway' },
]

type Idioma = 'es' | 'qu'

function PrimeraCitaModal({ onClose, idioma }: { onClose: () => void; idioma: Idioma }) {
  const allIds = [...DOCS, ...ANTES].map((i) => i.id)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const toggle = (id: string) => setChecked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const todo = allIds.every((id) => checked.has(id))
  const pct = Math.round((checked.size / allIds.length) * 100)
  const lbl = (item: { es: string; qu: string }) => idioma === 'qu' ? item.qu : item.es

  const Item = ({ item, color }: { item: typeof DOCS[number]; color: string }) => {
    const done = checked.has(item.id)
    return (
      <button
        onClick={() => toggle(item.id)}
        className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border transition-all ${
          done ? 'bg-opacity-10 border-opacity-30' : 'bg-white border-black/8 hover:border-black/15'
        }`}
        style={done ? { background: color + '12', borderColor: color + '50' } : {}}
      >
        <span
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all"
          style={{ background: done ? color : '#F3F4F6', border: done ? 'none' : '2px solid #D1D5DB' }}
        >
          {done && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className={`text-sm leading-snug font-medium transition-all ${done ? 'line-through opacity-45' : 'text-tinta/80'}`}>
          {lbl(item)}
        </span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[3000] bg-black/60 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[88vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Cabecera con progreso */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-bold text-[17px] text-tinta ac-ink leading-tight">
                {idioma === 'qu' ? 'Tupanaypaq lista' : 'Lista para tu primera cita'}
              </p>
              <p className="text-xs text-tinta/45 mt-0.5 ac-muted">
                {checked.size} {idioma === 'qu' ? 'sut\'ichaskam' : 'de'} {allIds.length} {idioma === 'qu' ? '' : 'completados'}
              </p>
            </div>
            <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-xl bg-black/5 hover:bg-black/10 shrink-0">
              <Icon name="close" size={15} />
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: todo ? '#22c55e' : '#E91E63' }}
            />
          </div>
          {todo && (
            <p className="text-xs font-semibold text-green-600 mt-1.5 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#22c55e"/><path d="M3 6l2.5 2.5L9 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {idioma === 'qu' ? '¡Tupanaypaq lista kanki!' : '¡Estás lista para tu primera atención!'}
            </p>
          )}
        </div>

        {/* Listas */}
        <div className="overflow-y-auto flex-1 px-5 pb-4 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">📄</span>
              <p className="text-xs font-bold uppercase tracking-wider text-tinta/50">
                {idioma === 'qu' ? 'Qillqakuna' : 'Documentos'}
              </p>
            </div>
            <div className="space-y-2">
              {DOCS.map((d) => <Item key={d.id} item={d} color="#E91E63" />)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">✅</span>
              <p className="text-xs font-bold uppercase tracking-wider text-tinta/50">
                {idioma === 'qu' ? 'Hamuq ñawpaq' : 'Antes de venir'}
              </p>
            </div>
            <div className="space-y-2">
              {ANTES.map((a) => <Item key={a.id} item={a} color="#7C3AED" />)}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-black/6">
          <button onClick={onClose} className="btn-primario w-full py-3 text-sm">
            {idioma === 'qu' ? 'Allinmi' : 'Listo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────
const ROLES: { rol: Rol; key: 'paciente_lbl' | 'cuidador_lbl' | 'personal_inen' | 'administrador'; icon: IconName }[] = [
  { rol: 'paciente', key: 'paciente_lbl', icon: 'user' },
  { rol: 'cuidador', key: 'cuidador_lbl', icon: 'users' },
  { rol: 'inen',     key: 'personal_inen', icon: 'heart' },
  { rol: 'admin',    key: 'administrador', icon: 'settings' },
]

export default function Login() {
  const { iniciarSesion, ir } = useApp()
  const { idioma } = useAccesibilidad()
  const [rolSel, setRolSel] = useState<Rol>('paciente')
  const [modalChecklist, setModalChecklist] = useState(false)
  const [mapaAbierto, setMapaAbierto] = useState(false)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Barra de accesibilidad */}
      <BarraAccesibilidad />

      <div className="flex-1 grid lg:grid-cols-[1fr_1fr]">

        {/* Panel izquierdo — marca (solo escritorio) */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-marca-500 text-white overflow-hidden">
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -left-12 bottom-0 w-72 h-72 rounded-full bg-black/10" />

          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-white/20">
              <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
                <path d="M20 44 C20 30, 28 24, 32 16 C36 24, 44 30, 44 44" stroke="white" strokeWidth="5" strokeLinecap="round" />
                <circle cx="32" cy="44" r="5" fill="#F76C8C" />
              </svg>
            </span>
            <div className="leading-none">
              <p className="font-display text-xl font-extrabold">OncoRuta</p>
              <p className="text-white/65 text-sm font-medium">Mujer IA</p>
            </div>
          </div>

          {/* Tagline + bullets */}
          <div className="relative space-y-7">
            <h1 className="font-display text-[2.6rem] font-extrabold leading-tight tracking-tight">
              {tr('tagline', idioma)}
            </h1>
            <div className="space-y-3">
              {([
                { icon: 'calendar', es: 'Citas y seguimiento en tiempo real',   qu: 'Tupanakuna qatiypim' },
                { icon: 'doc',      es: 'Documentos y alertas personalizadas',   qu: 'Qillqakuna willakuyninkuna' },
                { icon: 'map',      es: 'Orientación dentro del campus INEN',    qu: 'INEN ukupi yanapakuy' },
              ] as const).map((item) => (
                <div key={item.icon} className="flex items-center gap-3 text-[0.92rem] text-white/80">
                  <span className="grid place-items-center w-8 h-8 rounded-xl bg-white/15 shrink-0">
                    <Icon name={item.icon} size={15} />
                  </span>
                  {idioma === 'qu' ? item.qu : item.es}
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-white/35 text-xs">Transformagob 2026 · INEN · Prototipo</p>
        </div>

        {/* Panel derecho — formulario */}
        <div className="flex items-center justify-center p-6 bg-white">
          <div className="w-full max-w-sm">

            {/* Logo — solo móvil */}
            <div className="lg:hidden flex items-center gap-2.5 mb-7">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-marca-500 text-white shrink-0">
                <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
                  <path d="M20 44 C20 30, 28 24, 32 16 C36 24, 44 30, 44 44" stroke="white" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="32" cy="44" r="5" fill="#F76C8C" />
                </svg>
              </span>
              <div className="leading-none">
                <p className="font-display font-extrabold text-lg ac-ink">OncoRuta Mujer IA</p>
                <p className="text-xs text-marca-600 font-semibold mt-0.5 ac-muted">INEN · Transformagob 2026</p>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-tinta ac-ink">{tr('acceder', idioma)}</h2>
            <p className="text-sm text-tinta/50 mt-1 ac-muted">{tr('selecciona_perfil', idioma)}</p>

            {/* Roles */}
            <div className="grid grid-cols-2 gap-2 mt-5">
              {ROLES.map((r) => (
                <button
                  key={r.rol}
                  onClick={() => setRolSel(r.rol)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    rolSel === r.rol
                      ? 'border-marca-400 bg-marca-50 text-marca-700'
                      : 'border-black/8 bg-white text-tinta/60 hover:border-marca-200 hover:text-tinta'
                  }`}
                >
                  <Icon name={r.icon} size={16} />
                  {tr(r.key, idioma)}
                </button>
              ))}
            </div>

            {/* Campos */}
            <div className="mt-5 space-y-2.5">
              <input
                placeholder={tr('dni_correo', idioma)}
                defaultValue={rolSel === 'paciente' ? '****5678' : 'demo@inen.gob.pe'}
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-marca-200 placeholder:text-tinta/35 ac-surface"
              />
              <input
                type="password"
                placeholder={tr('contrasena', idioma)}
                defaultValue="demo1234"
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-marca-200 placeholder:text-tinta/35 ac-surface"
              />
            </div>

            <button onClick={() => iniciarSesion(rolSel)} className="btn-primario w-full mt-4 py-3 text-sm">
              {tr('ingresar', idioma)} <Icon name="right" size={16} />
            </button>

            {/* Accesos rápidos — solo paciente */}
            {rolSel === 'paciente' && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => setModalChecklist(true)}
                  className="flex items-center gap-2 rounded-xl border border-marca-200 bg-marca-50 px-3 py-2.5 text-xs font-semibold text-marca-700 hover:bg-marca-100 transition"
                >
                  <Icon name="doc" size={14} /> {tr('antes_cita_btn', idioma)}
                </button>
                <button
                  onClick={() => setMapaAbierto(true)}
                  className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition"
                >
                  <Icon name="map" size={14} /> {tr('ver_mapa_btn', idioma)}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-5 text-sm">
              <button onClick={() => ir('registro')} className="text-marca-600 font-semibold hover:underline ac-ink">
                {tr('crear_cuenta', idioma)}
              </button>
              <span className="inline-flex items-center gap-1.5 text-tinta/40 text-xs ac-muted">
                <Icon name="shield" size={13} /> {tr('solo_orientamos', idioma)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {modalChecklist && <PrimeraCitaModal onClose={() => setModalChecklist(false)} idioma={idioma} />}

      {mapaAbierto && (
        <div className="fixed inset-0 z-[3000] bg-gray-50 flex flex-col">
          <BarraAccesibilidad />
          <div className="bg-white border-b border-black/6 px-4 h-13 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-8 h-8 rounded-xl bg-marca-500 text-white shrink-0">
                <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
                  <path d="M20 44 C20 30, 28 24, 32 16 C36 24, 44 30, 44 44" stroke="white" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="32" cy="44" r="5" fill="#F76C8C" />
                </svg>
              </span>
              <div className="leading-none">
                <p className="font-display font-bold text-sm text-tinta ac-ink">OncoRuta Mujer IA</p>
                <p className="text-[11px] text-tinta/45 ac-muted">Sedes INEN</p>
              </div>
            </div>
            <button
              onClick={() => setMapaAbierto(false)}
              className="grid place-items-center w-9 h-9 rounded-xl bg-black/5 text-tinta/60 hover:bg-black/10"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <SedesINEN hideTitle />
          </div>
        </div>
      )}
    </div>
  )
}
