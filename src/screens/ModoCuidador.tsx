import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'
import { Card, SectionTitle, AvisoSeguridad } from '../components/ui/Primitivos'
import Icon from '../components/ui/Icon'

export default function ModoCuidador() {
  const { pacienteActivo, registrarCuidador, enviarNotificacion } = useApp()
  const { idioma } = useAccesibilidad()
  const p = pacienteActivo()
  const [form, setForm] = useState({ nombre: '', parentesco: 'Hija', telefono: '' })
  if (!p) return null

  const cuidador = p.cuidador

  const onRegistrar = () => {
    if (!form.nombre.trim() || !form.telefono.trim()) return
    registrarCuidador(p.id, form)
    enviarNotificacion({
      canal: 'WhatsApp',
      titulo: 'Cuidador agregado',
      cuerpo: `Invitamos a ${form.nombre} (${form.parentesco}) a acompañarte. Recibirá tus avisos importantes.`,
    })
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <SectionTitle sub="Una persona de confianza puede acompañarte y recibir tus avisos importantes.">
        Modo {tr('cuidador', idioma)}
      </SectionTitle>

      {cuidador && cuidador.estado === 'activo' ? (
        <>
          <Card className="border-2 border-exito/30 bg-exito/5">
            <div className="flex items-start gap-3">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-exito/15 text-exito shrink-0">
                <Icon name="users" size={24} />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display text-lg font-bold text-tinta ac-ink">{cuidador.nombre}</p>
                  <span className="chip text-xs bg-exito/12 text-exito">Activo</span>
                </div>
                <p className="text-sm text-tinta/65 ac-muted">{cuidador.parentesco} · {cuidador.telefono}</p>
                <p className="text-sm text-tinta/70 ac-muted mt-2 inline-flex items-center gap-1.5">
                  <Icon name="bell" size={15} className="text-marca-500" />
                  {cuidador.recibeAlertas ? 'Recibe tus alertas y recordatorios.' : 'No recibe alertas.'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle sub="Esto es lo que tu cuidador puede ver y hacer.">¿Qué puede hacer?</SectionTitle>
            <ul className="space-y-2.5 text-sm text-tinta/75 ac-muted">
              {[
                'Ver tu ruta y tu próximo paso, de forma resumida.',
                'Recibir tus citas y recordatorios para acompañarte.',
                'Recibir tus alertas importantes para ayudarte a tiempo.',
              ].map((txt) => (
                <li key={txt} className="flex items-start gap-2">
                  <Icon name="check" size={16} className="text-exito mt-0.5 shrink-0" /> {txt}
                </li>
              ))}
              <li className="flex items-start gap-2 text-tinta/55">
                <Icon name="shield" size={16} className="text-ayuda mt-0.5 shrink-0" />
                No puede ver información médica sensible ni tomar decisiones por ti.
              </li>
            </ul>
          </Card>
        </>
      ) : (
        <Card>
          <SectionTitle sub="Agrega a un familiar o persona de confianza para que te acompañe.">
            Agregar cuidador
          </SectionTitle>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-tinta/70 ac-muted">Nombre completo</label>
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Ana Quispe"
                className="w-full mt-1 bg-white border border-black/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-marca-200"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-tinta/70 ac-muted">Parentesco</label>
                <select
                  value={form.parentesco}
                  onChange={(e) => setForm({ ...form, parentesco: e.target.value })}
                  className="w-full mt-1 bg-white border border-black/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-marca-200"
                >
                  {['Hija', 'Hijo', 'Esposo', 'Hermana', 'Hermano', 'Sobrina', 'Vecina', 'Otro'].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-tinta/70 ac-muted">Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="9XX XXX XXX"
                  className="w-full mt-1 bg-white border border-black/10 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-marca-200"
                />
              </div>
            </div>
            <button onClick={onRegistrar} className="btn-primario w-full py-3">
              <Icon name="plus" size={18} /> Invitar a acompañarme
            </button>
          </div>
        </Card>
      )}

      <AvisoSeguridad />
    </div>
  )
}
