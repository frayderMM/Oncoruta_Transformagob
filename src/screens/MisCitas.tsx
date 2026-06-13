import { useApp } from '../context/AppContext'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'
import type { Cita } from '../types'
import { Card, SectionTitle, AvisoSeguridad } from '../components/ui/Primitivos'
import TarjetaCita from '../components/TarjetaCita'
import Icon from '../components/ui/Icon'

export default function MisCitas() {
  const { pacienteActivo, confirmarCita, enviarNotificacion } = useApp()
  const { idioma } = useAccesibilidad()
  const p = pacienteActivo()
  if (!p) return null

  const onConfirmar = (citaId: string) => {
    confirmarCita(p.id, citaId)
    const cita = p.citas.find((c) => c.id === citaId)
    enviarNotificacion({
      canal: 'WhatsApp',
      titulo: 'Cita confirmada',
      cuerpo: `Confirmaste tu asistencia a ${cita?.servicio ?? 'tu cita'} el ${cita?.fecha ?? ''}. ¡Te esperamos!`,
    })
  }

  const onRecordatorio = (cita: Cita) => {
    enviarNotificacion({
      canal: 'SMS',
      titulo: 'Recordatorio activado',
      cuerpo: `INEN: te recordaremos tu cita de ${cita.servicio} el ${cita.fecha} a las ${cita.hora}. Lleva: ${cita.documentos.join(', ') || 'tu DNI'}.`,
    })
  }

  const proximas = p.citas.filter((c) => c.estado !== 'Realizada' && c.estado !== 'Perdida')
  const historial = p.citas.filter((c) => c.estado === 'Realizada' || c.estado === 'Perdida')

  return (
    <div className="space-y-5 animate-fade-up">
      <SectionTitle sub="Aquí ves tus próximas citas, qué llevar y cómo llegar. Puedes confirmar tu asistencia.">
        {tr('mis_citas', idioma)}
      </SectionTitle>

      {proximas.length > 0 ? (
        <div className="space-y-4">
          {proximas.map((c) => (
            <TarjetaCita key={c.id} cita={c} onConfirmar={onConfirmar} onRecordatorio={onRecordatorio} />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-tinta/65 ac-muted inline-flex items-center gap-2">
            <Icon name="calendar" size={18} /> No tienes próximas citas. El INEN te avisará cuando se programe la siguiente.
          </p>
        </Card>
      )}

      {historial.length > 0 && (
        <div>
          <SectionTitle>Citas anteriores</SectionTitle>
          <div className="space-y-3">
            {historial.map((c) => (
              <TarjetaCita key={c.id} cita={c} />
            ))}
          </div>
        </div>
      )}

      <AvisoSeguridad compacto />
    </div>
  )
}
