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

  // Sedes INEN
  sedes_titulo:      { es: 'Sedes INEN',                              qu: 'INEN Wasikunam' },
  mi_ubicacion:      { es: 'Mi ubicación',                            qu: 'Kaypi kani' },
  obteniendo:        { es: 'Obteniendo…',                             qu: 'Maskachkani…' },
  volver_peru:       { es: 'Perú',                                    qu: 'Perú' },
  tu_ubicacion:      { es: 'Tu ubicación',                            qu: 'Kaypi kachkani' },
  ver_ruta:          { es: 'Ver ruta',                                qu: 'Ñanta qhaway' },
  ver_campus:        { es: 'Ver campus',                              qu: 'Campusta qhaway' },
  campus_btn:        { es: 'Campus →',                                qu: 'Campus →' },
  calculando:        { es: 'Calculando…',                             qu: 'Yupachkani…' },
  mas_cercana:       { es: '★ Más cercana',                           qu: '★ Aswan sirkaq' },
  loc_error:         { es: 'No se pudo obtener la ubicación. Selecciona una sede manualmente.', qu: 'Mana tariyta atirqanichu. Wasikunamanta akllay.' },

  // Login
  acceder:           { es: 'Acceder',                        qu: 'Yaykuy' },
  selecciona_perfil: { es: 'Selecciona tu perfil',           qu: 'Imaynatachus kankiyta akllay' },
  ingresar:          { es: 'Ingresar',                       qu: 'Yaykuy' },
  crear_cuenta:      { es: 'Crear cuenta',                   qu: 'Cuenta ruwakuy' },
  dni_correo:        { es: 'DNI o correo',                   qu: 'DNI utaq qillqa' },
  contrasena:        { es: 'Contraseña',                     qu: 'Pachasiqiq' },
  paciente_lbl:      { es: 'Paciente',                       qu: 'Unquq' },
  cuidador_lbl:      { es: 'Cuidador',                       qu: 'Qhawaq' },
  personal_inen:     { es: 'Personal INEN',                  qu: 'INEN llankaq' },
  administrador:     { es: 'Administrador',                  qu: 'Kamachiq' },
  antes_cita_btn:    { es: 'Antes de tu cita',               qu: 'Tupanay ñawpaq' },
  ver_mapa_btn:      { es: 'Ver mapa INEN',                  qu: 'INEN mapata qhaway' },
  tagline:           { es: 'Tu camino claro en el INEN.',    qu: 'Sut\'i ñanniyki INEN-pi.' },
  solo_orientamos:   { es: 'Solo orientamos, no diagnosticamos', qu: 'Yachachisunki, mana hampiqchu kanchik' },

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
