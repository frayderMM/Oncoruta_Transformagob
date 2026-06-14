import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import Icon from '../components/ui/Icon'

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

// Puntos internos del campus INEN Sede Central (coords verificadas Google Maps + usuario)
const PUNTOS_INEN = [
  {
    id: 'puerta-principal',
    label: 'Puerta Principal',
    detalle: 'Ingreso por Torre de atención ambulatoria de cáncer',
    lat: -12.1132879,
    lng: -76.9996326,
    emoji: '🚪',
    color: '#2E7D32',
    imagen: null,
  },
  {
    id: 'puerta-2',
    label: 'Puerta 2',
    detalle: 'Ingreso de urgencias y emergencias — lado oeste del campus',
    lat: -12.1119228,
    lng: -76.9991849,
    emoji: '🚨',
    color: '#C62828',
    imagen: null,
  },
  {
    id: 'puerta-4',
    label: 'Puerta 4',
    detalle: 'Ingreso secundario — lado este del campus',
    lat: -12.1118063,
    lng: -76.9976246,
    emoji: '🚶',
    color: '#5D4037',
    imagen: null,
  },
  {
    id: 'admision',
    label: 'Módulo de Admisión',
    detalle: 'Tramita tu admisión y apertura de Historia Clínica',
    lat: -12.113164,
    lng: -76.999619,
    emoji: '🏥',
    color: '#E91E63',
    imagen: '/INEN/TorreAdmision.png',
  },
  {
    id: 'citas',
    label: 'Módulo de Citas',
    detalle: 'Programa y confirma tus citas médicas aquí',
    lat: -12.112396,
    lng: -76.998969,
    emoji: '📅',
    color: '#1565C0',
    imagen: '/INEN/cita.png',
  },
] as const

type PuntoINEN = (typeof PUNTOS_INEN)[number]

// ──────────────────────────────────────────────
// Guía paso a paso — Proceso de Admisión INEN
// ──────────────────────────────────────────────
const PASOS_ADMISION = [
  {
    icon: '🚪',
    titulo: 'Ingresa al INEN',
    fase: 'Llegada',
    desc: 'Entra por el Ingreso Principal (Av. Angamos Este 2520). El personal de vigilancia te orientará hacia el área de admisión en el primer piso.',
  },
  {
    icon: '🎫',
    titulo: 'Obtén tu ticket',
    fase: 'Paso 1 — Ticket',
    desc: 'Dirígete a la ventanilla central de "Ticket de Admisión" (al centro del pabellón). Recibirás un número de turno para ser atendido.',
  },
  {
    icon: '🪑',
    titulo: 'Sala de espera — Admisión',
    fase: 'Espera',
    desc: 'Siéntate en la "Sala de Espera Admisión" (zona central-superior). Escucha el llamado de tu número en el sistema de turnos o pantallas.',
  },
  {
    icon: '📄',
    titulo: 'Presenta tus documentos',
    fase: 'Paso 2 — Documentos clínicos',
    desc: 'Cuando te llamen, acércate a los "Módulos de Admisión". Presenta: DNI, informe médico externo, biopsia u otros exámenes solicitados.',
  },
  {
    icon: '🔍',
    titulo: 'Revisión de documentos',
    fase: 'Paso 3 — Revisión',
    desc: 'El personal verifica y valida tu documentación. Confirman que cumples los requisitos para apertura de Historia Clínica en el INEN.',
  },
  {
    icon: '📋',
    titulo: 'Generación de Historia Clínica',
    fase: 'Paso 4 — Apertura HC',
    desc: 'Se crea tu Historia Clínica (HC) en el sistema del INEN. Guarda el número de HC: lo necesitarás en todas tus visitas futuras.',
  },
  {
    icon: '🚶',
    titulo: 'Ve al módulo de citas',
    fase: 'Paso 5 — Traslado',
    desc: 'Con tu HC generada, el personal te indica el módulo de programación de cita (área de módulos en el ala izquierda del pabellón).',
  },
  {
    icon: '📁',
    titulo: 'Entrega documentación física',
    fase: 'Paso 6 — Documentos físicos',
    desc: 'Entrega la copia física de tus documentos clínicos en el módulo de citas. Quedan adjuntos a tu Historia Clínica en el sistema.',
  },
  {
    icon: '✅',
    titulo: '¡Cita programada!',
    fase: 'Fin del proceso',
    desc: 'El personal programa tu primera cita médica. Recibirás fecha, hora y consultorio. ¡Ya quedas registrada en el sistema INEN!',
  },
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

function puntoIcon(emoji: string, color: string) {
  return L.divIcon({
    html: `<div style="
      width:38px;height:38px;
      background:${color};
      border-radius:50%;
      border:3px solid #fff;
      box-shadow:0 3px 10px rgba(0,0,0,.4);
      display:flex;align-items:center;justify-content:center;
      font-size:18px;line-height:1;
    ">${emoji}</div>`,
    className: '',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
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
// Pantalla principal
// ──────────────────────────────────────────────
export default function SedesINEN() {
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

  const vistaInterna = campusSede !== null

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
      <h2 className="font-display text-lg font-bold text-tinta">Sedes INEN</h2>

      {/* Mapa */}
      <div className="relative rounded-2xl overflow-hidden border border-black/10" style={{ height: 504 }}>

        <button
          onClick={obtenerUbicacion}
          disabled={loadingLoc}
          className="absolute top-2 right-2 z-[1000] inline-flex items-center gap-1.5 bg-white text-marca-700 border border-marca-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-suave hover:bg-marca-50 transition disabled:opacity-60"
        >
          <Icon name="pin" size={13} />
          {loadingLoc ? 'Obteniendo…' : 'Mi ubicación'}
        </button>

        {campusSede && (
          <button
            onClick={salirCampus}
            className="absolute top-2 left-2 z-[1000] inline-flex items-center gap-1.5 bg-white text-tinta border border-black/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-suave hover:bg-black/5 transition"
          >
            <Icon name="left" size={13} /> Perú
          </button>
        )}

        {locError && (
          <div className="absolute bottom-10 left-2 right-2 z-[1000] bg-white/95 border border-riesgo/30 text-riesgo text-xs rounded-lg px-2.5 py-1.5">
            {locError}
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
              <Popup><strong>Tu ubicación</strong></Popup>
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
              eventHandlers={{ click: () => seleccionar(s) }}
            >
              <Popup>
                <div style={{ minWidth: 170 }}>
                  <p style={{ fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.nombre}</p>
                  <p style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{s.direccion}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => seleccionar(s)}
                      style={{ background: s.color, color: '#fff', border: 'none', borderRadius: 7, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                    >
                      Ver ruta
                    </button>
                    <button
                      onClick={() => entrarCampus(s)}
                      style={{ background: '#fff', color: s.color, border: `1.5px solid ${s.color}`, borderRadius: 7, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                    >
                      Ver campus
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {campusSede && campusSede.id !== 'lima' && (
            <Marker position={[campusSede.lat, campusSede.lng]} icon={sedeIcon(campusSede.color, true)}>
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <p style={{ fontWeight: 700, color: campusSede.color, marginBottom: 2 }}>{campusSede.nombre}</p>
                  <p style={{ fontSize: 12, color: '#666' }}>{campusSede.direccion}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {campusSede?.id === 'lima' && PUNTOS_INEN.filter(p => !(p.id === 'puerta-principal' && route)).map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={puntoIcon(p.emoji, p.color)}
              eventHandlers={{ click: () => p.imagen ? setModalPunto(p) : undefined }}
            >
              {!p.imagen && (
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <p style={{ fontWeight: 700, color: p.color, marginBottom: 2 }}>{p.label}</p>
                    <p style={{ fontSize: 12, color: '#555' }}>{p.detalle}</p>
                  </div>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
      </div>

      {seleccionada && (
        <div
          className="rounded-xl border-l-4 px-3 py-2.5 flex items-center gap-3"
          style={{ borderLeftColor: seleccionada.color, background: seleccionada.color + '0d' }}
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-tinta truncate">{seleccionada.nombre}</p>
            <p className="text-xs text-tinta/55 truncate">{seleccionada.direccion}</p>
          </div>
          {loadingRoute && <p className="text-xs text-marca-600 animate-pulse shrink-0">Calculando…</p>}
          {route && !loadingRoute && (
            <div className="flex gap-3 shrink-0 text-xs font-semibold text-tinta/70">
              <span className="flex items-center gap-1"><Icon name="clock" size={13} className="text-marca-600" />{formatDur(route.durationMin)}</span>
              <span className="flex items-center gap-1"><Icon name="ruta" size={13} className="text-marca-600" />{route.distanceKm} km</span>
            </div>
          )}
          <button
            onClick={() => entrarCampus(seleccionada)}
            className="shrink-0 text-xs font-semibold text-marca-600 border border-marca-200 rounded-lg px-2 py-1 hover:bg-marca-50 transition"
          >
            Campus →
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
          {SEDES.map((s) => (
            <button
              key={s.id}
              onClick={() => seleccionar(s)}
              className={`text-left rounded-xl p-3 border-l-4 bg-white transition hover:shadow-suave ${
                seleccionada?.id === s.id ? 'ring-2' : 'border border-black/5'
              }`}
              style={{ borderLeftColor: s.color, ...(seleccionada?.id === s.id ? { outlineColor: s.color } : {}) }}
            >
              <p className="font-bold text-xs leading-tight" style={{ color: s.color }}>{s.nombre}</p>
              <p className="text-[10px] text-tinta/45 uppercase tracking-wide mt-0.5">{s.region}</p>
              {nearest?.id === s.id && userPos && (
                <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-px rounded-full text-white" style={{ background: s.color }}>
                  ★ Más cercana
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
    </div>
  )
}
