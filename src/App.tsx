import { useApp } from './context/AppContext'
import AppShell from './components/layout/AppShell'

import Login from './screens/Login'
import Registro from './screens/Registro'
import PacienteHome from './screens/PacienteHome'
import MiRuta from './screens/MiRuta'
import MisCitas from './screens/MisCitas'
import Documentos from './screens/Documentos'
import Alertas from './screens/Alertas'
import ModoCuidador from './screens/ModoCuidador'
import CuidadorHome from './screens/CuidadorHome'
import PanelINEN from './screens/PanelINEN'
import DetallePaciente from './screens/DetallePaciente'
import Accesibilidad from './screens/Accesibilidad'
import AdminPanel from './screens/AdminPanel'
import HistorialClinico from './screens/HistorialClinico'

import SedesINEN from './screens/SedesINEN'
import ChatIANoClinico from './components/ChatIANoClinico'
import { SectionTitle, AvisoSeguridad } from './components/ui/Primitivos'

function AsistenteScreen() {
  const { pacienteActivo } = useApp()
  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle sub="Te orienta sobre tu proceso: citas, documentos y pasos. No da diagnósticos ni tratamientos.">
        Asistente de orientación
      </SectionTitle>
      <div className="tarjeta overflow-hidden h-[70vh]">
        <ChatIANoClinico paciente={pacienteActivo()} embebido />
      </div>
      <AvisoSeguridad compacto />
    </div>
  )
}

export default function App() {
  const { sesion, pantalla } = useApp()

  // Sin sesión: solo login / registro
  if (!sesion) {
    return pantalla === 'registro' ? <Registro /> : <Login />
  }

  let contenido: JSX.Element

  switch (pantalla) {
    // Paciente
    case 'home':
      contenido = sesion.rol === 'cuidador' ? <CuidadorHome /> : <PacienteHome />
      break
    case 'ruta':
      contenido = <MiRuta />
      break
    case 'historial':
      contenido = <HistorialClinico />
      break
    case 'citas':
      contenido = <MisCitas />
      break
    case 'documentos':
      contenido = <Documentos />
      break
    case 'alertas':
      contenido = <Alertas />
      break
    case 'sedes':
      contenido = <SedesINEN />
      break
    case 'asistente':
      contenido = <AsistenteScreen />
      break
    case 'accesibilidad':
      contenido = <Accesibilidad />
      break
    // Cuidador
    case 'cuidador':
      contenido = sesion.rol === 'cuidador' ? <CuidadorHome /> : <ModoCuidador />
      break
    // INEN
    case 'panel':
      contenido = <PanelINEN />
      break
    case 'detalle':
      contenido = <DetallePaciente />
      break
    // Admin
    case 'admin':
      contenido = <AdminPanel />
      break
    default:
      contenido = sesion.rol === 'inen' ? <PanelINEN /> : sesion.rol === 'admin' ? <AdminPanel /> : <PacienteHome />
  }

  return <AppShell>{contenido}</AppShell>
}
