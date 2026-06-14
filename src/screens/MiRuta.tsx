import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'
import { Card, SectionTitle, AvisoSeguridad } from '../components/ui/Primitivos'
import RutaHorizontal from '../components/RutaHorizontal'
import Icon from '../components/ui/Icon'

export default function MiRuta() {
  const { pacienteActivo, ir } = useApp()
  const { idioma } = useAccesibilidad()
  const [mostrarAnteriores, setMostrarAnteriores] = useState(false)
  const p = pacienteActivo()
  if (!p) return null

  const rutaActiva = p.rutasDiagnosticas.find((r) => r.id === p.rutaActivaId)
  const rutasAnteriores = p.rutasDiagnosticas.filter(
    (r) => r.id !== p.rutaActivaId && r.estadoRuta === 'Finalizada',
  )
  const rutaFinalizada = rutaActiva?.estadoRuta === 'Finalizada'

  return (
    <div className="space-y-5 animate-fade-up">
      <SectionTitle sub="Selecciona cada etapa del menú para ver el detalle de tu proceso.">
        {tr('mi_ruta', idioma)}
      </SectionTitle>

      {/* Ruta horizontal (stepper + panel de detalle) */}
      {rutaActiva && (
        <RutaHorizontal
          ruta={rutaActiva}
          documentosRuta={rutaActiva.documentosRuta ?? []}
          onVerHistorial={() => ir('historial')}
        />
      )}

      {/* Próximo paso (solo cuando la ruta no está finalizada) */}
      {!rutaFinalizada && (
        <Card className="border-2 border-marca-200 bg-marca-50/40">
          <div className="flex items-start gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-marca-500 text-white shrink-0">
              <Icon name="flag" size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-marca-700">{tr('tu_proximo_paso', idioma)}</p>
              <p className="text-tinta ac-ink mt-0.5 font-medium leading-relaxed">
                {p.proximoPaso}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Rutas anteriores */}
      {rutasAnteriores.length > 0 && (
        <div>
          <button
            onClick={() => setMostrarAnteriores(!mostrarAnteriores)}
            className="flex items-center gap-2 text-sm text-tinta/60 hover:text-marca-600 transition font-medium"
          >
            <Icon name={mostrarAnteriores ? 'left' : 'right'} size={16} />
            Rutas anteriores ({rutasAnteriores.length})
          </button>

          {mostrarAnteriores && (
            <div className="mt-3 space-y-2 animate-fade-up">
              {rutasAnteriores.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-black/8 bg-black/[0.02] text-sm"
                >
                  <div>
                    <p className="font-semibold text-tinta ac-ink">{r.codigo}</p>
                    <p className="text-xs text-tinta/55 ac-muted mt-0.5">
                      {r.tipoIngreso} · {r.tipoSospecha} · {r.fechaInicio}
                      {r.fechaCierre ? ` → ${r.fechaCierre}` : ''}
                    </p>
                  </div>
                  <span className="chip text-xs bg-exito/12 text-exito">{r.estadoRuta}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AvisoSeguridad />
    </div>
  )
}
