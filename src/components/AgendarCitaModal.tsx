import { useEffect, useState } from 'react'
import type { EstudioRealizado } from '../types'
import Icon from './ui/Icon'

interface Props {
  estudio: EstudioRealizado
  onConfirmar: (fecha: string, hora: string, obs: string) => void
  onCancelar: () => void
}

export default function AgendarCitaModal({ estudio, onConfirmar, onCancelar }: Props) {
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [obs, setObs] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancelar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancelar])

  const handleConfirmar = () => {
    if (!fecha || !hora) { setError('La fecha y la hora son obligatorias.'); return }
    const [y, m, d] = fecha.split('-')
    onConfirmar(`${d}/${m}/${y}`, hora, obs)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancelar() }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-black/8">
          <div>
            <p className="font-display font-bold text-tinta text-base">Agendar cita para examen</p>
            <p className="text-xs text-tinta/50 mt-0.5 leading-snug">
              {estudio.estudio} · {estudio.servicio}
            </p>
          </div>
          <button
            onClick={onCancelar}
            className="shrink-0 grid place-items-center w-9 h-9 rounded-xl bg-black/6 text-tinta/60 hover:bg-black/10 transition"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-tinta/60 mb-1.5 block">Fecha *</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => { setFecha(e.target.value); setError('') }}
                className="w-full rounded-xl border border-black/15 px-3 py-2.5 text-sm focus:outline-none focus:border-marca-400 focus:ring-2 focus:ring-marca-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-tinta/60 mb-1.5 block">Hora *</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => { setHora(e.target.value); setError('') }}
                className="w-full rounded-xl border border-black/15 px-3 py-2.5 text-sm focus:outline-none focus:border-marca-400 focus:ring-2 focus:ring-marca-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-tinta/60 mb-1.5 block">Observación</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={2}
              placeholder="Observación opcional..."
              className="w-full rounded-xl border border-black/15 px-3 py-2.5 text-sm focus:outline-none focus:border-marca-400 focus:ring-2 focus:ring-marca-100 resize-none"
            />
          </div>

          {error && <p className="text-xs text-riesgo font-medium">{error}</p>}

          <div className="rounded-2xl bg-ayuda/8 border border-ayuda/20 px-3 py-2.5 flex items-start gap-2">
            <Icon name="alert" size={14} className="text-ayuda shrink-0 mt-0.5" />
            <p className="text-xs text-ayuda/80 leading-snug">
              Datos simulados · No se envía ninguna cita real al INEN.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/8 flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 px-4 py-2.5 rounded-xl border border-black/15 text-sm font-semibold text-tinta/60 hover:bg-black/4 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            className="flex-1 px-4 py-2.5 rounded-xl bg-marca-500 text-white text-sm font-semibold hover:bg-marca-600 transition"
          >
            <Icon name="check" size={15} className="inline mr-1.5" /> Confirmar cita
          </button>
        </div>
      </div>
    </div>
  )
}
