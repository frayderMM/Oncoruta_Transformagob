import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { evaluarRiesgo } from '../lib/semaforo'
import type { Alerta } from '../types'
import { Card, SectionTitle } from '../components/ui/Primitivos'
import RutaTimeline from '../components/RutaTimeline'
import EstadoAvance from '../components/EstadoAvance'
import ChecklistDocumentos from '../components/ChecklistDocumentos'
import TarjetaCita from '../components/TarjetaCita'
import AlertaCard from '../components/AlertaCard'
import HistorialRutas from '../components/HistorialRutas'
import FormNuevaRuta from '../components/FormNuevaRuta'
import Icon, { type IconName } from '../components/ui/Icon'

export default function DetallePaciente() {
  const {
    pacienteSeleccionadoId,
    getPaciente,
    ir,
    atenderAlerta,
    registrarAccion,
    enviarNotificacion,
    crearRutaDiagnostica,
    marcarRutaActiva,
    sesion,
  } = useApp()
  const [tipoAccion, setTipoAccion] = useState<
    'Llamada' | 'Orientación' | 'Recordatorio' | 'Coordinación' | 'Actualización'
  >('Llamada')
  const [detalle, setDetalle] = useState('')
  const [mostrarFormNuevaRuta, setMostrarFormNuevaRuta] = useState(false)
  const [mostrarHistorial, setMostrarHistorial] = useState(false)

  const p = pacienteSeleccionadoId ? getPaciente(pacienteSeleccionadoId) : undefined
  if (!p) {
    return (
      <Card>
        <p className="text-tinta/60">
          No se encontró la paciente.{' '}
          <button onClick={() => ir('panel')} className="text-marca-600 font-semibold">
            Volver al panel
          </button>
        </p>
      </Card>
    )
  }

  const ev = evaluarRiesgo(p)
  const autor = sesion?.nombre ?? 'Personal INEN'
  const rutaActiva = p.rutasDiagnosticas.find((r) => r.id === p.rutaActivaId)
  const rutasAnteriores = p.rutasDiagnosticas.filter((r) => r.id !== p.rutaActivaId)

  const onRegistrar = () => {
    if (!detalle.trim()) return
    registrarAccion(p.id, { autor, tipo: tipoAccion, detalle: detalle.trim() })
    setDetalle('')
    enviarNotificacion({
      canal: 'Interna',
      titulo: 'Acción registrada',
      cuerpo: `${tipoAccion} registrada en el historial de ${p.nombres}.`,
    })
  }

  const onRecordatorio = () => {
    enviarNotificacion({
      canal: 'WhatsApp',
      titulo: `Recordatorio enviado a ${p.nombres}`,
      cuerpo: `INEN: ${p.proximoPaso}`,
    })
    registrarAccion(p.id, {
      autor,
      tipo: 'Recordatorio',
      detalle: 'Se envió recordatorio del próximo paso por WhatsApp.',
    })
  }

  const onNotificarCuidador = (alerta: Alerta) => {
    if (!p.cuidador) return
    enviarNotificacion({
      canal: 'WhatsApp',
      titulo: `Aviso a cuidador (${p.cuidador.nombre})`,
      cuerpo: `Se notificó a ${p.cuidador.nombre}: "${alerta.mensaje}"`,
    })
  }

  const onCrearRuta = (params: Parameters<typeof crearRutaDiagnostica>[1]) => {
    crearRutaDiagnostica(p.id, params)
    setMostrarFormNuevaRuta(false)
    enviarNotificacion({
      canal: 'Interna',
      titulo: 'Nueva ruta creada',
      cuerpo: `Se creó una nueva ruta diagnóstica para ${p.nombres}.`,
    })
  }

  const onMarcarActiva = (rutaId: string) => {
    marcarRutaActiva(p.id, rutaId)
    registrarAccion(p.id, {
      autor,
      tipo: 'Actualización',
      detalle: `Se cambió la ruta activa a ${p.rutasDiagnosticas.find((r) => r.id === rutaId)?.codigo ?? rutaId}.`,
    })
    enviarNotificacion({
      canal: 'Interna',
      titulo: 'Ruta activa actualizada',
      cuerpo: `La ruta activa de ${p.nombres} fue cambiada.`,
    })
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {mostrarFormNuevaRuta && (
        <FormNuevaRuta
          onCrear={onCrearRuta}
          onCancelar={() => setMostrarFormNuevaRuta(false)}
        />
      )}

      <button
        onClick={() => ir('panel')}
        className="inline-flex items-center gap-1.5 text-marca-600 ac-ink font-semibold hover:underline"
      >
        <Icon name="left" size={18} /> Volver al panel
      </button>

      {/* Cabecera de paciente */}
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-marca-500 text-white font-display font-bold text-xl shrink-0">
              {p.nombres[0]}
              {p.apellidos[0]}
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-tinta ac-ink">
                {p.nombres} {p.apellidos}
              </h1>
              <p className="text-sm text-tinta/60 ac-muted">
                {p.edad} años · {p.procedencia}
                {p.esProvincia ? ' (provincia)' : ''} · DNI {p.dni}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="chip text-xs bg-marca-50 text-marca-700">{p.tipoSospecha}</span>
                {rutaActiva && (
                  <span className="chip text-xs bg-marca-100 text-marca-700">
                    {rutaActiva.codigo} · {rutaActiva.tipoIngreso}
                  </span>
                )}
                <span className="chip text-xs bg-black/5 text-tinta/60">{p.etapaActual}</span>
                <span className="chip text-xs bg-black/5 text-tinta/60 inline-flex items-center gap-1">
                  <Icon name="phone" size={13} /> {p.telefono}
                </span>
                <span className="chip text-xs bg-black/5 text-tinta/60 inline-flex items-center gap-1">
                  <Icon name="globe" size={13} />{' '}
                  {p.idiomaPreferido === 'qu' ? 'Quechua' : 'Español'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={onRecordatorio} className="btn-secundario text-sm">
              <Icon name="send" size={16} /> Recordatorio
            </button>
            <button
              onClick={() => setMostrarFormNuevaRuta(true)}
              className="btn-primario text-sm"
            >
              <Icon name="plus" size={16} /> Nueva ruta
            </button>
          </div>
        </div>
      </Card>

      {/* Estado de avance */}
      <div>
        <SectionTitle sub="Mide el avance operativo de la ruta. No es una valoración clínica.">
          Estado de avance
        </SectionTitle>
        <EstadoAvance nivel={ev.nivel} motivos={ev.motivos} size="lg" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Ruta activa */}
        <Card>
          <SectionTitle>
            Ruta activa
            {rutaActiva && (
              <span className="ml-2 text-sm font-normal text-tinta/50">
                ({rutaActiva.codigo})
              </span>
            )}
          </SectionTitle>
          <RutaTimeline ruta={p.ruta} etapaActual={p.etapaActual} compacto />
        </Card>

        <div className="space-y-5">
          {/* Documentos */}
          <Card>
            <SectionTitle>Documentos</SectionTitle>
            <ChecklistDocumentos documentos={p.documentos} />
          </Card>
        </div>
      </div>

      {/* Citas */}
      <div>
        <SectionTitle>Citas</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          {p.citas.map((c) => (
            <TarjetaCita key={c.id} cita={c} />
          ))}
        </div>
      </div>

      {/* Alertas */}
      {p.alertas.length > 0 && (
        <div>
          <SectionTitle>Alertas</SectionTitle>
          <div className="space-y-3">
            {p.alertas.map((a) => (
              <AlertaCard
                key={a.id}
                alerta={a}
                rolINEN
                onEntendido={(id) => atenderAlerta(p.id, id)}
                onNotificarCuidador={p.cuidador ? onNotificarCuidador : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Historial de rutas diagnósticas */}
      <div>
        <div className="flex items-center justify-between">
          <SectionTitle sub={`${p.rutasDiagnosticas.length} ruta(s) registrada(s) para esta paciente.`}>
            Historial de rutas diagnósticas
          </SectionTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className="chip text-xs bg-black/5 text-tinta/60 hover:bg-black/10 transition"
            >
              <Icon name={mostrarHistorial ? 'left' : 'right'} size={13} />
              {mostrarHistorial ? 'Ocultar' : 'Ver historial'}
            </button>
            <button
              onClick={() => setMostrarFormNuevaRuta(true)}
              className="chip text-xs bg-marca-50 text-marca-700 hover:bg-marca-100 transition"
            >
              <Icon name="plus" size={13} /> Crear nueva ruta
            </button>
          </div>
        </div>

        {/* Resumen rápido (siempre visible) */}
        <div className="space-y-2">
          {p.rutasDiagnosticas.map((r) => {
            const esActiva = r.id === p.rutaActivaId
            return (
              <div
                key={r.id}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border text-sm ${
                  esActiva
                    ? 'border-marca-200 bg-marca-50/60'
                    : 'border-black/8 bg-black/[0.02]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-semibold text-tinta ac-ink truncate">{r.codigo}</span>
                  <span className="text-tinta/50">·</span>
                  <span className="text-tinta/65 truncate">{r.tipoIngreso}</span>
                  <span className="text-tinta/50">·</span>
                  <span className="text-tinta/65">{r.tipoSospecha}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`chip text-xs ${
                      r.estadoRuta === 'Activa'
                        ? 'bg-marca-50 text-marca-700'
                        : r.estadoRuta === 'Finalizada'
                          ? 'bg-exito/12 text-exito'
                          : 'bg-precaucion/15 text-[#9a7400]'
                    }`}
                  >
                    {r.estadoRuta}
                  </span>
                  {esActiva && (
                    <span className="chip text-xs bg-marca-500 text-white">Activa</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Historial detallado (expandible) */}
        {mostrarHistorial && (
          <div className="mt-4 animate-fade-up">
            <HistorialRutas
              paciente={p}
              onMarcarActiva={onMarcarActiva}
            />
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Cuidador */}
        <Card>
          <SectionTitle>Cuidador</SectionTitle>
          {p.cuidador ? (
            <div className="flex items-start gap-3">
              <span className="grid place-items-center w-10 h-10 rounded-2xl bg-exito/12 text-exito shrink-0">
                <Icon name="users" size={20} />
              </span>
              <div>
                <p className="font-semibold text-tinta ac-ink">{p.cuidador.nombre}</p>
                <p className="text-sm text-tinta/60 ac-muted">
                  {p.cuidador.parentesco} · {p.cuidador.telefono}
                </p>
                <span
                  className={`chip text-xs mt-1 ${
                    p.cuidador.estado === 'activo'
                      ? 'bg-exito/12 text-exito'
                      : 'bg-precaucion/15 text-[#9a7400]'
                  }`}
                >
                  {p.cuidador.estado === 'activo' ? 'Activo' : 'Pendiente'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-tinta/60 ac-muted inline-flex items-center gap-2">
              <Icon name="alert" size={16} className="text-precaucion" /> Sin cuidador
              registrado. Considerar apoyo adicional.
            </p>
          )}
        </Card>

        {/* Registrar acción */}
        <Card>
          <SectionTitle>Registrar acción</SectionTitle>
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {(
                ['Llamada', 'Orientación', 'Recordatorio', 'Coordinación', 'Actualización'] as const
              ).map((t) => {
                const ic: Record<string, IconName> = {
                  Llamada: 'phone',
                  Orientación: 'chat',
                  Recordatorio: 'bell',
                  Coordinación: 'users',
                  Actualización: 'check',
                }
                return (
                  <button
                    key={t}
                    onClick={() => setTipoAccion(t)}
                    className={`chip text-xs transition ${
                      tipoAccion === t ? 'bg-marca-500 text-white' : 'bg-black/5 text-tinta/60'
                    }`}
                  >
                    <Icon name={ic[t]} size={13} /> {t}
                  </button>
                )
              })}
            </div>
            <textarea
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Detalle de la gestión realizada…"
              rows={2}
              className="w-full bg-white border border-black/10 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-marca-200 text-sm resize-none"
            />
            <button onClick={onRegistrar} className="btn-secundario text-sm w-full">
              <Icon name="plus" size={16} /> Guardar en historial
            </button>
          </div>
        </Card>
      </div>

      {/* Historial de acciones */}
      <Card>
        <SectionTitle sub="Bitácora de gestiones de navegación.">
          Historial de acciones
        </SectionTitle>
        {p.acciones.length ? (
          <ol className="relative border-l-2 border-marca-100 ml-1 space-y-4">
            {p.acciones.map((a) => (
              <li key={a.id} className="ml-4 relative">
                <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-marca-400 ring-4 ring-white" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="chip text-xs bg-marca-50 text-marca-700">{a.tipo}</span>
                  <span className="text-xs text-tinta/45 ac-muted">
                    {a.fecha} · {a.autor}
                  </span>
                </div>
                <p className="text-sm text-tinta/75 ac-muted mt-1">{a.detalle}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-tinta/55">Aún no hay gestiones registradas.</p>
        )}
      </Card>
    </div>
  )
}
