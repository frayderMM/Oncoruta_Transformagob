import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { TODAS_ETAPAS } from '../data/pacientes'
import { evaluarRiesgo, accionRecomendadaINEN } from '../lib/semaforo'
import type { Riesgo } from '../types'
import { Card, SectionTitle } from '../components/ui/Primitivos'
import EstadoAvance from '../components/EstadoAvance'
import Icon from '../components/ui/Icon'

const AVANCE_ORDEN: Record<Riesgo, number> = { rojo: 0, amarillo: 1, verde: 2 }

export default function PanelINEN() {
  const { pacientes, seleccionarPaciente } = useApp()
  const [fEtapa, setFEtapa] = useState('todas')
  const [fAvance, setFAvance] = useState('todos')
  const [fSospecha, setFSospecha] = useState('todas')
  const [busqueda, setBusqueda] = useState('')

  const enriquecidos = useMemo(
    () =>
      pacientes
        .map((p) => {
          const rutaActiva = p.rutasDiagnosticas.find((r) => r.id === p.rutaActivaId)
          return {
            p,
            ev: evaluarRiesgo(p),
            accion: accionRecomendadaINEN(p),
            rutaActiva,
          }
        })
        .sort((a, b) => {
          const r = AVANCE_ORDEN[a.ev.nivel] - AVANCE_ORDEN[b.ev.nivel]
          return r !== 0 ? r : b.p.diasSinAvance - a.p.diasSinAvance
        }),
    [pacientes],
  )

  const filtrados = enriquecidos.filter(({ p, ev }) => {
    if (fEtapa !== 'todas' && p.etapaActual !== fEtapa) return false
    if (fAvance !== 'todos' && ev.nivel !== fAvance) return false
    if (fSospecha !== 'todas' && p.tipoSospecha !== fSospecha) return false
    if (
      busqueda &&
      !`${p.nombres} ${p.apellidos} ${p.procedencia}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )
      return false
    return true
  })

  const conteo = {
    rojo: enriquecidos.filter((e) => e.ev.nivel === 'rojo').length,
    amarillo: enriquecidos.filter((e) => e.ev.nivel === 'amarillo').length,
    verde: enriquecidos.filter((e) => e.ev.nivel === 'verde').length,
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <SectionTitle sub="Seguimiento operativo de la navegación diagnóstica. Prioriza por estado de avance.">
          Panel de pacientes
        </SectionTitle>
        <span className="text-sm text-tinta/55">
          {filtrados.length} de {pacientes.length} pacientes
        </span>
      </div>

      {/* Resumen por estado de avance */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { n: 'rojo', label: 'Retraso prioritario', desc: 'Requiere acción hoy' },
            { n: 'amarillo', label: 'Posible retraso', desc: 'Revisar pronto' },
            { n: 'verde', label: 'Avance normal', desc: 'Seguimiento estándar' },
          ] as { n: Riesgo; label: string; desc: string }[]
        ).map((c) => (
          <button
            key={c.n}
            onClick={() => setFAvance(fAvance === c.n ? 'todos' : c.n)}
            className={`tarjeta ac-surface p-4 text-left transition ${fAvance === c.n ? 'ring-2 ring-marca-400' : ''}`}
          >
            <div className="flex items-center justify-between">
              <EstadoAvance nivel={c.n} size="sm" />
              <span className="font-display text-2xl font-extrabold text-tinta ac-ink">
                {conteo[c.n]}
              </span>
            </div>
            <p className="text-xs text-tinta/55 ac-muted mt-1.5">{c.desc}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-black/10 rounded-2xl px-3 py-2">
            <Icon name="search" size={18} className="text-tinta/40" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o procedencia…"
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>
          <Select
            label="Etapa"
            value={fEtapa}
            onChange={setFEtapa}
            options={['todas', ...TODAS_ETAPAS]}
          />
          <Select
            label="Sospecha"
            value={fSospecha}
            onChange={setFSospecha}
            options={['todas', 'Mama', 'Cérvix']}
          />
        </div>
      </Card>

      {/* Tabla escritorio */}
      <div className="hidden lg:block tarjeta ac-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/[0.03] text-left text-tinta/55">
              <th className="px-4 py-3 font-semibold">Paciente</th>
              <th className="px-4 py-3 font-semibold">Sospecha</th>
              <th className="px-4 py-3 font-semibold">Tipo de ruta</th>
              <th className="px-4 py-3 font-semibold">Etapa actual</th>
              <th className="px-4 py-3 font-semibold">Días sin avance</th>
              <th className="px-4 py-3 font-semibold">Estado de avance</th>
              <th className="px-4 py-3 font-semibold">Próxima acción</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(({ p, ev, accion, rutaActiva }) => (
              <tr
                key={p.id}
                onClick={() => seleccionarPaciente(p.id)}
                className="border-t border-black/5 hover:bg-marca-50/40 cursor-pointer transition"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-tinta ac-ink">
                    {p.nombres} {p.apellidos}
                  </p>
                  <p className="text-xs text-tinta/50 ac-muted">
                    {p.edad} años · {p.procedencia}
                    {p.esProvincia ? ' (provincia)' : ''}
                  </p>
                  {rutaActiva && (
                    <p className="text-xs text-marca-600 mt-0.5">
                      {rutaActiva.codigo}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-tinta/70 ac-muted">{p.tipoSospecha}</td>
                <td className="px-4 py-3">
                  {rutaActiva ? (
                    <span className="chip text-xs bg-black/5 text-tinta/60">
                      {rutaActiva.tipoIngreso}
                    </span>
                  ) : (
                    <span className="text-tinta/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-tinta/70 ac-muted">{p.etapaActual}</td>
                <td className="px-4 py-3">
                  <span
                    className={`font-bold ${
                      p.diasSinAvance > 7
                        ? 'text-riesgo'
                        : p.diasSinAvance >= 3
                          ? 'text-[#9a7400]'
                          : 'text-tinta/60'
                    }`}
                  >
                    {p.diasSinAvance} días
                  </span>
                </td>
                <td className="px-4 py-3">
                  <EstadoAvance nivel={ev.nivel} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <span className="chip text-xs bg-marca-50 text-marca-700">{accion}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Icon name="right" size={18} className="text-tinta/30" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <p className="text-center text-tinta/50 py-8">No hay pacientes con esos filtros.</p>
        )}
      </div>

      {/* Tarjetas móvil */}
      <div className="lg:hidden space-y-3">
        {filtrados.map(({ p, ev, accion, rutaActiva }) => (
          <Card key={p.id} onClick={() => seleccionarPaciente(p.id)}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-tinta ac-ink">
                  {p.nombres} {p.apellidos}
                </p>
                <p className="text-xs text-tinta/50 ac-muted">
                  {p.edad} años · {p.procedencia} · {p.tipoSospecha}
                </p>
                {rutaActiva && (
                  <p className="text-xs text-marca-600 mt-0.5">
                    {rutaActiva.codigo} · {rutaActiva.tipoIngreso}
                  </p>
                )}
              </div>
              <EstadoAvance nivel={ev.nivel} size="sm" />
            </div>
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-tinta/65 ac-muted">{p.etapaActual}</span>
              <span
                className={`font-bold ${
                  p.diasSinAvance > 7
                    ? 'text-riesgo'
                    : p.diasSinAvance >= 3
                      ? 'text-[#9a7400]'
                      : 'text-tinta/60'
                }`}
              >
                {p.diasSinAvance} días
              </span>
            </div>
            <div className="mt-2">
              <span className="chip text-xs bg-marca-50 text-marca-700">{accion}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <label className="inline-flex items-center gap-2 bg-white border border-black/10 rounded-2xl px-3 py-2 text-sm">
      <Icon name="filter" size={15} className="text-tinta/40" />
      <span className="text-tinta/50">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none bg-transparent font-medium text-tinta ac-ink"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === 'todas' || o === 'todos' ? 'Todas' : o}
          </option>
        ))}
      </select>
    </label>
  )
}
