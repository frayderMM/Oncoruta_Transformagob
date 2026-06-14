import { useApp } from '../context/AppContext'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'
import { evaluarRiesgo, MENSAJE_PACIENTE, ETAPA_META } from '../lib/semaforo'
import { Card, SectionTitle, BotonAudio, AvisoSeguridad } from '../components/ui/Primitivos'
import EstadoAvance from '../components/EstadoAvance'
import Icon from '../components/ui/Icon'

export default function PacienteHome() {
  const { pacienteActivo, ir } = useApp()
  const { idioma, lenguajeSimple } = useAccesibilidad()
  const p = pacienteActivo()
  if (!p) return null

  const ev = evaluarRiesgo(p)
  const proximaCita = p.citas.find((c) => c.estado === 'Programada' || c.estado === 'Confirmada')
  const docsPendientes = p.documentos.filter(
    (d) => d.estado === 'Pendiente' || d.estado === 'Observado',
  )
  const alertasAbiertas = p.alertas.filter((a) => a.estado === 'Nueva' || a.estado === 'Vista')
  const etapaMeta = ETAPA_META[p.ruta.find((e) => e.nombre === p.etapaActual)?.estado ?? 'En proceso']
  const etapaDesc = p.ruta.find((e) => e.nombre === p.etapaActual)?.descripcionSimple ?? ''

  const textoResumen = `${tr('saludo', idioma)} ${p.nombres}. ${tr('tu_etapa', idioma)}: ${p.etapaActual}. ${tr('tu_proximo_paso', idioma)}: ${p.proximoPaso}`

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Saludo + estado general */}
      <div className="rounded-3xl bg-inen-v text-white p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-12 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-1/3 -top-8 w-40 h-40 rounded-full bg-marca-300/20 blur-2xl" />
        <div className="relative">
          <p className="text-white/80">{tr('saludo', idioma)},</p>
          <h1 className="font-display text-3xl font-extrabold">{p.nombres} {p.apellidos.split(' ')[0]}</h1>
          <p className="mt-2 text-white/90 leading-relaxed max-w-lg">{MENSAJE_PACIENTE[ev.nivel]}</p>
          <div className="mt-3">
            <BotonAudio texto={textoResumen} />
          </div>
        </div>
      </div>

      {/* Etapa actual */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-tinta/55 ac-muted">{tr('tu_etapa', idioma)}</p>
            <h2 className="font-display text-2xl font-bold text-tinta ac-ink mt-0.5">{p.etapaActual}</h2>
          </div>
          <span className={`chip ${etapaMeta.clase}`}>{p.ruta.find((e) => e.nombre === p.etapaActual)?.estado}</span>
        </div>
        {lenguajeSimple && etapaDesc && (
          <p className="text-tinta/70 ac-muted mt-2 leading-relaxed">{etapaDesc}</p>
        )}
        <button onClick={() => ir('ruta')} className="btn-suave mt-3 text-sm">
          <Icon name="ruta" size={16} /> {tr('mi_ruta', idioma)}
        </button>
      </Card>

      {/* Próximo paso destacado */}
      <Card className="border border-marca-200 bg-marca-50/60">
        <div className="flex items-start gap-3">
          <span className="grid place-items-center w-11 h-11 rounded-2xl bg-inen-btn text-white shrink-0">
            <Icon name="flag" size={22} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-marca-700">{tr('tu_proximo_paso', idioma)}</p>
            <p className="text-tinta ac-ink mt-0.5 leading-relaxed font-medium">{p.proximoPaso}</p>
            <div className="mt-2">
              <BotonAudio texto={p.proximoPaso} />
            </div>
          </div>
        </div>
      </Card>

      {/* Grilla de accesos */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Próxima cita */}
        <Card onClick={() => ir('citas')}>
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
            </div>
          ) : (
            <p className="text-sm text-tinta/60 ac-muted mt-2">
              No tienes una cita programada. El INEN te avisará.
            </p>
          )}
        </Card>

        {/* Documentos pendientes */}
        <Card onClick={() => ir('documentos')}>
          <div className="flex items-center gap-2 text-marca-600">
            <Icon name="doc" size={20} />
            <span className="font-semibold">{tr('docs_pendientes', idioma)}</span>
          </div>
          {docsPendientes.length > 0 ? (
            <div className="mt-2">
              <p className="font-display text-2xl font-extrabold text-precaucion">{docsPendientes.length}</p>
              <p className="text-sm text-tinta/65 ac-muted">{docsPendientes[0].nombre} y otros por entregar.</p>
            </div>
          ) : (
            <p className="text-sm text-exito mt-2 font-medium inline-flex items-center gap-1.5">
              <Icon name="check" size={16} /> Todos tus documentos están listos.
            </p>
          )}
        </Card>
      </div>

      {/* Alertas */}
      {alertasAbiertas.length > 0 && (
        <Card onClick={() => ir('alertas')} className="border-l-4 border-riesgo/50">
          <div className="flex items-start gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-riesgo/12 text-riesgo shrink-0">
              <Icon name="bell" size={20} />
            </span>
            <div>
              <p className="font-semibold text-tinta ac-ink">
                Tienes {alertasAbiertas.length} {alertasAbiertas.length === 1 ? 'aviso' : 'avisos'} por revisar
              </p>
              <p className="text-sm text-tinta/65 ac-muted mt-0.5">{alertasAbiertas[0].mensaje}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Estado de avance (operativo, no clínico) */}
      <div>
        <SectionTitle sub="Indica si tu proceso avanza a buen ritmo. No habla de tu salud.">
          ¿Cómo va tu proceso?
        </SectionTitle>
        <EstadoAvance nivel={ev.nivel} motivos={ev.motivos} size="lg" />
      </div>

      <AvisoSeguridad />
    </div>
  )
}
