import { useApp } from '../context/AppContext'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'
import type { Alerta } from '../types'
import { Card, SectionTitle, AvisoSeguridad } from '../components/ui/Primitivos'
import AlertaCard from '../components/AlertaCard'
import Icon from '../components/ui/Icon'

export default function Alertas() {
  const { pacienteActivo, atenderAlerta, enviarNotificacion } = useApp()
  const { idioma } = useAccesibilidad()
  const p = pacienteActivo()
  if (!p) return null

  const abiertas = p.alertas.filter((a) => a.estado === 'Nueva' || a.estado === 'Vista')
  const cerradas = p.alertas.filter((a) => a.estado !== 'Nueva' && a.estado !== 'Vista')

  const onEntendido = (id: string) => {
    atenderAlerta(p.id, id)
    enviarNotificacion({
      canal: 'Interna',
      titulo: 'Aviso atendido',
      cuerpo: 'Registramos que revisaste este aviso. Si necesitas ayuda, escríbele al asistente o pide apoyo del INEN.',
    })
  }

  const onNotificarCuidador = (alerta: Alerta) => {
    if (!p.cuidador) return
    enviarNotificacion({
      canal: 'WhatsApp',
      titulo: `Aviso enviado a ${p.cuidador.nombre}`,
      cuerpo: `Le contamos a tu ${p.cuidador.parentesco.toLowerCase()} sobre: "${alerta.mensaje}" para que pueda acompañarte.`,
    })
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <SectionTitle sub="Te avisamos cuando hay algo importante que hacer para no perder tu atención.">
        {tr('alertas', idioma)}
      </SectionTitle>

      {abiertas.length > 0 ? (
        <div className="space-y-3">
          {abiertas.map((a) => (
            <AlertaCard
              key={a.id}
              alerta={a}
              onEntendido={onEntendido}
              onNotificarCuidador={p.cuidador ? onNotificarCuidador : undefined}
            />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-exito font-medium inline-flex items-center gap-2">
            <Icon name="check" size={18} /> No tienes avisos pendientes. ¡Vas al día!
          </p>
        </Card>
      )}

      {cerradas.length > 0 && (
        <div>
          <SectionTitle>Avisos anteriores</SectionTitle>
          <div className="space-y-3">
            {cerradas.map((a) => (
              <AlertaCard key={a.id} alerta={a} />
            ))}
          </div>
        </div>
      )}

      <AvisoSeguridad compacto />
    </div>
  )
}
