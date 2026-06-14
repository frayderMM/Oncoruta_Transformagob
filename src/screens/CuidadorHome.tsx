import { useApp } from '../context/AppContext'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'
import { evaluarRiesgo, MENSAJE_PACIENTE } from '../lib/semaforo'
import { Card, SectionTitle, BotonAudio, AvisoSeguridad } from '../components/ui/Primitivos'
import RutaTimeline from '../components/RutaTimeline'
import EstadoAvance from '../components/EstadoAvance'
import Icon from '../components/ui/Icon'

export default function CuidadorHome() {
  const { pacienteActivo, enviarNotificacion } = useApp()
  const { idioma } = useAccesibilidad()
  const p = pacienteActivo()
  if (!p) return null

  const ev = evaluarRiesgo(p)
  const rutaActiva = p.rutasDiagnosticas.find((r) => r.id === p.rutaActivaId)
  const proximaCita = p.citas.find((c) => c.estado === 'Programada' || c.estado === 'Confirmada')
  const docsPendientes = p.documentos.filter(
    (d) => d.estado === 'Pendiente' || d.estado === 'Observado',
  )
  const alertasAbiertas = p.alertas.filter((a) => a.estado === 'Nueva' || a.estado === 'Vista')
  const rutasAnteriores = p.rutasDiagnosticas.filter(
    (r) => r.id !== p.rutaActivaId && r.estadoRuta === 'Finalizada',
  )

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Encabezado de acompañamiento */}
      <div className="rounded-3xl bg-gradient-to-br from-rosa-500 to-marca-500 text-white p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-12 w-52 h-52 rounded-full bg-white/15 blur-2xl" />
        <div className="relative">
          <p className="text-white/85 inline-flex items-center gap-2">
            <Icon name="users" size={18} /> Estás acompañando a
          </p>
          <h1 className="font-display text-3xl font-extrabold">
            {p.nombres} {p.apellidos.split(' ')[0]}
          </h1>
          {rutaActiva && (
            <p className="text-white/80 text-sm mt-1">
              {rutaActiva.codigo} · {rutaActiva.tipoSospecha} · {rutaActiva.etapaActual}
            </p>
          )}
          <p className="mt-2 text-white/90 leading-relaxed max-w-lg">
            {MENSAJE_PACIENTE[ev.nivel]}
          </p>
        </div>
      </div>

      {/* Estado de avance */}
      <div>
        <SectionTitle sub="Indica si el proceso avanza a buen ritmo. No habla de su salud.">
          ¿Cómo va su proceso?
        </SectionTitle>
        <EstadoAvance nivel={ev.nivel} motivos={ev.motivos} size="lg" />
      </div>

      {/* Próximo paso + audio */}
      <Card className="border-2 border-marca-200 bg-marca-50/40">
        <div className="flex items-start gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-2xl bg-marca-500 text-white shrink-0">
            <Icon name="flag" size={20} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-marca-700">Cómo puedes ayudar ahora</p>
            <p className="text-tinta ac-ink mt-0.5 font-medium leading-relaxed">
              {p.proximoPaso}
            </p>
            <div className="mt-2">
              <BotonAudio
                texto={`${p.nombres} está en la etapa ${p.etapaActual}. ${p.proximoPaso}`}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Próxima cita + documentos */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 text-marca-600">
            <Icon name="calendar" size={20} />
            <span className="font-semibold">{tr('proxima_cita', idioma)}</span>
          </div>
          {proximaCita ? (
            <div className="mt-2">
              <p className="font-display font-bold text-tinta ac-ink">{proximaCita.servicio}</p>
              <p className="text-sm text-tinta/65 ac-muted mt-0.5">
                {proximaCita.fecha} · {proximaCita.hora}
              </p>
              <p className="text-sm text-tinta/65 ac-muted">{proximaCita.lugar}</p>
              <button
                onClick={() =>
                  enviarNotificacion({
                    canal: 'SMS',
                    titulo: 'Recordatorio para ti',
                    cuerpo: `Recuerda acompañar a ${p.nombres} a ${proximaCita.servicio} el ${proximaCita.fecha} a las ${proximaCita.hora}.`,
                  })
                }
                className="btn-suave text-sm mt-3"
              >
                <Icon name="bell" size={15} /> Recordarme
              </button>
            </div>
          ) : (
            <p className="text-sm text-tinta/60 ac-muted mt-2">Sin cita programada por ahora.</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-marca-600">
            <Icon name="doc" size={20} />
            <span className="font-semibold">{tr('docs_pendientes', idioma)}</span>
          </div>
          {docsPendientes.length ? (
            <ul className="mt-2 space-y-1.5 text-sm text-tinta/70 ac-muted">
              {docsPendientes.map((d) => (
                <li key={d.id} className="flex items-start gap-2">
                  <Icon name="alert" size={15} className="text-precaucion mt-0.5 shrink-0" />{' '}
                  {d.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-exito mt-2 inline-flex items-center gap-1.5 font-medium">
              <Icon name="check" size={16} /> Documentos al día.
            </p>
          )}
        </Card>
      </div>

      {/* Alertas */}
      {alertasAbiertas.length > 0 && (
        <Card className="border-l-4 border-riesgo/50">
          <div className="flex items-start gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-riesgo/12 text-riesgo shrink-0">
              <Icon name="bell" size={20} />
            </span>
            <div>
              <p className="font-semibold text-tinta ac-ink">Avisos importantes</p>
              {alertasAbiertas.map((a) => (
                <p key={a.id} className="text-sm text-tinta/65 ac-muted mt-1">
                  {a.mensaje}
                </p>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Ruta resumida */}
      <div>
        <SectionTitle>Su ruta, en resumen</SectionTitle>
        <Card>
          <RutaTimeline ruta={p.ruta} etapaActual={p.etapaActual} compacto />
        </Card>
      </div>

      {/* Rutas anteriores (solo resumen) */}
      {rutasAnteriores.length > 0 && (
        <div>
          <SectionTitle sub="Procesos anteriores completados.">Rutas anteriores</SectionTitle>
          <div className="space-y-2">
            {rutasAnteriores.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border border-black/8 bg-black/[0.02] text-sm"
              >
                <div>
                  <p className="font-semibold text-tinta ac-ink">{r.codigo}</p>
                  <p className="text-xs text-tinta/55 ac-muted mt-0.5">
                    {r.tipoIngreso} · {r.tipoSospecha}
                    {r.fechaCierre ? ` · Cerrada: ${r.fechaCierre}` : ''}
                  </p>
                </div>
                <span className="chip text-xs bg-exito/12 text-exito">{r.estadoRuta}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AvisoSeguridad />
    </div>
  )
}
