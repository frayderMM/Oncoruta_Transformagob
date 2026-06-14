import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Paciente, Rol, NotificacionDemo, AccionINEN, RutaDiagnostica, Sospecha, TipoIngreso } from '../types'
import { PACIENTES, PACIENTE_DEMO_ID, crearRutaInicial } from '../data/pacientes'

// ===================================================================
// AppContext = sesión + navegación + "API" simulada en memoria.
// ===================================================================

export type Pantalla =
  | 'login'
  | 'registro'
  | 'home'
  | 'ruta'
  | 'historial'
  | 'citas'
  | 'documentos'
  | 'alertas'
  | 'cuidador'
  | 'asistente'
  | 'accesibilidad'
  | 'panel'
  | 'detalle'
  | 'admin'

interface Sesion {
  rol: Rol
  nombre: string
  pacienteId?: string
}

export interface CrearRutaParams {
  tipoIngreso: TipoIngreso
  tipoSospecha: Sospecha
  motivoIngreso: string
  fechaInicio: string
}

interface AppState {
  sesion: Sesion | null
  pantalla: Pantalla
  pacienteSeleccionadoId: string | null
  pacientes: Paciente[]
  notificaciones: NotificacionDemo[]

  iniciarSesion: (rol: Rol) => void
  cerrarSesion: () => void
  ir: (p: Pantalla) => void
  seleccionarPaciente: (id: string) => void

  pacienteActivo: () => Paciente | undefined
  getPaciente: (id: string) => Paciente | undefined
  getRutaActiva: (pacienteId: string) => RutaDiagnostica | undefined

  // Acciones (API simulada) — operan sobre la ruta activa
  confirmarCita: (pacienteId: string, citaId: string) => void
  atenderAlerta: (pacienteId: string, alertaId: string) => void
  registrarAccion: (pacienteId: string, accion: Omit<AccionINEN, 'id' | 'fecha'>) => void
  marcarDocumento: (pacienteId: string, docId: string) => void
  registrarCuidador: (
    pacienteId: string,
    cuidador: { nombre: string; parentesco: string; telefono: string },
  ) => void
  enviarNotificacion: (n: Omit<NotificacionDemo, 'id' | 'hora'>) => void
  descartarNotificacion: (id: string) => void

  // Gestión de rutas diagnósticas
  crearRutaDiagnostica: (pacienteId: string, params: CrearRutaParams) => void
  marcarRutaActiva: (pacienteId: string, rutaId: string) => void
}

const Ctx = createContext<AppState | null>(null)

const PANTALLA_INICIAL: Record<Rol, Pantalla> = {
  paciente: 'home',
  cuidador: 'cuidador',
  inen: 'panel',
  admin: 'admin',
}

const NOMBRE_ROL: Record<Rol, string> = {
  paciente: 'María Quispe',
  cuidador: 'Ana Quispe',
  inen: 'L. Ríos (Navegadora)',
  admin: 'Admin INEN',
}

function ahora(): string {
  const d = new Date()
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

// Sincroniza los campos legacy del paciente desde la ruta indicada
function syncLegacyDesdeRuta(p: Paciente, ruta: RutaDiagnostica): Paciente {
  return {
    ...p,
    tipoSospecha: ruta.tipoSospecha,
    etapaActual: ruta.etapaActual,
    diasSinAvance: ruta.diasSinAvance,
    proximoPaso: ruta.proximoPaso,
    ruta: ruta.etapas,
    documentos: ruta.documentos,
    citas: ruta.citas,
    alertas: ruta.alertas,
    acciones: ruta.acciones,
    citaPerdida: ruta.citas.some((c) => c.estado === 'Perdida'),
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [pantalla, setPantalla] = useState<Pantalla>('login')
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<string | null>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>(() =>
    JSON.parse(JSON.stringify(PACIENTES)),
  )
  const [notificaciones, setNotificaciones] = useState<NotificacionDemo[]>([])

  const iniciarSesion = useCallback((rol: Rol) => {
    setSesion({
      rol,
      nombre: NOMBRE_ROL[rol],
      pacienteId: rol === 'paciente' || rol === 'cuidador' ? PACIENTE_DEMO_ID : undefined,
    })
    setPantalla(PANTALLA_INICIAL[rol])
  }, [])

  const cerrarSesion = useCallback(() => {
    setSesion(null)
    setPantalla('login')
    setPacienteSeleccionadoId(null)
  }, [])

  const ir = useCallback((p: Pantalla) => setPantalla(p), [])

  const seleccionarPaciente = useCallback((id: string) => {
    setPacienteSeleccionadoId(id)
    setPantalla('detalle')
  }, [])

  const getPaciente = useCallback(
    (id: string) => pacientes.find((p) => p.id === id),
    [pacientes],
  )

  const pacienteActivo = useCallback(() => {
    if (!sesion?.pacienteId) return undefined
    return pacientes.find((p) => p.id === sesion.pacienteId)
  }, [sesion, pacientes])

  const getRutaActiva = useCallback(
    (pacienteId: string): RutaDiagnostica | undefined => {
      const p = pacientes.find((p) => p.id === pacienteId)
      if (!p) return undefined
      return p.rutasDiagnosticas.find((r) => r.id === p.rutaActivaId)
    },
    [pacientes],
  )

  // ---------- Mutaciones ----------
  // update: aplica fn sobre el paciente Y sincroniza la ruta activa en rutasDiagnosticas
  const update = (id: string, fn: (p: Paciente) => Paciente) =>
    setPacientes((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const updated = fn(p)
        // Sync cambios legacy de vuelta a rutasDiagnosticas[rutaActivaId]
        const syncedRutas = updated.rutasDiagnosticas.map((r) =>
          r.id === updated.rutaActivaId
            ? {
                ...r,
                citas: updated.citas,
                alertas: updated.alertas,
                documentos: updated.documentos,
                acciones: updated.acciones,
                etapaActual: updated.etapaActual,
                diasSinAvance: updated.diasSinAvance,
                proximoPaso: updated.proximoPaso,
                etapas: updated.ruta,
              }
            : r,
        )
        return { ...updated, rutasDiagnosticas: syncedRutas }
      }),
    )

  const confirmarCita = useCallback((pacienteId: string, citaId: string) => {
    update(pacienteId, (p) => ({
      ...p,
      citas: p.citas.map((c) =>
        c.id === citaId ? { ...c, estado: 'Confirmada' as const } : c,
      ),
    }))
  }, [])

  const atenderAlerta = useCallback((pacienteId: string, alertaId: string) => {
    update(pacienteId, (p) => ({
      ...p,
      alertas: p.alertas.map((a) =>
        a.id === alertaId ? { ...a, estado: 'Atendida' as const } : a,
      ),
    }))
  }, [])

  const registrarAccion = useCallback(
    (pacienteId: string, accion: Omit<AccionINEN, 'id' | 'fecha'>) => {
      update(pacienteId, (p) => ({
        ...p,
        acciones: [
          {
            ...accion,
            id: 'ac-' + Math.random().toString(36).slice(2, 8),
            fecha: new Date().toLocaleDateString('es-PE'),
          },
          ...p.acciones,
        ],
      }))
    },
    [],
  )

  const marcarDocumento = useCallback((pacienteId: string, docId: string) => {
    update(pacienteId, (p) => ({
      ...p,
      documentos: p.documentos.map((d) =>
        d.id === docId
          ? { ...d, estado: 'Recibido' as const, observacion: 'Marcado como listo.' }
          : d,
      ),
    }))
  }, [])

  const registrarCuidador = useCallback(
    (pacienteId: string, c: { nombre: string; parentesco: string; telefono: string }) => {
      update(pacienteId, (p) => ({
        ...p,
        cuidador: { ...c, estado: 'activo', recibeAlertas: true },
      }))
    },
    [],
  )

  const enviarNotificacion = useCallback(
    (n: Omit<NotificacionDemo, 'id' | 'hora'>) => {
      const noti: NotificacionDemo = {
        ...n,
        id: 'noti-' + Math.random().toString(36).slice(2, 8),
        hora: ahora(),
      }
      setNotificaciones((prev) => [noti, ...prev])
    },
    [],
  )

  const descartarNotificacion = useCallback((id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // ---------- Gestión de rutas diagnósticas ----------

  const crearRutaDiagnostica = useCallback(
    (pacienteId: string, params: CrearRutaParams) => {
      setPacientes((prev) =>
        prev.map((p) => {
          if (p.id !== pacienteId) return p
          const nuevaId = 'ruta-' + Date.now().toString(36)
          const year = new Date().getFullYear()
          const seq = String(Math.floor(Math.random() * 900) + 100)
          const nuevoCodigo = `Ruta ${year}-${seq}`
          const nuevaRuta = crearRutaInicial({
            id: nuevaId,
            codigo: nuevoCodigo,
            ...params,
          })
          const rutasActualizadas = p.rutasDiagnosticas.map((r) =>
            r.id === p.rutaActivaId && r.estadoRuta === 'Activa'
              ? { ...r, estadoRuta: 'Pausada' as const }
              : r,
          )
          const updatedPaciente: Paciente = {
            ...p,
            rutasDiagnosticas: [...rutasActualizadas, nuevaRuta],
            rutaActivaId: nuevaId,
          }
          return syncLegacyDesdeRuta(updatedPaciente, nuevaRuta)
        }),
      )
    },
    [],
  )

  const marcarRutaActiva = useCallback((pacienteId: string, rutaId: string) => {
    setPacientes((prev) =>
      prev.map((p) => {
        if (p.id !== pacienteId) return p
        const ruta = p.rutasDiagnosticas.find((r) => r.id === rutaId)
        if (!ruta) return p
        const updatedPaciente: Paciente = { ...p, rutaActivaId: rutaId }
        return syncLegacyDesdeRuta(updatedPaciente, ruta)
      }),
    )
  }, [])

  return (
    <Ctx.Provider
      value={{
        sesion,
        pantalla,
        pacienteSeleccionadoId,
        pacientes,
        notificaciones,
        iniciarSesion,
        cerrarSesion,
        ir,
        seleccionarPaciente,
        pacienteActivo,
        getPaciente,
        getRutaActiva,
        confirmarCita,
        atenderAlerta,
        registrarAccion,
        marcarDocumento,
        registrarCuidador,
        enviarNotificacion,
        descartarNotificacion,
        crearRutaDiagnostica,
        marcarRutaActiva,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
