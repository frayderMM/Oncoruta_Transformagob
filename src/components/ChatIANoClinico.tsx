import { useState, useRef, useEffect } from 'react'
import type { Paciente } from '../types'
import { responderIA, SUGERENCIAS_IA, MENSAJE_SEGURIDAD } from '../lib/asistenteIA'
import Icon from './ui/Icon'

interface Msg {
  de: 'ia' | 'yo'
  texto: string
  rechazo?: boolean
}

export default function ChatIANoClinico({
  paciente,
  embebido = false,
}: {
  paciente?: Paciente
  embebido?: boolean
}) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      de: 'ia',
      texto:
        '¡Hola! Soy tu asistente de orientación de OncoRuta. Te ayudo con tu proceso: documentos, citas, etapas y cuidador. No doy diagnósticos ni tratamientos.',
    },
  ])
  const [input, setInput] = useState('')
  const finRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const enviar = (texto: string) => {
    const limpio = texto.trim()
    if (!limpio) return
    const r = responderIA(limpio, paciente)
    setMsgs((prev) => [
      ...prev,
      { de: 'yo', texto: limpio },
      { de: 'ia', texto: r.texto, rechazo: r.esRechazo },
    ])
    setInput('')
  }

  return (
    <div className={`flex flex-col ${embebido ? 'h-[460px]' : 'h-full'}`}>
      {/* Encabezado de seguridad */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-marca-50 border-b border-marca-100 rounded-t-xl2">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-marca-500 text-white">
          <Icon name="spark" size={18} />
        </span>
        <div>
          <p className="font-display font-bold text-tinta text-sm leading-tight">Asistente OncoRuta</p>
          <p className="text-[11px] text-marca-700 leading-tight">Orientación, no diagnóstico</p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-crema/40">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.de === 'yo' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug whitespace-pre-line ${
                m.de === 'yo'
                  ? 'bg-marca-500 text-white rounded-br-md'
                  : m.rechazo
                    ? 'bg-ayuda/10 text-ayuda border border-ayuda/30 rounded-bl-md'
                    : 'bg-white text-tinta border border-black/5 rounded-bl-md'
              }`}
            >
              {m.rechazo && (
                <span className="flex items-center gap-1.5 font-semibold mb-1">
                  <Icon name="shield" size={15} /> Solo orientación
                </span>
              )}
              {m.texto}
            </div>
          </div>
        ))}
        <div ref={finRef} />
      </div>

      {/* Sugerencias */}
      <div className="flex gap-2 px-3 py-2 overflow-x-auto border-t border-black/5 bg-white">
        {SUGERENCIAS_IA.map((s) => (
          <button
            key={s}
            onClick={() => enviar(s)}
            className="shrink-0 text-xs font-medium text-marca-700 bg-marca-50 hover:bg-marca-100 rounded-full px-3 py-1.5"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Entrada */}
      <div className="flex items-center gap-2 p-3 border-t border-black/5 bg-white rounded-b-xl2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar(input)}
          placeholder="Escribe tu pregunta…"
          className="flex-1 bg-crema rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-marca-200"
          aria-label="Escribe tu pregunta al asistente"
        />
        <button
          onClick={() => enviar(input)}
          className="grid place-items-center w-11 h-11 rounded-2xl bg-marca-500 text-white hover:bg-marca-600 shrink-0"
          aria-label="Enviar"
        >
          <Icon name="send" size={18} />
        </button>
      </div>
      <p className="text-[11px] text-tinta/40 text-center px-4 py-1.5 bg-white">
        {MENSAJE_SEGURIDAD}
      </p>
    </div>
  )
}
