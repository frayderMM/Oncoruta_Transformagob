import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import Icon from '../components/ui/Icon'
import { useAccesibilidad } from '../context/AccesibilidadContext'
import { tr } from '../data/i18n'

// ──────────────────────────────────────────────
// Sedes INEN
// ──────────────────────────────────────────────
const SEDES = [
  {
    id: 'lima',
    nombre: 'INEN – Sede Central',
    ciudad: 'Lima',
    region: 'Lima',
    direccion: 'Av. Angamos Este 2520, Surquillo',
    lat: -12.1132879,
    lng: -76.9996326,
    color: '#E91E63',
  },
  {
    id: 'norte',
    nombre: 'IREN Norte',
    ciudad: 'Trujillo',
    region: 'La Libertad',
    direccion: 'Av. Panamericana Norte Km 558, Moche – Trujillo',
    lat: -8.1342334,
    lng: -79.0201836,
    color: '#1565C0',
  },
  {
    id: 'centro',
    nombre: 'IREN Centro',
    ciudad: 'Concepción',
    region: 'Junín',
    direccion: 'Jr. Concepción N° 755, Concepción',
    lat: -11.9050401,
    lng: -75.3257445,
    color: '#2E7D32',
  },
  {
    id: 'sur',
    nombre: 'IREN Sur',
    ciudad: 'Arequipa',
    region: 'Arequipa',
    direccion: 'Av. La Salud S/N, Cercado – Arequipa',
    lat: -16.4143011,
    lng: -71.530239,
    color: '#E65100',
  },
] as const

type Sede = (typeof SEDES)[number]

interface RouteInfo {
  coords: [number, number][]
  durationMin: number
  distanceKm: number
}



const PERU_BOUNDS: [[number, number], [number, number]] = [[-19.0, -82.0], [0.5, -68.0]]

interface PuntoINEN {
  id: string
  label: string
  detalle: string
  lat: number
  lng: number
  emoji: string
  color: string
  imagen: string | null
  edificio?: string
  piso?: string
  tags?: string[]
  rutaInterna?: string
}

const PUNTOS_INEN: PuntoINEN[] = [
  {
    id: 'puerta-principal',
    label: 'Puerta Principal',
    detalle: 'Ingreso por Torre de atención ambulatoria de cáncer',
    lat: -12.1132879, lng: -76.9996326,
    emoji: '🚪', color: '#2E7D32', imagen: null,
    edificio: 'Torre Ambulatoria', piso: 'Planta baja',
    tags: ['entrada', 'ingreso', 'puerta'],
  },
  {
    id: 'puerta-2',
    label: 'Puerta 2 — Urgencias',
    detalle: 'Ingreso de urgencias y emergencias — lado oeste del campus',
    lat: -12.1119228, lng: -76.9991849,
    emoji: '🚨', color: '#C62828', imagen: null,
    edificio: 'Bloque de Urgencias', piso: 'Planta baja',
    tags: ['emergencia', 'urgencias', 'puerta'],
  },
  {
    id: 'puerta-4',
    label: 'Puerta 4',
    detalle: 'Ingreso secundario — lado este del campus',
    lat: -12.1118063, lng: -76.9976246,
    emoji: '🚶', color: '#5D4037', imagen: null,
    edificio: 'Acceso Este', piso: 'Planta baja',
    tags: ['entrada', 'puerta'],
  },
  {
    id: 'admision',
    label: 'Módulo de Admisión',
    detalle: 'Tramita tu admisión y apertura de Historia Clínica',
    lat: -12.113164, lng: -76.999619,
    emoji: '🏥', color: '#E91E63', imagen: '/INEN/TorreAdmision.png',
    edificio: 'Torre Ambulatoria', piso: '1.er piso',
    tags: ['admisión', 'historia clínica', 'registro'],
  },
  {
    id: 'citas',
    label: 'Módulo de Citas',
    detalle: 'Programa y confirma tus citas médicas aquí',
    lat: -12.112396, lng: -76.998969,
    emoji: '📅', color: '#1565C0', imagen: '/INEN/cita.png',
    edificio: 'Torre Ambulatoria', piso: '1.er piso',
    tags: ['cita', 'programación', 'turno'],
  },
  {
    id: 'laboratorio',
    label: 'Laboratorio INEN',
    detalle: 'Análisis clínicos y toma de muestras',
    lat: -12.1121384, lng: -76.9997352,
    emoji: '🧪', color: '#7B1FA2', imagen: null,
    edificio: 'Bloque de Diagnóstico', piso: '1.er piso',
    tags: ['laboratorio', 'análisis', 'muestras', 'sangre'],
  },
  {
    id: 'auditorio',
    label: 'Auditorio INEN',
    detalle: 'Salón de eventos, charlas y capacitaciones',
    lat: -12.1119839, lng: -76.9981222,
    emoji: '🎭', color: '#455A64', imagen: null,
    edificio: 'Edificio Central', piso: '1.er piso',
    tags: ['auditorio', 'eventos', 'charlas'],
  },
  {
    id: 'investigacion',
    label: 'Centro de Investigación en Cáncer',
    detalle: 'Investigación y estudios oncológicos',
    lat: -12.1126084, lng: -76.9995904,
    emoji: '🔬', color: '#00695C', imagen: null,
    edificio: 'Bloque de Investigación', piso: '2.do piso',
    tags: ['investigación', 'ciencia', 'oncología'],
  },
  {
    id: 'radioterapia',
    label: 'Radioterapia INEN',
    detalle: 'Tratamiento con radiación para tumores',
    lat: -12.1129165, lng: -76.9987368,
    emoji: '☢️', color: '#E65100', imagen: null,
    edificio: 'Bloque de Radioterapia', piso: 'Sótano / 1.er piso',
    tags: ['radioterapia', 'radiación', 'tratamiento'],
  },
  {
    id: 'radiodiagnostico',
    label: 'Radiodiagnóstico INEN',
    detalle: 'Diagnóstico por imágenes de rayos X',
    lat: -12.1128467, lng: -76.9986422,
    emoji: '🩻', color: '#1565C0', imagen: null,
    edificio: 'Bloque de Imágenes', piso: '1.er piso',
    tags: ['rayos x', 'radiodiagnóstico', 'imágenes'],
  },
  {
    id: 'ecografia',
    label: 'Ecografía INEN (Puerta 60)',
    detalle: 'Ecografías y diagnóstico por ultrasonido',
    lat: -12.1127178, lng: -76.9985001,
    emoji: '🔊', color: '#0277BD', imagen: null,
    edificio: 'Bloque de Imágenes', piso: '1.er piso',
    tags: ['ecografía', 'ultrasonido', 'imágenes'],
  },
  {
    id: 'radiologia-oncologica',
    label: 'Radiología Oncológica INEN',
    detalle: 'Estudios de imagen especializados en oncología',
    lat: -12.1123614, lng: -76.9983382,
    emoji: '📡', color: '#283593', imagen: null,
    edificio: 'Bloque de Imágenes', piso: '2.do piso',
    tags: ['radiología', 'oncología', 'imágenes', 'tomografía'],
  },
  {
    id: 'trabajo-social',
    label: 'Trabajo Social INEN (Puerta 11-C)',
    detalle: 'Apoyo social, orientación y gestión de beneficios para pacientes',
    lat: -12.1124314, lng: -76.998626,
    emoji: '🤝', color: '#6A1B9A', imagen: null,
    edificio: 'Bloque Administrativo', piso: '1.er piso',
    tags: ['trabajo social', 'apoyo', 'SIS', 'beneficios', 'orientación'],
  },
  {
    id: 'mamografia',
    label: 'Mamografía INEN',
    detalle: 'Estudio de imagen para detección de cáncer de mama — Piso 3',
    lat: -12.1127178, lng: -76.9985001,
    emoji: '🩺', color: '#D81B60', imagen: null,
    edificio: 'Bloque de Imágenes', piso: '3.er piso',
    tags: ['mamografía', 'mama', 'imagen', 'detección', 'cáncer de mama', 'placa'],
    rutaInterna: '/INEN/referencia.png',
  },
]

// ──────────────────────────────────────────────
// Guía paso a paso — Proceso de Admisión INEN
// ──────────────────────────────────────────────
// x%, y% = posición del paso sobre la imagen del plano interno
const PASOS_ADMISION = [
  { num: 1, x: 55, y: 88, color: '#4CAF50', titulo: 'Ingresa al INEN',               fase: 'Llegada',                      desc: 'Entra por el Ingreso Principal (Av. Angamos Este 2520). El personal te orientará hacia el área de admisión.' },
  { num: 2, x: 50, y: 57, color: '#7C3AED', titulo: 'Obtención de ticket',            fase: 'Ingreso al INEN — Ticket',     desc: 'Ve a la ventanilla central "Ticket de Admisión". Recibirás un número de turno para ser atendido.' },
  { num: 3, x: 40, y: 20, color: '#7C3AED', titulo: 'Sala de espera Admisión',        fase: 'Ticket — Atención en módulo',  desc: 'Siéntate en la Sala de Espera Admisión (zona central-superior) y espera el llamado de tu número.' },
  { num: 4, x: 62, y: 28, color: '#7C3AED', titulo: 'Presentación de documentos',     fase: 'Ticket — Atención en módulo',  desc: 'Cuando te llamen acércate al Módulo de Admisión. Presenta: DNI, informe médico externo, biopsia u otros exámenes.' },
  { num: 5, x: 67, y: 28, color: '#7C3AED', titulo: 'Revisión de documentos',         fase: 'Ticket — Atención en módulo',  desc: 'El personal verifica y valida tu documentación para confirmar la apertura de Historia Clínica.' },
  { num: 6, x: 80, y: 27, color: '#7C3AED', titulo: 'Generación de Historia Clínica', fase: 'Módulo admisión — Apertura HC', desc: 'Se crea tu Historia Clínica (HC) en el sistema INEN. Guarda el número de HC para todas tus visitas.' },
  { num: 7, x: 42, y: 42, color: '#7C3AED', titulo: 'Traslado al módulo de citas',    fase: 'Apertura HC — Programación',   desc: 'Con tu HC generada el personal te indica el módulo de citas (ala izquierda, área Módulos). Dirígete ahí.' },
  { num: 8, x: 38, y: 35, color: '#1565C0', titulo: 'Entrega documentación física',   fase: 'En módulo de Citas',           desc: 'Ya en el módulo de citas, entrega la copia física de tu DNI, informes y exámenes. El personal los adjuntará a tu Historia Clínica y programará tu primera cita.' },
  { num: 9, x: 8,  y: 8,  color: '#E91E63', titulo: '¡Cita programada!',              fase: 'Fin del proceso',              desc: 'Tu primera cita médica queda programada. Recibirás fecha, hora y consultorio. ¡Ya quedas en el sistema!' },
] as const

// ──────────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const rad = (x: number) => (x * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDur(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h} h ${m} min` : `${h} h`
}

// ──────────────────────────────────────────────
// Íconos Leaflet
// ──────────────────────────────────────────────
function sedeIcon(color: string, nearest: boolean) {
  const w = nearest ? 11 : 9
  const h = nearest ? 15 : 12
  return L.divIcon({
    html: `<div style="width:${w}px;height:${h}px;position:relative;">
      <div style="
        width:${w}px;height:${w}px;
        background:${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:2.5px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,.4);
        position:absolute;top:0;left:0;
      "></div>
      <div style="
        width:${w * 0.36}px;height:${w * 0.36}px;
        background:#fff;
        border-radius:50%;
        opacity:0.7;
        position:absolute;
        top:${w * 0.18}px;left:${w * 0.18}px;
      "></div>
    </div>`,
    className: '',
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h],
  })
}

function puntoIcon(emoji: string, color: string, resaltado = false) {
  const size = resaltado ? 52 : 38
  const animStyle = resaltado
    ? `animation:bounce-pin .6s infinite alternate;`
    : ''
  const ring = resaltado
    ? `box-shadow:0 0 0 6px ${color}44,0 4px 16px rgba(0,0,0,.55);`
    : 'box-shadow:0 3px 10px rgba(0,0,0,.4);'
  return L.divIcon({
    html: `
      <style>
        @keyframes bounce-pin {
          0%   { transform: translateY(0) scale(1); }
          100% { transform: translateY(-8px) scale(1.12); }
        }
      </style>
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:50%;
        border:3px solid #fff;
        ${ring}
        display:flex;align-items:center;justify-content:center;
        font-size:${resaltado ? 26 : 18}px;line-height:1;
        ${animStyle}
      ">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

function userIcon() {
  return L.divIcon({
    html: `<div style="
      width:22px;height:22px;
      background:#3B82F6;
      border-radius:50%;
      border:3px solid #fff;
      box-shadow:0 0 0 7px rgba(59,130,246,.22);
    "></div>`,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

// ──────────────────────────────────────────────
// Controlador de mapa (flyTo / fitBounds)
// ──────────────────────────────────────────────
type MapCmd =
  | { type: 'fly'; center: [number, number]; zoom: number }
  | { type: 'bounds'; sw: [number, number]; ne: [number, number] }

function MapController({ cmd, trigger }: { cmd: MapCmd; trigger: number }) {
  const map = useMap()
  useEffect(() => {
    if (!trigger) return
    if (cmd.type === 'fly') {
      map.flyTo(cmd.center, cmd.zoom, { duration: 1.5 })
    } else {
      map.fitBounds([cmd.sw, cmd.ne], { padding: [70, 70], maxZoom: 11, animate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])
  return null
}


function BoundsManager({ enCampus }: { enCampus: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (enCampus) {
      map.setMaxBounds(undefined as unknown as L.LatLngBoundsExpression)
      map.setMinZoom(3)
    } else {
      map.setMaxBounds(PERU_BOUNDS)
      map.setMinZoom(5)
    }
  }, [enCampus, map])
  return null
}

// ──────────────────────────────────────────────
// QR Scanner modal — simulación demo
// ──────────────────────────────────────────────
const QR_DEMO_PUNTOS = ['mamografia', 'laboratorio', 'radioterapia', 'citas', 'admision']

function QRScannerModal({
  onResult,
  onClose,
}: {
  onResult: (id: string) => void
  onClose: () => void
}) {
  const [fase, setFase] = useState<'scanning' | 'detected'>('scanning')
  const [detectedId, setDetectedId] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      const id = QR_DEMO_PUNTOS[Math.floor(Math.random() * QR_DEMO_PUNTOS.length)]
      setDetectedId(id)
      setFase('detected')
    }, 2200)
    return () => clearTimeout(t)
  }, [])

  const punto = PUNTOS_INEN.find(p => p.id === detectedId)

  return (
    <div className="fixed inset-0 z-[3000] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <p className="text-white font-bold text-sm">📷 Escanear QR de piso</p>
        <button onClick={onClose} className="grid place-items-center w-9 h-9 rounded-xl bg-white/10 text-white hover:bg-white/20">
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-900">
        {fase === 'scanning' ? (
          <div className="flex flex-col items-center gap-6">
            {/* Mira animada */}
            <div className="w-56 h-56 relative">
              {(['top-0 left-0 border-t-4 border-l-4','top-0 right-0 border-t-4 border-r-4','bottom-0 left-0 border-b-4 border-l-4','bottom-0 right-0 border-b-4 border-r-4'] as const).map((cls, i) => (
                <div key={i} className={`absolute w-10 h-10 ${cls} border-marca-400 rounded-sm`} />
              ))}
              {/* Línea de escaneo animada */}
              <div className="absolute inset-x-0 h-0.5 bg-marca-400 opacity-80"
                style={{ animation: 'scan-line 1.4s linear infinite', top: '50%' }} />
              {/* QR placeholder */}
              <div className="absolute inset-8 grid grid-cols-3 gap-1 opacity-20">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-sm" />
                ))}
              </div>
            </div>
            <p className="text-white/60 text-sm">Escaneando código QR…</p>
            <style>{`@keyframes scan-line { 0%{top:10%} 50%{top:90%} 100%{top:10%} }`}</style>
          </div>
        ) : (
          <div className="text-center px-8 space-y-5 animate-fade-up">
            <div className="text-5xl">{punto?.emoji ?? '✅'}</div>
            <div>
              <p className="text-green-400 font-bold text-sm uppercase tracking-widest mb-1">QR detectado</p>
              <p className="text-white font-extrabold text-xl">{punto?.label}</p>
              {punto?.edificio && (
                <p className="text-white/50 text-sm mt-1">🏢 {punto.edificio} · {punto.piso}</p>
              )}
            </div>
            <div className="space-y-2 w-full">
              <button
                onClick={() => { onResult(detectedId); onClose() }}
                className="w-full btn-primario py-3 text-sm"
              >
                Ver en el mapa
              </button>
              {punto?.rutaInterna && (
                <button
                  onClick={() => { onResult(detectedId); onClose() }}
                  className="w-full py-3 text-sm font-bold text-white rounded-xl border border-white/20 hover:bg-white/10 transition"
                >
                  🗺️ Ver ruta interna
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Pantalla principal
// ──────────────────────────────────────────────
export default function SedesINEN({ hideTitle }: { hideTitle?: boolean } = {}) {
  const { idioma } = useAccesibilidad()
  const [userPos, setUserPos] = useState<[number, number] | null>(null)
  const [locError, setLocError] = useState<string | null>(null)
  const [loadingLoc, setLoadingLoc] = useState(false)
  const [nearest, setNearest] = useState<Sede | null>(null)
  const [seleccionada, setSeleccionada] = useState<Sede | null>(null)
  const [route, setRoute] = useState<RouteInfo | null>(null)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [mapCmd, setMapCmd] = useState<MapCmd>({ type: 'fly', center: [-9.5, -75.0], zoom: 5 })
  const [mapTrigger, setMapTrigger] = useState(0)
  const [campusSede, setCampusSede] = useState<Sede | null>(null)
  const [modalPunto, setModalPunto] = useState<PuntoINEN | null>(null)
  const [modalGuia, setModalGuia] = useState(false)
  const [pasoActual, setPasoActual] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [puntoResaltado, setPuntoResaltado] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const [rutaImagenModal, setRutaImagenModal] = useState<PuntoINEN | null>(null)
  const [qrScanner, setQrScanner] = useState(false)
  const [puntoInfo, setPuntoInfo] = useState<PuntoINEN | null>(null)

  const vistaInterna = campusSede !== null

  useEffect(() => {
    if (busqueda.trim().length >= 2 && searchRef.current) {
      const r = searchRef.current.getBoundingClientRect()
      setDropPos({ top: r.bottom + 2, left: r.left, width: r.width })
    }
  }, [busqueda])

  const resultadosBusqueda = busqueda.trim().length >= 2
    ? PUNTOS_INEN.filter(p => {
        const q = busqueda.toLowerCase()
        return p.label.toLowerCase().includes(q) ||
          p.detalle.toLowerCase().includes(q) ||
          (p.tags ?? []).some(t => t.includes(q))
      })
    : []

  const irAPunto = (p: PuntoINEN) => {
    setBusqueda('')
    setPuntoInfo(p)
    setPuntoResaltado(p.id)
    if (!campusSede) {
      const lima = SEDES.find(s => s.id === 'lima')!
      setCampusSede(lima)
    }
    fly([p.lat, p.lng], 20)
    setTimeout(() => setPuntoResaltado(null), 4000)
  }

  const manejarQR = (data: string) => {
    const id = data.trim().toLowerCase()
    const punto = PUNTOS_INEN.find(p =>
      p.id === id ||
      p.id === data.trim() ||
      p.label.toLowerCase().includes(id)
    )
    if (punto) {
      irAPunto(punto)
      if (punto.rutaInterna) setRutaImagenModal(punto)
    }
  }

  const fly = (center: [number, number], zoom: number) => {
    setMapCmd({ type: 'fly', center, zoom })
    setMapTrigger((k) => k + 1)
  }

  const entrarCampus = (sede: Sede) => {
    setCampusSede(sede)
    const center: [number, number] = sede.id === 'lima' ? [-12.1125, -76.9984] : [sede.lat, sede.lng]
    fly(center, sede.id === 'lima' ? 19 : 17)
  }

  const salirCampus = () => {
    setCampusSede(null)
    fly([-9.5, -75.0], 5)
  }

  const fitRoute = (routeCoords: [number, number][]) => {
    const lats = routeCoords.map((c) => c[0])
    const lngs = routeCoords.map((c) => c[1])
    setMapCmd({
      type: 'bounds',
      sw: [Math.min(...lats), Math.min(...lngs)],
      ne: [Math.max(...lats), Math.max(...lngs)],
    })
    setMapTrigger((k) => k + 1)
  }

  const obtenerRuta = async (sede: Sede, pos: [number, number]) => {
    setLoadingRoute(true)
    setRoute(null)
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${pos[1]},${pos[0]};${sede.lng},${sede.lat}?overview=full&geometries=geojson`
      const res = await fetch(url)
      const data = await res.json()
      if (data.routes?.[0]) {
        const r = data.routes[0]
        const coords: [number, number][] = (r.geometry.coordinates as [number, number][]).map(
          ([lng, lat]) => [lat, lng],
        )
        setRoute({
          coords,
          durationMin: Math.round(r.duration / 60),
          distanceKm: Math.round(r.distance / 100) / 10,
        })
        fitRoute(coords)
      }
    } catch {
      // fallo silencioso
    } finally {
      setLoadingRoute(false)
    }
  }

  const seleccionar = (sede: Sede, pos?: [number, number]) => {
    const p = pos ?? userPos
    setSeleccionada(sede)
    if (p) {
      obtenerRuta(sede, p)
    } else {
      setRoute(null)
      fly([sede.lat, sede.lng], 11)
    }
  }

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setLocError('Tu navegador no permite acceso a la ubicación.')
      return
    }
    setLoadingLoc(true)
    setLocError(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: [number, number] = [coords.latitude, coords.longitude]
        setUserPos(pos)
        setLoadingLoc(false)

        // Zoom cercano a la ubicación del usuario
        fly(pos, 13)

        // Sede más cercana
        let minDist = Infinity
        let nearSede: Sede = SEDES[0]
        for (const s of SEDES) {
          const d = haversineKm(pos[0], pos[1], s.lat, s.lng)
          if (d < minDist) { minDist = d; nearSede = s }
        }
        setNearest(nearSede)

        // Pequeño delay para que el flyTo termine antes de cambiar al fitBounds
        setTimeout(() => seleccionar(nearSede, pos), 1800)
      },
      () => {
        setLoadingLoc(false)
        setLocError('No se pudo obtener la ubicación. Selecciona una sede manualmente.')
      },
      { timeout: 10000 },
    )
  }

  return (
    <div className="space-y-3 animate-fade-up">
      {!hideTitle && <h2 className="font-display text-lg font-bold text-tinta">{tr('sedes_titulo', idioma)}</h2>}

      {/* ── Barra de búsqueda + QR — FUERA del mapa ── */}
      <div className="flex gap-2">
        <div className="flex-1 relative" ref={searchRef}>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar área, servicio o piso en el INEN…"
            className="w-full bg-white border border-black/15 rounded-2xl px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-marca-300 placeholder:text-tinta/35"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-tinta/40 hover:text-tinta">
              <Icon name="close" size={15} />
            </button>
          )}
        </div>
        <button
          onClick={() => setQrScanner(true)}
          className="shrink-0 inline-flex items-center gap-2 bg-white border border-black/10 rounded-2xl px-4 py-3 text-sm font-semibold text-tinta/70 shadow-sm hover:bg-black/5 transition"
        >
          <span className="text-base leading-none">⬛</span>
          <span className="hidden sm:inline">Escanear QR</span>
        </button>
      </div>

      {/* Resultados de búsqueda — portal en body para escapar transforms/overflow */}
      {resultadosBusqueda.length > 0 && createPortal(
        <div
          className="bg-white rounded-xl shadow-xl border border-black/10 overflow-hidden"
          style={{ position: 'fixed', zIndex: 99999, top: dropPos.top, left: dropPos.left, width: dropPos.width }}
        >
          {resultadosBusqueda.map(p => (
            <button
              key={p.id}
              onMouseDown={e => e.preventDefault()}
              onClick={() => irAPunto(p)}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2 border-b border-black/5 last:border-0 hover:bg-marca-50 transition"
            >
              <svg className="shrink-0 text-tinta/30" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span className="text-sm text-tinta/80 truncate">{p.label.replace(/\s*INEN\s*/g, '').trim()}</span>
              <span className="ml-auto shrink-0 text-base leading-none">{p.emoji}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
      {busqueda.trim().length >= 2 && resultadosBusqueda.length === 0 && createPortal(
        <div
          className="bg-white rounded-xl shadow-lg border border-black/10 px-3 py-2 text-sm text-tinta/45"
          style={{ position: 'fixed', zIndex: 99999, top: dropPos.top, left: dropPos.left, width: dropPos.width }}
        >
          Sin resultados para &ldquo;{busqueda}&rdquo;
        </div>,
        document.body
      )}

      {/* ── Mapa ── */}
      <div
        className="relative rounded-2xl overflow-hidden border border-black/10 h-[500px] md:h-[420px]"
      >
        {/* Controles dentro del mapa: ← Perú + 📍 Mi ubicación */}
        <div className="absolute top-2 left-2 right-2 z-[1000] flex items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto">
            {campusSede && (
              <button
                onClick={salirCampus}
                className="inline-flex items-center gap-1.5 bg-white/95 text-tinta border border-black/10 rounded-xl px-3 py-2 text-xs font-semibold shadow-suave hover:bg-white transition"
              >
                <Icon name="left" size={13} /> {tr('volver_peru', idioma)}
              </button>
            )}
          </div>
          <button
            onClick={obtenerUbicacion}
            disabled={loadingLoc}
            className="pointer-events-auto inline-flex items-center gap-1.5 bg-white/95 text-marca-700 border border-marca-200 rounded-xl px-3 py-2 text-xs font-semibold shadow-suave hover:bg-white transition disabled:opacity-60"
          >
            <Icon name="pin" size={13} />
            {loadingLoc ? tr('obteniendo', idioma) : tr('mi_ubicacion', idioma)}
          </button>
        </div>

        {locError && (
          <div className="absolute bottom-10 left-2 right-2 z-[1000] bg-white/95 border border-riesgo/30 text-riesgo text-xs rounded-xl px-3 py-2">
            {tr('loc_error', idioma)}
          </div>
        )}

        <MapContainer
          center={[-9.5, -75.0]}
          zoom={5}
          minZoom={5}
          maxZoom={21}
          zoomSnap={0.1}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='Tiles &copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={19}
            maxZoom={21}
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={19}
            maxZoom={21}
            opacity={0.8}
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={19}
            maxZoom={21}
            opacity={0.9}
          />
          <MapController cmd={mapCmd} trigger={mapTrigger} />
          <BoundsManager enCampus={vistaInterna} />


          {userPos && (
            <Marker position={userPos} icon={userIcon()}>
              <Popup><strong>{tr('tu_ubicacion', idioma)}</strong></Popup>
            </Marker>
          )}

          {route && seleccionada && (
            <Polyline
              positions={route.coords}
              pathOptions={{ color: seleccionada.color, weight: 5, opacity: 0.82, dashArray: '10,6' }}
            />
          )}

          {SEDES.map((s) => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={sedeIcon(s.color, nearest?.id === s.id)}
              eventHandlers={{ click: () => entrarCampus(s) }}
            >
              <Popup>
                <p style={{ fontWeight: 700, color: s.color, margin: 0, fontSize: 13 }}>{s.nombre}</p>
                <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{s.ciudad}</p>
              </Popup>
            </Marker>
          ))}

          {campusSede && campusSede.id !== 'lima' && (
            <Marker position={[campusSede.lat, campusSede.lng]} icon={sedeIcon(campusSede.color, true)}>
              <Popup>
                <p style={{ fontWeight: 700, color: campusSede.color, margin: 0, fontSize: 13 }}>{campusSede.nombre}</p>
                <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{campusSede.ciudad}</p>
              </Popup>
            </Marker>
          )}

          {campusSede?.id === 'lima' && PUNTOS_INEN.map((p) => {
            const resaltado = puntoResaltado === p.id
            return (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={puntoIcon(p.emoji, p.color, resaltado)}
                eventHandlers={{ click: () => {
                  irAPunto(p)
                  if (p.id === 'admision') { setModalGuia(true); setPasoActual(0) }
                }}}
              >
                <Popup>
                  <p style={{ fontWeight: 700, color: p.color, margin: 0, fontSize: 13 }}>
                    {p.emoji} {p.label.replace(/\s*INEN\s*/g, '').trim()}
                  </p>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Tarjeta de resultado de búsqueda / QR */}
      {puntoInfo && (
        <div
          className="rounded-2xl border-l-4 px-4 py-3 animate-fade-up"
          style={{ borderLeftColor: puntoInfo.color, background: puntoInfo.color + '12' }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0 mt-0.5">{puntoInfo.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-tinta leading-tight">{puntoInfo.label}</p>
              <p className="text-xs text-tinta/55 mt-0.5 leading-relaxed">{puntoInfo.detalle}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {puntoInfo.edificio && (
                  <span className="inline-flex items-center gap-1 text-xs text-tinta/60 bg-black/5 rounded-full px-2 py-0.5">
                    🏢 {puntoInfo.edificio}
                  </span>
                )}
                {puntoInfo.piso && (
                  <span className="inline-flex items-center gap-1 text-xs text-tinta/60 bg-black/5 rounded-full px-2 py-0.5">
                    🔢 {puntoInfo.piso}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setPuntoInfo(null)}
              className="shrink-0 grid place-items-center w-7 h-7 rounded-full bg-black/5 text-tinta/40 hover:bg-black/10 hover:text-tinta/70 transition"
            >
              <Icon name="close" size={13} />
            </button>
          </div>
          {puntoInfo.rutaInterna && (
            <button
              onClick={() => setRutaImagenModal(puntoInfo)}
              className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-bold text-white rounded-xl py-2.5 transition active:scale-95"
              style={{ background: puntoInfo.color }}
            >
              🗺️ Ver ruta interna al piso
            </button>
          )}
        </div>
      )}

      {/* Ruta calculada (solo cuando hay userPos) */}
      {route && seleccionada && !loadingRoute && (
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-black/8 px-4 py-2.5 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seleccionada.color }} />
          <p className="text-xs font-semibold text-tinta flex-1 truncate">{seleccionada.nombre}</p>
          <span className="flex items-center gap-1 text-xs font-bold text-tinta/70">
            <Icon name="clock" size={12} className="text-marca-600" />{formatDur(route.durationMin)}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-tinta/70">
            <Icon name="ruta" size={12} className="text-marca-600" />{route.distanceKm} km
          </span>
        </div>
      )}
      {loadingRoute && (
        <p className="text-xs text-marca-600 animate-pulse text-center">{tr('calculando', idioma)}</p>
      )}

      {/* Sedes — tap = entrar al campus directamente */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SEDES.map((s) => (
          <button
            key={s.id}
            onClick={() => entrarCampus(s)}
            className={`text-left rounded-2xl p-3 border-l-4 bg-white transition active:scale-[.97] hover:shadow-suave ${
              campusSede?.id === s.id ? 'ring-2 shadow-suave' : 'border border-black/5'
            }`}
            style={{ borderLeftColor: s.color, ...(campusSede?.id === s.id ? { ringColor: s.color } : {}) }}
          >
            <p className="font-bold text-xs leading-tight" style={{ color: s.color }}>{s.nombre}</p>
            <p className="text-[10px] text-tinta/45 uppercase tracking-wide mt-0.5">{s.ciudad}</p>
            {nearest?.id === s.id && userPos && (
              <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-px rounded-full text-white" style={{ background: s.color }}>
                {tr('mas_cercana', idioma)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Modal imagen de referencia */}
      {modalPunto && modalPunto.imagen && (
        <div
          className="fixed inset-0 z-[2000] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setModalPunto(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{modalPunto.emoji}</span>
                <div>
                  <p className="font-bold text-sm text-tinta">{modalPunto.label}</p>
                  <p className="text-xs text-tinta/55">INEN – Sede Central</p>
                </div>
              </div>
              <button
                onClick={() => setModalPunto(null)}
                className="grid place-items-center w-8 h-8 rounded-xl bg-black/5 text-tinta/60 hover:bg-black/10"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <img
              src={modalPunto.imagen}
              alt={modalPunto.label}
              className="w-full object-contain max-h-80"
            />
            <p className="text-xs text-tinta/55 text-center px-4 py-3">{modalPunto.detalle}</p>
          </div>
        </div>
      )}

      {/* Modal guía paso a paso — Admisión INEN */}
      {modalGuia && (
        <div className="fixed inset-0 z-[2000] bg-black/75 flex items-center justify-center p-3" onClick={() => setModalGuia(false)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>

            {/* Cabecera */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/8 bg-marca-50">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-marca-500">Proceso de Admisión INEN</p>
                <p className="font-bold text-sm text-tinta leading-tight">{PASOS_ADMISION[pasoActual].fase}</p>
              </div>
              <button onClick={() => setModalGuia(false)} className="grid place-items-center w-8 h-8 rounded-xl bg-black/8 text-tinta/60 hover:bg-black/15">
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Plano con pasos posicionados */}
            <div className="relative flex-shrink-0" style={{ aspectRatio: '16/7' }}>
              <img src="/INEN/Admision mapa interno.png" alt="Plano interno INEN" className="w-full h-full object-cover" />

              {PASOS_ADMISION.map((paso, i) => {
                const activo = i === pasoActual
                const hecho = i < pasoActual
                const size = activo ? 32 : 20
                return (
                  <button
                    key={paso.num}
                    onClick={() => setPasoActual(i)}
                    style={{
                      position: 'absolute',
                      left: `${paso.x}%`,
                      top: `${paso.y}%`,
                      transform: 'translate(-50%,-50%)',
                      width: size,
                      height: size,
                      borderRadius: '50%',
                      background: hecho ? '#4CAF50' : activo ? paso.color : '#9E9E9E',
                      border: activo ? '3px solid #fff' : '2px solid #fff',
                      boxShadow: activo ? `0 0 0 3px ${paso.color}` : '0 1px 4px rgba(0,0,0,.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: activo ? 13 : 9,
                      fontWeight: 800,
                      zIndex: activo ? 10 : 5,
                      transition: 'all .2s',
                    }}
                  >
                    {hecho ? '✓' : paso.num}
                  </button>
                )
              })}
            </div>

            {/* Descripción del paso actual */}
            <div className="px-4 py-3 flex-1 overflow-y-auto">
              <div className="flex items-start gap-3">
                <div
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-content text-white font-extrabold text-base"
                  style={{ background: PASOS_ADMISION[pasoActual].color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {PASOS_ADMISION[pasoActual].num}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-tinta">{PASOS_ADMISION[pasoActual].titulo}</p>
                  <p className="text-xs text-tinta/65 mt-0.5 leading-relaxed">{PASOS_ADMISION[pasoActual].desc}</p>
                </div>
              </div>
            </div>

            {/* Navegación */}
            <div className="px-4 py-3 border-t border-black/8 flex items-center justify-between gap-2">
              <button
                onClick={() => setPasoActual(p => Math.max(0, p - 1))}
                disabled={pasoActual === 0}
                className="inline-flex items-center gap-1 text-xs font-semibold text-marca-600 border border-marca-200 rounded-lg px-3 py-1.5 hover:bg-marca-50 disabled:opacity-30 transition"
              >
                <Icon name="left" size={12} /> Anterior
              </button>

              {/* Indicadores */}
              <div className="flex gap-1">
                {PASOS_ADMISION.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPasoActual(i)}
                    className="rounded-full transition-all"
                    style={{ width: i === pasoActual ? 18 : 6, height: 6, background: i <= pasoActual ? '#E91E63' : '#D1D5DB' }}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  const esTrasladoCitas = pasoActual === 6
                  if (esTrasladoCitas) {
                    setModalGuia(false)
                    fly([-12.112396, -76.998969], 20)
                  } else if (pasoActual < PASOS_ADMISION.length - 1) {
                    setPasoActual(p => p + 1)
                  } else {
                    setModalGuia(false)
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white rounded-lg px-3 py-1.5 transition"
                style={{ background: pasoActual === 6 ? '#1565C0' : '#E91E63' }}
              >
                {pasoActual === 6 ? '📍 Ver en mapa' : pasoActual < PASOS_ADMISION.length - 1 ? 'Siguiente' : '¡Listo!'}
                <Icon name="right" size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner */}
      {qrScanner && (
        <QRScannerModal
          onResult={manejarQR}
          onClose={() => setQrScanner(false)}
        />
      )}

      {/* Modal ruta interna */}
      {rutaImagenModal?.rutaInterna && (
        <div
          className="fixed inset-0 z-[2500] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setRutaImagenModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl overflow-hidden shadow-2xl"
            style={{ maxHeight: '92dvh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-black/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{rutaImagenModal.emoji}</span>
                <div>
                  <p className="font-extrabold text-base text-tinta">{rutaImagenModal.label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {rutaImagenModal.edificio && (
                      <span className="text-xs bg-marca-50 text-marca-700 font-semibold px-2 py-0.5 rounded-full">🏢 {rutaImagenModal.edificio}</span>
                    )}
                    {rutaImagenModal.piso && (
                      <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">🔢 {rutaImagenModal.piso}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setRutaImagenModal(null)}
                className="grid place-items-center w-9 h-9 rounded-xl bg-black/5 text-tinta/60 hover:bg-black/10 shrink-0"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Label */}
            <div className="px-5 pt-3 pb-1">
              <p className="text-xs font-semibold text-tinta/40 uppercase tracking-wider">Plano de ruta interna</p>
            </div>

            {/* Imagen */}
            <div className="flex-1 overflow-auto px-4 pb-2">
              <img
                src={rutaImagenModal.rutaInterna}
                alt={`Ruta a ${rutaImagenModal.label}`}
                className="w-full rounded-2xl border border-black/5 shadow-sm object-contain"
              />
            </div>

            {/* Pasos rápidos */}
            <div className="px-5 py-3 bg-gray-50 border-t border-black/5">
              <div className="flex items-center gap-3 text-sm text-tinta/70">
                <span className="text-lg">🚶</span>
                <p>Sigue el recorrido señalado en el plano. El destino está marcado con ⭐</p>
              </div>
            </div>

            {/* Acción */}
            <div className="px-5 pb-6 pt-3">
              <button
                onClick={() => setRutaImagenModal(null)}
                className="w-full btn-primario py-3.5 text-sm font-bold rounded-2xl"
              >
                ✓ Entendido, seguiré esta ruta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
