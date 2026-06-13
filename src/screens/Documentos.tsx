import { useApp } from '../context/AppContext'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'
import { Card, SectionTitle, BotonAudio, AvisoSeguridad } from '../components/ui/Primitivos'
import ChecklistDocumentos from '../components/ChecklistDocumentos'
import Icon from '../components/ui/Icon'

export default function Documentos() {
  const { pacienteActivo, marcarDocumento, enviarNotificacion } = useApp()
  const { idioma } = useAccesibilidad()
  const p = pacienteActivo()
  if (!p) return null

  const pendientes = p.documentos.filter((d) => d.estado === 'Pendiente' || d.estado === 'Observado')
  const listos = p.documentos.filter((d) => d.estado === 'Recibido')

  const onMarcar = (docId: string) => {
    marcarDocumento(p.id, docId)
    const doc = p.documentos.find((d) => d.id === docId)
    enviarNotificacion({
      canal: 'Interna',
      titulo: 'Documento marcado',
      cuerpo: `Avisaremos al INEN que tienes listo: ${doc?.nombre ?? 'tu documento'}. Recuerda llevarlo a tu próxima cita.`,
    })
  }

  const textoDocs = pendientes.length
    ? `Tienes ${pendientes.length} documentos pendientes. ${pendientes.map((d) => d.nombre).join(', ')}.`
    : 'Tienes todos tus documentos listos.'

  return (
    <div className="space-y-5 animate-fade-up">
      <SectionTitle sub="Marca los documentos que ya tienes listos. Así el INEN sabe que puedes avanzar.">
        {tr('documentos', idioma)}
      </SectionTitle>

      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`grid place-items-center w-11 h-11 rounded-2xl ${pendientes.length ? 'bg-precaucion/15 text-[#9a7400]' : 'bg-exito/12 text-exito'}`}>
            <Icon name={pendientes.length ? 'doc' : 'check'} size={22} />
          </span>
          <div>
            <p className="font-display text-xl font-bold text-tinta ac-ink">
              {pendientes.length ? `${pendientes.length} pendientes` : 'Todo listo'}
            </p>
            <p className="text-sm text-tinta/60 ac-muted">{listos.length} de {p.documentos.length} recibidos</p>
          </div>
        </div>
        <BotonAudio texto={textoDocs} />
      </Card>

      {pendientes.length > 0 && (
        <div>
          <SectionTitle>Por entregar</SectionTitle>
          <ChecklistDocumentos documentos={pendientes} onMarcar={onMarcar} />
        </div>
      )}

      {listos.length > 0 && (
        <div>
          <SectionTitle>Ya recibidos</SectionTitle>
          <ChecklistDocumentos documentos={listos} />
        </div>
      )}

      <AvisoSeguridad />
    </div>
  )
}
