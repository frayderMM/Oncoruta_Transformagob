import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Idioma } from '../types'

interface AccesibilidadState {
  fontGrande: boolean
  altoContraste: boolean
  lenguajeSimple: boolean
  audio: boolean
  idioma: Idioma
  setFontGrande: (v: boolean) => void
  setAltoContraste: (v: boolean) => void
  setLenguajeSimple: (v: boolean) => void
  setAudio: (v: boolean) => void
  setIdioma: (v: Idioma) => void
  hablar: (texto: string) => void
}

const Ctx = createContext<AccesibilidadState | null>(null)

export function AccesibilidadProvider({ children }: { children: ReactNode }) {
  const [fontGrande, setFontGrande] = useState(false)
  const [altoContraste, setAltoContraste] = useState(false)
  const [lenguajeSimple, setLenguajeSimple] = useState(true)
  const [audio, setAudio] = useState(false)
  const [idioma, setIdioma] = useState<Idioma>('es')

  // Aplica clases globales al <html> según las preferencias
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('fs-grande', fontGrande)
    root.classList.toggle('alto-contraste', altoContraste)
  }, [fontGrande, altoContraste])

  // Lectura por voz simulada/real (Web Speech API si está disponible)
  const hablar = (texto: string) => {
    if (!audio) return
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(texto)
        u.lang = idioma === 'qu' ? 'es-PE' : 'es-PE'
        u.rate = 0.95
        window.speechSynthesis.speak(u)
      }
    } catch {
      /* La demo continúa aunque el navegador no soporte voz */
    }
  }

  return (
    <Ctx.Provider
      value={{
        fontGrande,
        altoContraste,
        lenguajeSimple,
        audio,
        idioma,
        setFontGrande,
        setAltoContraste,
        setLenguajeSimple,
        setAudio,
        setIdioma,
        hablar,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAccesibilidad() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAccesibilidad debe usarse dentro de AccesibilidadProvider')
  return ctx
}
