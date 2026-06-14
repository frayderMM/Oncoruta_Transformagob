import type { Idioma } from '../types'

// ===================================================================
// Diccionario español / quechua (DEMO)
// Las traducciones a quechua son una DEMOSTRACIÓN del enfoque
// intercultural y deben ser validadas por hablantes nativos antes
// de un uso real. Se priorizan frases cortas y de uso frecuente.
// ===================================================================

type Dic = Record<string, { es: string; qu: string }>

export const t: Dic = {
  // Navegación / estructura
  sedes_inen: { es: 'Sedes', qu: 'Wasikunam' },
  inicio: { es: 'Inicio', qu: 'Qallariy' },
  mi_ruta: { es: 'Mi ruta', qu: 'Ñanniy' },
  mis_citas: { es: 'Mis citas', qu: 'Tupanaykuna' },
  documentos: { es: 'Documentos', qu: 'Qillqakuna' },
  alertas: { es: 'Alertas', qu: 'Willakuykuna' },
  cuidador: { es: 'Cuidador', qu: 'Qhawaq' },
  ayuda: { es: 'Ayuda', qu: 'Yanapay' },
  asistente: { es: 'Asistente', qu: 'Yanapaq' },
  accesibilidad: { es: 'Accesibilidad', qu: 'Chayaynin' },
  salir: { es: 'Salir', qu: 'Lluqsiy' },

  // Mensajes humanos
  saludo: { es: 'Hola', qu: 'Allillanchu' },
  tu_etapa: { es: 'Tu etapa actual', qu: 'Kunan ñiqiyki' },
  tu_proximo_paso: { es: 'Tu próximo paso', qu: 'Qatiq ruwanayki' },
  proxima_cita: { es: 'Próxima cita', qu: 'Hamuq tupanay' },
  docs_pendientes: { es: 'Documentos pendientes', qu: 'Suyananchik qillqakuna' },
  escuchar: { es: 'Escuchar', qu: 'Uyariy' },
  pedir_ayuda: { es: 'Pedir ayuda', qu: 'Yanapakuy mañay' },
  confirmar_asistire: { es: 'Confirmar que asistiré', qu: 'Risaqmi nispa willay' },
  ver_como_llegar: { es: 'Ver cómo llegar', qu: 'Imayna chayanata qhaway' },

  avance_normal: {
    es: 'Tu proceso está avanzando. Revisa tu próxima cita y tus documentos.',
    qu: 'Llamkayniyki allinta richkan. Hamuq tupanaykita qillqakunaykitawan qhaway.',
  },
  hay_pendiente: {
    es: 'Hay algo pendiente que debemos resolver para que tu atención continúe.',
    qu: 'Huk imapas suyachkan, allichanapaq kachkan, hampikuyniyki qatinanpaq.',
  },

  // Seguridad
  no_diagnostica: {
    es: 'OncoRuta no da diagnósticos. Te ayuda a saber qué hacer y cuándo.',
    qu: 'OncoRutaqa mana unquykunata willanchu. Imata haykapichus ruwanata yachachisunki.',
  },
}

export function tr(key: keyof typeof t, idioma: Idioma): string {
  const entry = t[key]
  if (!entry) return String(key)
  return idioma === 'qu' ? entry.qu : entry.es
}
