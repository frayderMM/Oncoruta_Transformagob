import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Paciente, Rol, NotificacionDemo, AccionINEN } from '../types'
import { PACIENTES, PACIENTE_DEMO_ID } from '../data/pacientes'

// ===================================================================
// AppContext = sesión + navegación + "API" simulada en memoria.
// Todas las mutaciones (confirmar cita, atender alerta, registrar
// acción, etc.) actualizan el estado para que la demo sea interactiva.
// ===================================================================

export type Pantalla =
  | 'login'
  | 'registro'
  | 'home'
  | 'ruta'
  | 'citas'
  | 'documentos'
  | 'alertas'
  | 'cuidador'
  | 'asistente'
  | 'accesibilidad'
  | 'sedes'
  // INEN
  | 'panel'
  | 'detalle'
  // Admin
  | 'admin'

interface Sesion {
  rol: Rol
  nombre: string
  pacienteId?: string // paciente asociada (paciente o cuidador)
}

interface AppState {
  sesion: Sesion | null
  pantalla: Pantalla
  pacienteSeleccionadoId: string | null // para el detalle INEN
  pacientes: Paciente[]
  notificaciones: NotificacionDemo[]

  iniciarSesion: (rol: Rol) => void
  cerrarSesion: () => void
  ir: (p: Pantalla) => void
  seleccionarPaciente: (id: string) => void

  pacienteActivo: () => Paciente | undefined
  getPaciente: (id: string) => Paciente | undefined

  // Acciones (API simulada)
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

  // ---------- Mutaciones ----------
  const update = (id: string, fn: (p: Paciente) => Paciente) =>
    setPacientes((prev) => prev.map((p) => (p.id === id ? fn(p) : p)))

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
        d.id === docId ? { ...d, estado: 'Recibido' as const, observacion: 'Marcado como listo.' } : d,
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
        confirmarCita,
        atenderAlerta,
        registrarAccion,
        marcarDocumento,
        registrarCuidador,
        enviarNotificacion,
        descartarNotificacion,
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
