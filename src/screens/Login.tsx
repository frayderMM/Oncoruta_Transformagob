import { useState } from 'react'
import type { Rol } from '../types'
import { useApp } from '../context/AppContext'
import BarraAccesibilidad from '../components/layout/BarraAccesibilidad'
import Icon, { type IconName } from '../components/ui/Icon'

const ROLES: { rol: Rol; titulo: string; desc: string; icon: IconName }[] = [
  { rol: 'paciente', titulo: 'Paciente', desc: 'Veo mi ruta, citas y documentos.', icon: 'user' },
  { rol: 'cuidador', titulo: 'Cuidador / familiar', desc: 'Acompaño a una paciente.', icon: 'users' },
  { rol: 'inen', titulo: 'Personal INEN', desc: 'Hago seguimiento de pacientes.', icon: 'heart' },
  { rol: 'admin', titulo: 'Administrador', desc: 'Configuro la plataforma.', icon: 'settings' },
]

export default function Login() {
  const { iniciarSesion, ir } = useApp()
  const [rolSel, setRolSel] = useState<Rol>('paciente')

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

            <div className="flex items-center justify-between mt-4 text-sm">
              <button onClick={() => ir('registro')} className="text-marca-600 ac-ink font-semibold hover:underline">
                Registrarme
              </button>
              <span className="inline-flex items-center gap-1.5 text-ayuda font-semibold">
                <Icon name="help" size={16} /> Necesito ayuda
              </span>
            </div>

            <p className="text-xs text-tinta/45 ac-muted mt-6 text-center">
              Acceso de demostración · No usa datos reales · Cualquier credencial ingresa
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
