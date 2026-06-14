import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { ETAPAS_ORDEN } from '../data/pacientes'
import { evaluarRiesgo } from '../lib/semaforo'
import type { Riesgo } from '../types'
import { Card, SectionTitle, AvisoSeguridad } from '../components/ui/Primitivos'
import EstadoAvance from '../components/EstadoAvance'
import Icon, { type IconName } from '../components/ui/Icon'

export default function AdminPanel() {
  const { pacientes } = useApp()

  const m = useMemo(() => {
    const evals = pacientes.map((p) => evaluarRiesgo(p).nivel)
    const porAvance: Record<Riesgo, number> = {
      rojo: evals.filter((e) => e === 'rojo').length,
      amarillo: evals.filter((e) => e === 'amarillo').length,
      verde: evals.filter((e) => e === 'verde').length,
    }
    const porEtapa = ETAPAS_ORDEN.map((et) => ({
      etapa: et,
      n: pacientes.filter((p) => p.etapaActual === et).length,
    }))
    const promedioDias = pacientes.length
      ? Math.round(
          (pacientes.reduce((s, p) => s + p.diasSinAvance, 0) / pacientes.length) * 10,
        ) / 10
      : 0
    const docsPendientes = pacientes.reduce(
      (s, p) =>
        s +
        p.documentos.filter((d) => d.estado === 'Pendiente' || d.estado === 'Observado').length,
      0,
    )
    const conCuidador = pacientes.filter((p) => p.cuidador?.estado === 'activo').length

    // KPIs de rutas
    const totalRutas = pacientes.reduce((s, p) => s + p.rutasDiagnosticas.length, 0)
    const rutasActivas = pacientes.reduce(
      (s, p) => s + p.rutasDiagnosticas.filter((r) => r.estadoRuta === 'Activa').length,
      0,
    )
    const rutasFinalizadas = pacientes.reduce(
      (s, p) => s + p.rutasDiagnosticas.filter((r) => r.estadoRuta === 'Finalizada').length,
      0,
    )

    return { porAvance, porEtapa, promedioDias, docsPendientes, conCuidador, totalRutas, rutasActivas, rutasFinalizadas }
  }, [pacientes])

  const maxEtapa = Math.max(1, ...m.porEtapa.map((e) => e.n))

  const kpis: { icon: IconName; label: string; valor: string; tono: string }[] = [
    { icon: 'users', label: 'Pacientes activas', valor: String(pacientes.length), tono: 'bg-marca-50 text-marca-700' },
    { icon: 'alert', label: 'Retraso prioritario', valor: String(m.porAvance.rojo), tono: 'bg-riesgo/10 text-riesgo' },
    { icon: 'clock', label: 'Días sin avance (prom.)', valor: String(m.promedioDias), tono: 'bg-precaucion/15 text-[#9a7400]' },
    { icon: 'doc', label: 'Documentos pendientes', valor: String(m.docsPendientes), tono: 'bg-ayuda/10 text-ayuda' },
  ]

  const kpisRutas: { icon: IconName; label: string; valor: string; tono: string }[] = [
    { icon: 'ruta', label: 'Total de rutas', valor: String(m.totalRutas), tono: 'bg-marca-50 text-marca-700' },
    { icon: 'check', label: 'Rutas activas', valor: String(m.rutasActivas), tono: 'bg-exito/10 text-exito' },
    { icon: 'flag', label: 'Rutas finalizadas', valor: String(m.rutasFinalizadas), tono: 'bg-black/5 text-tinta/60' },
    { icon: 'alert', label: 'Con posible retraso', valor: String(m.porAvance.amarillo), tono: 'bg-precaucion/15 text-[#9a7400]' },
  ]

  return (
    <div className="space-y-5 animate-fade-up">
      <SectionTitle sub="Vista global del programa de navegación diagnóstica. Datos de demostración.">
        Tablero administrativo
      </SectionTitle>

      {/* KPIs de pacientes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <span className={`grid place-items-center w-10 h-10 rounded-2xl ${k.tono}`}>
              <Icon name={k.icon} size={20} />
            </span>
            <p className="font-display text-3xl font-extrabold text-tinta ac-ink mt-2">{k.valor}</p>
            <p className="text-sm text-tinta/55 ac-muted">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* KPIs de rutas */}
      <div>
        <p className="text-sm font-semibold text-tinta/50 ac-muted mb-2">Rutas diagnósticas</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpisRutas.map((k) => (
            <Card key={k.label}>
              <span className={`grid place-items-center w-10 h-10 rounded-2xl ${k.tono}`}>
                <Icon name={k.icon} size={20} />
              </span>
              <p className="font-display text-3xl font-extrabold text-tinta ac-ink mt-2">{k.valor}</p>
              <p className="text-sm text-tinta/55 ac-muted">{k.label}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Distribución por estado de avance */}
        <Card>
          <SectionTitle>Distribución por estado de avance</SectionTitle>
          <div className="space-y-3">
            {(
              [
                { n: 'rojo', label: 'Retraso prioritario' },
                { n: 'amarillo', label: 'Posible retraso' },
                { n: 'verde', label: 'Avance normal' },
              ] as { n: Riesgo; label: string }[]
            ).map((r) => {
              const v = m.porAvance[r.n]
              const pct = pacientes.length ? (v / pacientes.length) * 100 : 0
              const barra =
                r.n === 'rojo' ? 'bg-riesgo' : r.n === 'amarillo' ? 'bg-precaucion' : 'bg-exito'
              return (
                <div key={r.n}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <EstadoAvance nivel={r.n} size="sm" />
                    <span className="font-semibold text-tinta ac-ink">
                      {v} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-black/8 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barra}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Distribución por etapa (ruta primera vez) */}
        <Card>
          <SectionTitle>Pacientes por etapa</SectionTitle>
          <div className="space-y-2.5">
            {m.porEtapa.map((e) => (
              <div key={e.etapa} className="flex items-center gap-3">
                <span className="text-sm text-tinta/65 ac-muted w-32 shrink-0 truncate">
                  {e.etapa}
                </span>
                <div className="flex-1 h-6 rounded-lg bg-black/5 overflow-hidden">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-marca-400 to-marca-500 flex items-center justify-end pr-2"
                    style={{ width: `${(e.n / maxEtapa) * 100}%` }}
                  >
                    {e.n > 0 && <span className="text-xs text-white font-bold">{e.n}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Reglas del estado de avance */}
      <Card>
        <SectionTitle sub="Lógica operativa de la navegación. No utiliza datos clínicos.">
          Reglas del estado de avance
        </SectionTitle>
        <p className="text-sm text-tinta/60 ac-muted mb-4 leading-relaxed">
          No medimos riesgo clínico. Medimos el estado de avance de la ruta diagnóstica para
          detectar retrasos y activar acompañamiento oportuno.
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            {
              n: 'verde' as Riesgo,
              reglas: [
                'Documentos completos',
                'Cita programada o confirmada',
                'Menos de 3 días sin avance',
              ],
            },
            {
              n: 'amarillo' as Riesgo,
              reglas: [
                'Documentos importantes pendientes',
                'Entre 3 y 7 días sin avance',
                'Provincia con documentos incompletos',
                'Sin cuidador y baja alfabetización',
              ],
            },
            {
              n: 'rojo' as Riesgo,
              reglas: [
                'Más de 7 días sin avance',
                'Cita perdida o sin programar',
                'Alerta de retraso sin atender',
              ],
            },
          ].map((b) => (
            <div key={b.n} className="rounded-2xl border border-black/8 p-4">
              <EstadoAvance nivel={b.n} size="sm" />
              <ul className="mt-3 space-y-1.5 text-sm text-tinta/70 ac-muted">
                {b.reglas.map((r) => (
                  <li key={r} className="flex items-start gap-1.5">
                    <Icon name="check" size={14} className="text-marca-400 mt-0.5 shrink-0" />{' '}
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Gestión simulada */}
      <Card>
        <SectionTitle>Gestión (demostración)</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: 'users' as IconName, t: 'Usuarios y roles', d: 'Personal navegador y permisos.' },
            { icon: 'bell' as IconName, t: 'Plantillas de aviso', d: 'WhatsApp / SMS / recordatorios.' },
            { icon: 'globe' as IconName, t: 'Idiomas', d: 'Español y quechua (demo).' },
          ].map((c) => (
            <button
              key={c.t}
              className="rounded-2xl border border-black/8 p-4 text-left hover:border-marca-200 transition"
            >
              <Icon name={c.icon} size={20} className="text-marca-500" />
              <p className="font-semibold text-tinta ac-ink mt-2">{c.t}</p>
              <p className="text-xs text-tinta/55 ac-muted">{c.d}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-tinta/45 ac-muted mt-3">
          {m.conCuidador} de {pacientes.length} pacientes con cuidador activo.
        </p>
      </Card>

      <AvisoSeguridad />
    </div>
  )
}
