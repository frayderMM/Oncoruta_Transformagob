import { useApp } from '../context/AppContext'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'
import { ETAPAS_ORDEN } from '../data/pacientes'
import { Card, SectionTitle, BotonAudio, AvisoSeguridad } from '../components/ui/Primitivos'
import RutaTimeline from '../components/RutaTimeline'
import Icon from '../components/ui/Icon'

export default function MiRuta() {
  const { pacienteActivo } = useApp()
  const { idioma } = useAccesibilidad()
  const p = pacienteActivo()
  if (!p) return null

  const completadas = p.ruta.filter((e) => e.estado === 'Completado').length
  const total = ETAPAS_ORDEN.length
  const pct = Math.round((completadas / total) * 100)

  const textoRuta = `${tr('mi_ruta', idioma)}. Estás en la etapa ${p.etapaActual}. ${p.proximoPaso}`

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <SectionTitle sub="Este es tu camino en el INEN, paso a paso. La marca rosa muestra dónde estás hoy.">
          {tr('mi_ruta', idioma)}
        </SectionTitle>
      </div>

      {/* Progreso */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-tinta/55 ac-muted">Avance de tu ruta</p>
            <p className="font-display text-2xl font-extrabold text-marca-600">{completadas} de {total} etapas</p>
          </div>
          <BotonAudio texto={textoRuta} />
        </div>
        <div className="mt-3 h-3 rounded-full bg-black/8 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-marca-500 to-rosa-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      {/* Línea de tiempo de la ruta */}
      <Card>
        <RutaTimeline ruta={p.ruta} etapaActual={p.etapaActual} />
      </Card>

      {/* Próximo paso */}
      <Card className="border-2 border-marca-200 bg-marca-50/40">
        <div className="flex items-start gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-2xl bg-marca-500 text-white shrink-0">
            <Icon name="flag" size={20} />
          </span>
          <div>
            <p className="text-sm font-semibold text-marca-700">{tr('tu_proximo_paso', idioma)}</p>
            <p className="text-tinta ac-ink mt-0.5 font-medium leading-relaxed">{p.proximoPaso}</p>
          </div>
        </div>
      </Card>

      <AvisoSeguridad />
    </div>
  )
}
