import { useState } from 'react'
import { useApp } from '../context/AppContext'
import BarraAccesibilidad from '../components/layout/BarraAccesibilidad'
import { AvisoSeguridad } from '../components/ui/Primitivos'
import Icon from '../components/ui/Icon'

export default function Registro() {
  const { iniciarSesion, ir } = useApp()
  const [form, setForm] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    edad: '',
    telefono: '',
    procedencia: '',
    sospecha: 'Mama',
    idioma: 'es',
    tieneCuidador: 'no',
    consentimiento: false,
  })

  const campo = (
    label: string,
    key: keyof typeof form,
    placeholder = '',
    type = 'text',
  ) => (
    <div>
      <label className="text-sm font-medium text-tinta/70 ac-muted">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full mt-1 bg-white border border-black/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-marca-200"
      />
    </div>
  )

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <BarraAccesibilidad />
      <div className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-xl">
          <button onClick={() => ir('login')} className="inline-flex items-center gap-1.5 text-marca-600 ac-ink font-semibold mb-4 hover:underline">
            <Icon name="left" size={18} /> Volver
          </button>

          <div className="tarjeta ac-surface p-6">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="grid place-items-center w-10 h-10 rounded-2xl bg-marca-500 text-white">
                <Icon name="user" size={20} />
              </span>
              <h1 className="font-display text-2xl font-bold text-tinta ac-ink">Registro simple</h1>
            </div>
            <p className="text-tinta/60 ac-muted mb-5">Solo lo necesario para empezar a acompañarte.</p>

            <div className="space-y-3">
              {campo('DNI', 'dni', '########')}
              <div className="grid sm:grid-cols-2 gap-3">
                {campo('Nombres', 'nombres', 'Ej. María')}
                {campo('Apellidos', 'apellidos', 'Ej. Quispe Huamán')}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {campo('Edad', 'edad', 'Ej. 52', 'number')}
                {campo('Teléfono', 'telefono', '9XX XXX XXX')}
              </div>
              {campo('¿De dónde vienes?', 'procedencia', 'Ej. Ayacucho')}

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-tinta/70 ac-muted">Tipo de atención derivada</label>
                  <select
                    value={form.sospecha}
                    onChange={(e) => setForm({ ...form, sospecha: e.target.value })}
                    className="w-full mt-1 bg-white border border-black/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-marca-200"
                  >
                    <option>Mama</option>
                    <option>Cérvix</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-tinta/70 ac-muted">Idioma preferido</label>
                  <select
                    value={form.idioma}
                    onChange={(e) => setForm({ ...form, idioma: e.target.value })}
                    className="w-full mt-1 bg-white border border-black/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-marca-200"
                  >
                    <option value="es">Español</option>
                    <option value="qu">Quechua</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-tinta/70 ac-muted">¿Tienes a alguien que te acompañe?</label>
                <div className="flex gap-2 mt-1">
                  {[
                    { v: 'si', l: 'Sí, tengo cuidador' },
                    { v: 'no', l: 'No por ahora' },
                  ].map((o) => (
                    <button
                      key={o.v}
                      onClick={() => setForm({ ...form, tieneCuidador: o.v })}
                      className={`flex-1 rounded-2xl border-2 px-4 py-2.5 text-sm font-medium transition ${
                        form.tieneCuidador === o.v ? 'border-marca-500 bg-marca-50 text-marca-700' : 'border-black/10 text-tinta/60'
                      }`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-sm text-tinta/70 ac-muted cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={form.consentimiento}
                  onChange={(e) => setForm({ ...form, consentimiento: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-marca-500"
                />
                Acepto que OncoRuta use mis datos solo para acompañar mi proceso administrativo. Entiendo que no es un servicio médico ni de diagnóstico.
              </label>

              <button
                onClick={() => iniciarSesion('paciente')}
                disabled={!form.consentimiento}
                className="btn-primario w-full py-3.5 mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Crear mi cuenta y empezar <Icon name="right" size={18} />
              </button>
              <p className="text-xs text-tinta/45 ac-muted text-center">Registro de demostración · No usa datos reales</p>
            </div>
          </div>

          <div className="mt-4">
            <AvisoSeguridad compacto />
          </div>
        </div>
      </div>
    </div>
  )
}
