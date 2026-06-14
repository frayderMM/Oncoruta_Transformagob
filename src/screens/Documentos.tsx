import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'
import { Card, SectionTitle, BotonAudio, AvisoSeguridad } from '../components/ui/Primitivos'
import ChecklistDocumentos from '../components/ChecklistDocumentos'
import DocumentoViewerModal from '../components/DocumentoViewerModal'
import Icon from '../components/ui/Icon'
import type { DocumentoRuta } from '../types'

const CHIP_ESTADO: Record<string, string> = {
  Validado: 'bg-exito/12 text-exito',
  Disponible: 'bg-marca-50 text-marca-700',
  Registrado: 'bg-ayuda/10 text-ayuda',
  Pendiente: 'bg-precaucion/15 text-[#9a7400]',
}

export default function Documentos() {
  const { pacienteActivo, marcarDocumento, enviarNotificacion } = useApp()
  const { idioma } = useAccesibilidad()
  const [docViewer, setDocViewer] = useState<DocumentoRuta | null>(null)
  const p = pacienteActivo()
  if (!p) return null

  const ruta = p.rutasDiagnosticas.find((r) => r.id === p.rutaActivaId)
  const documentosRuta = ruta?.documentosRuta ?? []

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

      {/* ── Documentos de la ruta diagnóstica ── */}
      {documentosRuta.length > 0 && (
        <div>
          <SectionTitle sub="Documentos generados durante tu ruta diagnóstica. Toca Ver para revisar cada uno.">
            Documentos de tu ruta
          </SectionTitle>
          <Card>
            <div className="overflow-x-auto rounded-2xl border border-black/8">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-black/8">
                    {['Documento', 'Etapa', 'Fecha', 'Estado', 'Acción'].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-tinta/55 uppercase tracking-wide whitespace-nowrap bg-black/[0.03]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documentosRuta.map((doc, i) => (
                    <tr key={doc.id} className={`border-b border-black/5 last:border-0 ${i % 2 ? 'bg-black/[0.015]' : ''}`}>
                      <td className="px-4 py-2.5 text-sm font-medium text-tinta/80">{doc.nombre}</td>
                      <td className="px-4 py-2.5 text-sm text-tinta/70">{doc.etapa}</td>
                      <td className="px-4 py-2.5 text-sm text-tinta/70 whitespace-nowrap">{doc.fecha}</td>
                      <td className="px-4 py-2.5">
                        <span className={`chip text-xs ${CHIP_ESTADO[doc.estado] ?? 'bg-black/6 text-tinta/60'}`}>
                          {doc.estado}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {doc.imagenUrl && (
                          <button
                            onClick={() => setDocViewer(doc)}
                            className="inline-flex items-center gap-1 text-xs text-marca-600 font-semibold hover:underline"
                          >
                            <Icon name="doc" size={13} /> Ver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <AvisoSeguridad />

      {docViewer && (
        <DocumentoViewerModal doc={docViewer} onCerrar={() => setDocViewer(null)} />
      )}
    </div>
  )
}
