import { useState } from 'react'
import type { TipoIngreso, Sospecha } from '../types'
import type { CrearRutaParams } from '../context/AppContext'
import Icon from './ui/Icon'

export default function FormNuevaRuta({
  onCrear,
  onCancelar,
}: {
  onCrear: (params: CrearRutaParams) => void
  onCancelar: () => void
}) {
  const hoy = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const [tipoIngreso, setTipoIngreso] = useState<TipoIngreso>('Reingreso')
  const [tipoSospecha, setTipoSospecha] = useState<Sospecha>('Mama')
  const [motivoIngreso, setMotivoIngreso] = useState('')
  const [fechaInicio, setFechaInicio] = useState(hoy)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!motivoIngreso.trim()) return
    onCrear({ tipoIngreso, tipoSospecha, motivoIngreso: motivoIngreso.trim(), fechaInicio })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-up">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-marca-500 to-marca-600 text-white p-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Nueva ruta diagnóstica</h2>
            <p className="text-white/80 text-sm mt-0.5">
              Se generarán etapas según el tipo de ingreso
            </p>
          </div>
          <button onClick={onCancelar} className="p-1.5 rounded-xl hover:bg-white/20 transition">
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {/* Tipo de ingreso */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-tinta/70 ac-muted">Tipo de ingreso</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Primera vez', 'Reingreso', 'Nueva sospecha', 'Control'] as TipoIngreso[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipoIngreso(t)}
                    className={`rounded-2xl border-2 py-2.5 px-3 text-sm font-medium text-left transition ${
                      tipoIngreso === t
                        ? 'border-marca-400 bg-marca-50 text-marca-700'
                        : 'border-black/10 text-tinta/60 hover:border-marca-200'
                    }`}
                  >
                    {t}
                  </button>
                ),
              )}
            </div>
            <p className="text-xs text-tinta/45 ac-muted">
              {tipoIngreso === 'Primera vez' || tipoIngreso === 'Nueva sospecha'
                ? 'Ruta de 6 etapas: Admisión → Cita diagnóstica'
                : 'Ruta de 7 etapas: Reingreso → Cita diagnóstica / indicación médica'}
            </p>
          </div>

          {/* Sospecha */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-tinta/70 ac-muted">Tipo de sospecha</label>
            <div className="flex gap-3">
              {(['Mama', 'Cérvix'] as Sospecha[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTipoSospecha(s)}
                  className={`flex-1 rounded-2xl border-2 py-2.5 text-sm font-medium transition ${
                    tipoSospecha === s
                      ? 'border-marca-400 bg-marca-50 text-marca-700'
                      : 'border-black/10 text-tinta/60 hover:border-marca-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-tinta/70 ac-muted">Motivo de ingreso</label>
            <textarea
              value={motivoIngreso}
              onChange={(e) => setMotivoIngreso(e.target.value)}
              placeholder="Describe brevemente el motivo de esta nueva ruta…"
              rows={3}
              required
              className="w-full bg-white border border-black/10 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-marca-200 text-sm resize-none"
            />
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-tinta/70 ac-muted">Fecha de inicio</label>
            <input
              type="text"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              placeholder="dd/mm/aaaa"
              className="w-full bg-white border border-black/10 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-marca-200 text-sm"
            />
          </div>

          {/* Aviso */}
          <div className="rounded-2xl bg-ayuda/10 text-ayuda px-4 py-3 text-xs leading-relaxed flex gap-2">
            <Icon name="shield" size={14} className="shrink-0 mt-0.5" />
            Esta herramienta acompaña el proceso administrativo. No realiza diagnósticos médicos.
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancelar} className="btn-secundario flex-1 text-sm">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!motivoIngreso.trim()}
              className="btn-primario flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="plus" size={16} /> Crear ruta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
