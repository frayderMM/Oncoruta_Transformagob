import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'
import { Card, SectionTitle, BotonAudio, AvisoSeguridad } from '../components/ui/Primitivos'
import RutaTimeline from '../components/RutaTimeline'
import EstadoAvance from '../components/EstadoAvance'
import DetalleEtapaModal from '../components/DetalleEtapaModal'
import Icon from '../components/ui/Icon'
import { evaluarRiesgo } from '../lib/semaforo'
import type { Etapa } from '../types'

export default function MiRuta() {
  const { pacienteActivo, ir } = useApp()
  const { idioma } = useAccesibilidad()
  const [mostrarAnteriores, setMostrarAnteriores] = useState(false)
  const [etapaDetalle, setEtapaDetalle] = useState<Etapa | null>(null)
  const p = pacienteActivo()
  if (!p) return null

  const ev = evaluarRiesgo(p)
  const rutaActiva = p.rutasDiagnosticas.find((r) => r.id === p.rutaActivaId)
  const rutasAnteriores = p.rutasDiagnosticas.filter(
    (r) => r.id !== p.rutaActivaId && r.estadoRuta === 'Finalizada',
  )
  const rutaFinalizada = rutaActiva?.estadoRuta === 'Finalizada'

  const completadas = p.ruta.filter((e) => e.estado === 'Completado').length
  const total = p.ruta.length
  const pct = Math.round((completadas / total) * 100)

  const textoRuta = `${tr('mi_ruta', idioma)}. Estás en la etapa ${p.etapaActual}. ${p.proximoPaso}`

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <SectionTitle sub="Este es tu camino en el INEN, paso a paso. La marca rosa muestra dónde estás hoy.">
          {tr('mi_ruta', idioma)}
        </SectionTitle>
      </div>

      {/* Banner de ruta finalizada */}
      {rutaFinalizada && (
        <div className="rounded-3xl bg-gradient-to-br from-exito to-marca-500 text-white p-5 flex items-start gap-4">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-white/20 shrink-0">
            <Icon name="check" size={24} />
          </span>
          <div className="flex-1">
            <p className="font-display font-bold text-lg leading-tight">Ruta finalizada</p>
            <p className="text-white/90 text-sm mt-1 leading-relaxed">
              Completaste todas las etapas de esta ruta diagnóstica.{' '}
              {rutaActiva?.fechaCierre ? `Cierre: ${rutaActiva.fechaCierre}.` : ''}{' '}
              Puedes revisar cada etapa tocando «Ver detalle».
            </p>
            <button
              onClick={() => ir('historial')}
              className="mt-3 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition text-sm font-semibold flex items-center gap-1.5"
            >
              <Icon name="doc" size={15} /> Ver historial clínico resumido
            </button>
          </div>
        </div>
      )}

      {/* Card de ruta activa */}
      {rutaActiva && (
        <Card className="border border-marca-200 bg-marca-50/30">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-tinta/50 uppercase tracking-wide font-medium">
                {rutaFinalizada ? 'Ruta finalizada' : 'Ruta activa'}
              </p>
              <p className="font-display font-bold text-marca-700 mt-0.5">
                {rutaActiva.codigo}
              </p>
              <p className="text-sm text-tinta/65 ac-muted mt-0.5">
                {rutaActiva.tipoIngreso} · Sospecha: {rutaActiva.tipoSospecha}
              </p>
            </div>
            {!rutaFinalizada && <EstadoAvance nivel={ev.nivel} size="sm" />}
            {rutaFinalizada && (
              <span className="chip bg-exito/12 text-exito text-xs">Completada</span>
            )}
          </div>
        </Card>
      )}

      {/* Progreso */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-tinta/55 ac-muted">Avance de tu ruta</p>
            <p className="font-display text-2xl font-extrabold text-marca-600">
              {completadas} de {total} etapas
            </p>
          </div>
          <BotonAudio texto={textoRuta} />
        </div>
        <div className="mt-3 h-3 rounded-full bg-black/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-marca-500 to-rosa-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Card>

      {/* Línea de tiempo de la ruta activa */}
      <Card>
        <RutaTimeline
          ruta={p.ruta}
          etapaActual={p.etapaActual}
          onVerDetalle={setEtapaDetalle}
        />
      </Card>

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

      {/* Modal de detalle de etapa */}
      {etapaDetalle?.detalle && (
        <DetalleEtapaModal
          etapa={etapaDetalle}
          onCerrar={() => setEtapaDetalle(null)}
          onVerHistorial={() => ir('historial')}
        />
      )}
    </div>
  )
}
