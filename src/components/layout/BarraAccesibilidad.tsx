import { useAccesibilidad } from '../../context/AccesibilidadContext'
import Icon from '../ui/Icon'

/** Barra superior siempre visible con accesos rápidos de accesibilidad. */
export default function BarraAccesibilidad() {
  const {
    fontGrande,
    setFontGrande,
    altoContraste,
    setAltoContraste,
    idioma,
    setIdioma,
    audio,
    setAudio,
  } = useAccesibilidad()

  const Toggle = ({
    activo,
    onClick,
    icon,
    label,
  }: {
    activo: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
  }) => (
    <button
      onClick={onClick}
      aria-pressed={activo}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
        activo ? 'bg-white text-marca-700' : 'bg-white/15 text-white hover:bg-white/25'
      }`}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )

  return (
    <div className="bg-marca-600 text-white">
      <div className="max-w-6xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-white/80 hidden md:flex items-center gap-1.5">
          <Icon name="heart" size={14} /> Accesibilidad
        </span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <Toggle
            activo={fontGrande}
            onClick={() => setFontGrande(!fontGrande)}
            icon={<Icon name="textsize" size={14} />}
            label="Letra grande"
          />
          <Toggle
            activo={altoContraste}
            onClick={() => setAltoContraste(!altoContraste)}
            icon={<Icon name="contrast" size={14} />}
            label="Contraste"
          />
          <Toggle
            activo={audio}
            onClick={() => setAudio(!audio)}
            icon={<Icon name="speaker" size={14} />}
            label="Audio"
          />
          <button
            onClick={() => setIdioma(idioma === 'es' ? 'qu' : 'es')}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold bg-white text-marca-700"
            title="Cambiar idioma"
          >
            <Icon name="globe" size={14} />
            {idioma === 'es' ? 'ES' : 'QU'}
          </button>
        </div>
      </div>
    </div>
  )
}
