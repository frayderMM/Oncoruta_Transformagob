import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'
import { Card, SectionTitle, BotonAudio, AvisoSeguridad } from '../components/ui/Primitivos'
import Icon, { type IconName } from '../components/ui/Icon'

function Toggle({
  icon,
  titulo,
  desc,
  valor,
  onChange,
}: {
  icon: IconName
  titulo: string
  desc: string
  valor: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="tarjeta ac-surface p-4 flex items-center gap-3">
      <span className={`grid place-items-center w-11 h-11 rounded-2xl shrink-0 ${valor ? 'bg-marca-500 text-white' : 'bg-black/5 text-tinta/50'}`}>
        <Icon name={icon} size={22} />
      </span>
      <div className="flex-1">
        <p className="font-semibold text-tinta ac-ink">{titulo}</p>
        <p className="text-sm text-tinta/60 ac-muted">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={valor}
        aria-label={titulo}
        onClick={() => onChange(!valor)}
        className={`relative w-14 h-8 rounded-full transition shrink-0 ${valor ? 'bg-marca-500' : 'bg-black/15'}`}
      >
        <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${valor ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  )
}

export default function Accesibilidad() {
  const a = useAccesibilidad()

  const textoPreview =
    a.idioma === 'qu'
      ? tr('avance_normal', 'qu')
      : 'Tu próxima cita es el 18 de junio. Recuerda llevar tu DNI y tu hoja de referencia.'

  return (
    <div className="space-y-5 animate-fade-up">
      <SectionTitle sub="Ajusta la aplicación para que te sea más fácil de usar.">
        {tr('accesibilidad', a.idioma)}
      </SectionTitle>

      <div className="space-y-3">
        <Toggle icon="textsize" titulo="Letras grandes" desc="Aumenta el tamaño del texto en toda la app." valor={a.fontGrande} onChange={a.setFontGrande} />
        <Toggle icon="contrast" titulo="Alto contraste" desc="Colores más fuertes para ver mejor." valor={a.altoContraste} onChange={a.setAltoContraste} />
        <Toggle icon="chat" titulo="Lenguaje simple" desc="Explicaciones cortas y fáciles de entender." valor={a.lenguajeSimple} onChange={a.setLenguajeSimple} />
        <Toggle icon="speaker" titulo="Leer en voz alta" desc="Activa el botón Escuchar en cada pantalla." valor={a.audio} onChange={a.setAudio} />
      </div>

      {/* Idioma */}
      <Card>
        <SectionTitle sub="Demo de interfaz bilingüe. Traducciones en quechua por validar con hablantes nativos.">
          Idioma
        </SectionTitle>
        <div className="flex gap-2">
          {([
            { v: 'es', l: 'Español', sub: 'Castellano' },
            { v: 'qu', l: 'Quechua', sub: 'Runa simi (demo)' },
          ] as const).map((o) => (
            <button
              key={o.v}
              onClick={() => a.setIdioma(o.v)}
              className={`flex-1 rounded-2xl border-2 p-4 text-left transition ${
                a.idioma === o.v ? 'border-marca-500 bg-marca-50' : 'border-black/10'
              }`}
            >
              <span className="inline-flex items-center gap-2 font-semibold text-tinta ac-ink">
                <Icon name="globe" size={18} className="text-marca-500" /> {o.l}
              </span>
              <p className="text-xs text-tinta/55 ac-muted mt-1">{o.sub}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Vista previa */}
      <Card className="bg-marca-50/40">
        <SectionTitle>Vista previa</SectionTitle>
        <p className="text-tinta ac-ink leading-relaxed">{textoPreview}</p>
        <div className="mt-3">
          <BotonAudio texto={textoPreview} label={tr('escuchar', a.idioma)} />
        </div>
      </Card>

      <AvisoSeguridad compacto />
    </div>
  )
}
