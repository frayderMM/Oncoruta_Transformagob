import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, SectionTitle } from '../components/ui/Primitivos'
import Icon from '../components/ui/Icon'

// ──────────────────────────────────────────────
// Datos de sedes
// ──────────────────────────────────────────────
const SEDES = [
  {
    id: 'lima',
    nombre: 'INEN – Sede Central',
    ciudad: 'Lima',
    region: 'Lima',
    direccion: 'Av. Angamos Este 2520, Surquillo',
    lat: -12.1097,
    lng: -77.0011,
    color: '#E91E63',
  },
  {
    id: 'norte',
    nombre: 'IREN Norte',
    ciudad: 'Trujillo',
    region: 'La Libertad',
    direccion: 'Av. Panamericana Norte Km 558, Moche – Trujillo',
    lat: -8.17,
    lng: -79.015,
    color: '#1565C0',
  },
  {
    id: 'centro',
    nombre: 'IREN Centro',
    ciudad: 'Concepción',
    region: 'Junín',
    direccion: 'Jr. Concepción N° 755, Concepción',
    lat: -11.92,
    lng: -75.31,
    color: '#2E7D32',
  },
  {
    id: 'sur',
    nombre: 'IREN Sur',
    ciudad: 'Arequipa',
    region: 'Arequipa',
    direccion: 'Av. La Salud S/N, Cercado – Arequipa',
    lat: -16.409,
    lng: -71.5375,
    color: '#E65100',
  },
] as const

type Sede = (typeof SEDES)[number]

interface RouteInfo {
  coords: [number, number][]
  durationMin: number
  distanceKm: number
}

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
// Íconos Leaflet (evita bug de img default)
// ──────────────────────────────────────────────
function sedeIcon(color: string, nearest: boolean) {
  const s = nearest ? 38 : 30
  return L.divIcon({
    html: `<div style="
      width:${s}px;height:${s}px;
      background:${color};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid #fff;
      box-shadow:0 3px 10px rgba(0,0,0,.35);
      ${nearest ? `outline:3px solid ${color};outline-offset:3px;` : ''}
    "></div>`,
    className: '',
    iconSize: [s, s],
    iconAnchor: [s / 2, s],
    popupAnchor: [0, -s],
  })
}

function userIcon() {
  return L.divIcon({
    html: `<div style="
      width:20px;height:20px;
      background:#3B82F6;
      border-radius:50%;
      border:3px solid #fff;
      box-shadow:0 0 0 6px rgba(59,130,246,.22);
    "></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// ──────────────────────────────────────────────
// Componente para mover el mapa programáticamente
// ──────────────────────────────────────────────
function MapFly({ center, zoom, trigger }: { center: [number, number]; zoom: number; trigger: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.4 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])
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
  const [flyCenter, setFlyCenter] = useState<[number, number]>([-9.5, -75.0])
  const [flyZoom, setFlyZoom] = useState(5)
  const [flyTrigger, setFlyTrigger] = useState(0)

  const fly = (center: [number, number], zoom: number) => {
    setFlyCenter(center)
    setFlyZoom(zoom)
    setFlyTrigger((k) => k + 1)
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
        setRoute({
          coords: (r.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]),
          durationMin: Math.round(r.duration / 60),
          distanceKm: Math.round(r.distance / 100) / 10,
        })
        fly(
          [(pos[0] + sede.lat) / 2, (pos[1] + sede.lng) / 2],
          Math.max(4, 7 - Math.floor(haversineKm(pos[0], pos[1], sede.lat, sede.lng) / 200)),
        )
      }
    } catch {
      // fallo silencioso – el marcador sigue visible
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
      fly([sede.lat, sede.lng], 10)
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
        // Sede más cercana
        let minDist = Infinity
        let nearSede: Sede = SEDES[0]
        for (const s of SEDES) {
          const d = haversineKm(pos[0], pos[1], s.lat, s.lng)
          if (d < minDist) { minDist = d; nearSede = s }
        }
        setNearest(nearSede)
        fly(pos, 7)
        seleccionar(nearSede, pos)
      },
      () => {
        setLoadingLoc(false)
        setLocError('No se pudo obtener la ubicación. Puedes seleccionar una sede manualmente.')
      },
      { timeout: 10000 },
    )
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <SectionTitle sub="Encuentra la sede INEN más cercana y cómo llegar.">
        Sedes INEN en el Perú
      </SectionTitle>

      {/* Banner ubicación */}
      {!userPos && (
        <div className="rounded-2xl bg-marca-50 border border-marca-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-marca-800 text-sm">¿Cuál sede te queda más cerca?</p>
            <p className="text-sm text-marca-700/80 mt-0.5">
              Compartiendo tu ubicación calculamos la sede más cercana y trazamos la ruta.
            </p>
            {locError && <p className="text-sm text-riesgo mt-1">{locError}</p>}
          </div>
          <button
            onClick={obtenerUbicacion}
            disabled={loadingLoc}
            className="btn-marca shrink-0 inline-flex items-center gap-2"
          >
            <Icon name="pin" size={16} />
            {loadingLoc ? 'Obteniendo…' : 'Mi ubicación'}
          </button>
        </div>
      )}

      {/* Chip sede más cercana */}
      {nearest && userPos && (
        <button
          onClick={() => seleccionar(nearest)}
          className="w-full text-left rounded-2xl p-4 flex items-center gap-3 border-2 transition hover:opacity-90"
          style={{ borderColor: nearest.color, background: nearest.color + '14' }}
        >
          <Icon name="pin" size={22} style={{ color: nearest.color }} />
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: nearest.color }}>
              Sede más cercana a ti
            </p>
            <p className="text-tinta font-semibold">{nearest.nombre}</p>
            <p className="text-sm text-tinta/65">{nearest.ciudad} · {nearest.direccion}</p>
          </div>
          <Icon name="right" size={18} className="text-tinta/30 shrink-0" />
        </button>
      )}

      {/* Mapa */}
      <div className="rounded-3xl overflow-hidden border border-black/10 shadow-suave" style={{ height: 400 }}>
        <MapContainer
          center={[-9.5, -75.0]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFly center={flyCenter} zoom={flyZoom} trigger={flyTrigger} />

          {/* Ubicación del usuario */}
          {userPos && (
            <Marker position={userPos} icon={userIcon()}>
              <Popup>
                <strong>Tu ubicación</strong>
              </Popup>
            </Marker>
          )}

          {/* Ruta trazada */}
          {route && seleccionada && (
            <Polyline
              positions={route.coords}
              pathOptions={{
                color: seleccionada.color,
                weight: 5,
                opacity: 0.8,
                dashArray: '10, 6',
              }}
            />
          )}

          {/* Marcadores de sedes */}
          {SEDES.map((s) => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={sedeIcon(s.color, nearest?.id === s.id)}
              eventHandlers={{ click: () => seleccionar(s) }}
            >
              <Popup>
                <div style={{ minWidth: 190 }}>
                  <p style={{ fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.nombre}</p>
                  <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{s.region}</p>
                  <p style={{ fontSize: 13, marginBottom: 8 }}>{s.direccion}</p>
                  {nearest?.id === s.id && userPos && (
                    <span
                      style={{
                        fontSize: 11, fontWeight: 700,
                        background: s.color + '22', color: s.color,
                        borderRadius: 20, padding: '2px 8px', display: 'inline-block',
                        marginBottom: 6,
                      }}
                    >
                      ★ Más cercana a ti
                    </span>
                  )}
                  <br />
                  <button
                    onClick={() => seleccionar(s)}
                    style={{
                      background: s.color, color: '#fff', border: 'none',
                      borderRadius: 8, padding: '5px 14px', fontSize: 13,
                      cursor: 'pointer', fontWeight: 600, marginTop: 4,
                    }}
                  >
                    Ver ruta
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Detalle de ruta seleccionada */}
      {seleccionada && (
        <div
          className="rounded-2xl border-l-4 p-4 flex items-start gap-3"
          style={{ borderLeftColor: seleccionada.color, background: seleccionada.color + '0d' }}
        >
          <div
            className="grid place-items-center w-11 h-11 rounded-2xl shrink-0 text-white text-xl"
            style={{ background: seleccionada.color }}
          >
            🏥
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-tinta">{seleccionada.nombre}</p>
            <p className="text-sm text-tinta/60">{seleccionada.region} · {seleccionada.direccion}</p>

            {loadingRoute && (
              <p className="text-sm text-marca-600 mt-2 animate-pulse flex items-center gap-1.5">
                <Icon name="ruta" size={15} /> Calculando ruta…
              </p>
            )}

            {route && !loadingRoute && (
              <div className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <Icon name="clock" size={16} className="text-marca-600" />
                  <span className="font-bold">{formatDur(route.durationMin)}</span>
                  <span className="text-tinta/50">en auto</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Icon name="ruta" size={16} className="text-marca-600" />
                  <span className="font-bold">{route.distanceKm} km</span>
                </div>
              </div>
            )}

            {!userPos && !loadingRoute && (
              <button
                onClick={obtenerUbicacion}
                className="mt-2 text-sm text-marca-600 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <Icon name="pin" size={14} /> Compartir ubicación para ver tiempo de llegada
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista de sedes */}
      <SectionTitle>Todas las sedes</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-3">
        {SEDES.map((s) => (
          <button
            key={s.id}
            onClick={() => seleccionar(s)}
            className={`text-left rounded-2xl p-4 border-l-4 bg-white transition hover:shadow-suave hover:scale-[1.01] ${
              seleccionada?.id === s.id ? 'ring-2' : 'border border-black/5'
            }`}
            style={{
              borderLeftColor: s.color,
              ...(seleccionada?.id === s.id ? { outlineColor: s.color } : {}),
            }}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: s.color }}>{s.nombre}</p>
                <p className="text-[11px] uppercase tracking-wide text-tinta/45 font-semibold mt-0.5">{s.region}</p>
                <p className="text-sm text-tinta/70 mt-1 leading-snug">{s.direccion}</p>
                {nearest?.id === s.id && userPos && (
                  <span
                    className="inline-block mt-2 text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: s.color }}
                  >
                    ★ Más cercana a ti
                  </span>
                )}
              </div>
              <Icon name="right" size={17} className="text-tinta/30 mt-0.5 shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
