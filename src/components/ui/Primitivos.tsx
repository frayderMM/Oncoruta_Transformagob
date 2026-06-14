import type { ReactNode } from 'react'
import Icon from './Icon'
import { useAccesibilidad } from '../../context/AccesibilidadContext'

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      className={`tarjeta ac-surface p-5 ${onClick ? 'cursor-pointer hover:shadow-suave transition' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  children,
  sub,
}: {
  children: ReactNode
  sub?: string
}) {
  return (
    <div className="mb-3">
      <h2 className="font-display text-xl font-bold text-tinta ac-ink">{children}</h2>
      <div className="mt-1 h-0.5 w-12 rounded-full bg-inen-btn" />
      {sub && <p className="text-sm text-tinta/60 ac-muted mt-2">{sub}</p>}
    </div>
  )
}

export function Chip({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <span className={`chip ${className}`}>{children}</span>
}

/** Botón "Escuchar": usa Web Speech API si el audio está activo. */
export function BotonAudio({ texto, label = 'Escuchar' }: { texto: string; label?: string }) {
  const { hablar, audio } = useAccesibilidad()
  return (
    <button
      onClick={() => hablar(texto)}
      className="inline-flex items-center gap-1.5 text-marca-600 ac-ink text-sm font-semibold hover:underline"
      title={audio ? 'Reproducir en voz alta' : 'Activa el audio en Accesibilidad'}
    >
      <Icon name="speaker" size={18} />
      {label}
      {!audio && <span className="text-tinta/40 ac-muted font-normal">(activar audio)</span>}
    </button>
  )
}

/** Aviso de seguridad: recuerda que la plataforma NO diagnostica. */
export function AvisoSeguridad({ compacto = false }: { compacto?: boolean }) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-2xl bg-ayuda/8 border border-ayuda/20 text-ayuda ${
        compacto ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
      }`}
      role="note"
    >
      <Icon name="shield" size={compacto ? 16 : 20} className="shrink-0 mt-0.5" />
      <p className="leading-snug">
        OncoRuta <strong>no da diagnósticos ni tratamientos</strong>. Te ayuda a saber qué hacer y
        cuándo. Las decisiones médicas siempre las toma el personal del INEN.
      </p>
    </div>
  )
}
