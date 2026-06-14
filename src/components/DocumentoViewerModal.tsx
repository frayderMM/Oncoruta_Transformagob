import { useEffect, useCallback } from 'react'
import type { DocumentoRuta } from '../types'
import Icon from './ui/Icon'

interface Props {
  doc: DocumentoRuta
  onCerrar: () => void
}

const CHIP_ESTADO: Record<string, string> = {
  Validado: 'bg-exito/12 text-exito',
  Disponible: 'bg-marca-50 text-marca-700',
  Registrado: 'bg-ayuda/10 text-ayuda',
  Pendiente: 'bg-precaucion/15 text-[#9a7400]',
}

export default function DocumentoViewerModal({ doc, onCerrar }: Props) {
  // Cerrar con Esc
  const handler = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar() }, [onCerrar])
  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handler])

  const chipClass = CHIP_ESTADO[doc.estado] ?? 'bg-black/6 text-tinta/60'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar() }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-black/8 shrink-0">
          <div>
            <p className="font-display font-bold text-tinta text-lg leading-tight">{doc.nombre}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="chip text-xs bg-black/6 text-tinta/60">{doc.etapa}</span>
              <span className="chip text-xs bg-black/6 text-tinta/60">{doc.fecha}</span>
              <span className={`chip text-xs ${chipClass}`}>{doc.estado}</span>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="shrink-0 grid place-items-center w-9 h-9 rounded-xl bg-black/6 text-tinta/60 hover:bg-black/10 transition"
            aria-label="Cerrar"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Aviso de seguridad */}
        <div className="px-6 py-2 bg-ayuda/6 border-b border-ayuda/15 shrink-0">
          <p className="text-[11px] text-ayuda/80 leading-snug">
            Documento de referencia administrativa. OncoRuta no interpreta resultados médicos ni emite diagnósticos.
          </p>
        </div>

        {/* Imagen */}
        <div className="flex-1 overflow-y-auto p-5 min-h-0 bg-gray-50">
          {doc.imagenUrl ? (
            <img
              src={doc.imagenUrl}
              alt={`Documento: ${doc.nombre}`}
              className="w-full rounded-2xl shadow-sm border border-black/8 object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-tinta/35 gap-3">
              <Icon name="doc" size={40} />
              <p className="text-sm">Vista previa no disponible</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/8 flex items-center justify-between gap-3 shrink-0 bg-white">
          <p className="text-xs text-tinta/40">Datos ficticios · Solo para demostración</p>
          {doc.imagenUrl && (
            <a
              href={doc.imagenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-marca-500 text-white text-sm font-semibold hover:bg-marca-600 transition"
            >
              <Icon name="doc" size={15} /> Abrir en nueva pestaña
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
