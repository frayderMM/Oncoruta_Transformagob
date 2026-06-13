import type { Paciente } from '../types'

// ===================================================================
// Asistente IA NO CLÍNICO
// Reglas (secciones 19 y 20):
//  - Solo orienta sobre el proceso administrativo y la navegación.
//  - RECHAZA cualquier pregunta de diagnóstico, pronóstico,
//    tratamiento o interpretación clínica.
//
// Implementado como motor de reglas determinista para que la demo
// funcione sin conexión y de forma 100% predecible y segura.
// En producción puede sustituirse por un LLM con este mismo "system
// prompt" de seguridad (ver README → Próximos pasos).
// ===================================================================

export const MENSAJE_SEGURIDAD =
  'Soy un asistente de orientación. No puedo dar diagnósticos ni tratamientos. Para decisiones médicas, consulta siempre con el personal de salud del INEN.'

const PALABRAS_CLINICAS = [
  'diagnóstic', 'diagnostic', 'cáncer', 'cancer', 'tumor', 'maligno', 'benigno',
  'metástasis', 'metastasis', 'tratamiento', 'quimio', 'radioterapia', 'cirugía',
  'cirugia', 'operar', 'biopsia', 'mamografía', 'mamografia', 'resultado del examen',
  'qué tengo', 'que tengo', 'me voy a morir', 'pronóstico', 'pronostico',
  'medicamento', 'pastilla', 'es grave', 'tengo cáncer', 'tengo cancer',
  'supervivencia', 'etapa del cáncer', 'estadio',
]

export interface RespuestaIA {
  texto: string
  esRechazo: boolean
}

function incluyeAlguna(texto: string, lista: string[]): boolean {
  return lista.some((p) => texto.includes(p))
}

export function responderIA(preguntaRaw: string, p?: Paciente): RespuestaIA {
  const q = preguntaRaw.toLowerCase().trim()

  // 1) Barrera de seguridad: preguntas clínicas → rechazo
  if (incluyeAlguna(q, PALABRAS_CLINICAS)) {
    return {
      esRechazo: true,
      texto:
        MENSAJE_SEGURIDAD +
        '\n\nLo que sí puedo hacer: explicarte tu próxima cita, qué documentos llevar, en qué etapa estás o cómo registrar a un cuidador.',
    }
  }

  // 2) FAQ administrativa
  const proxCita = p?.citas.find(
    (c) => c.estado === 'Programada' || c.estado === 'Confirmada',
  )
  const docsPend = p?.documentos.filter(
    (d) => d.estado === 'Pendiente' || d.estado === 'Observado',
  )

  if (incluyeAlguna(q, ['llevar', 'documento', 'qué necesito', 'que necesito'])) {
    if (docsPend && docsPend.length > 0) {
      const lista = docsPend.map((d) => `• ${d.nombre} (${d.observacion})`).join('\n')
      return {
        esRechazo: false,
        texto: `Para tu próximo paso te falta llevar:\n${lista}\n\nLleva también tu DNI. Llega 30 minutos antes. Si te falta algún documento, pide ayuda en orientación.`,
      }
    }
    return {
      esRechazo: false,
      texto:
        'Lleva siempre tu DNI y tu hoja de referencia. Llega 30 minutos antes de tu cita. Tus documentos están al día. 👍',
    }
  }

  if (incluyeAlguna(q, ['próxima cita', 'proxima cita', 'cuándo', 'cuando', 'mi cita'])) {
    if (proxCita) {
      return {
        esRechazo: false,
        texto: `Tu próxima cita es el ${proxCita.fecha} a las ${proxCita.hora}, en ${proxCita.lugar} (${proxCita.servicio}). ${proxCita.indicaciones}`,
      }
    }
    return {
      esRechazo: false,
      texto:
        'Por ahora no tienes una cita con fecha. El INEN la programará y te avisará. Si pasan varios días, pide ayuda en orientación.',
    }
  }

  if (incluyeAlguna(q, ['etapa', 'en qué voy', 'en que voy', 'paso sigue', 'qué sigue', 'que sigue'])) {
    if (p) {
      return {
        esRechazo: false,
        texto: `Estás en la etapa "${p.etapaActual}". Tu próximo paso: ${p.proximoPaso}`,
      }
    }
  }

  if (incluyeAlguna(q, ['perdí', 'perdi', 'no puedo asistir', 'no pude ir', 'falté', 'falte'])) {
    return {
      esRechazo: false,
      texto:
        'Si no puedes asistir o perdiste una cita, no te preocupes: avisa al INEN en orientación para reprogramarla. Puedes pedir a tu cuidador que llame por ti.',
    }
  }

  if (incluyeAlguna(q, ['cuidador', 'familiar', 'mi hija', 'acompañar', 'mamá', 'mama'])) {
    return {
      esRechazo: false,
      texto:
        'Sí puedes registrar a un familiar como cuidador. Ve a "Cuidador", agrega su nombre, parentesco y teléfono. Esa persona podrá ver tus citas, documentos y alertas para ayudarte.',
    }
  }

  if (incluyeAlguna(q, ['quechua', 'tradu'])) {
    return {
      esRechazo: false,
      texto:
        'Puedo mostrarte mensajes en quechua (demo). Activa el idioma quechua en "Accesibilidad". Por ejemplo:\n"Llamkayniyki allinta richkan" = "Tu proceso está avanzando".',
    }
  }

  if (incluyeAlguna(q, ['informe', 'resultado'])) {
    return {
      esRechazo: false,
      texto:
        'Cuando tu informe esté listo, recibirás una alerta y se programará tu cita. "Informe pendiente" significa que aún se está procesando; no significa nada sobre tu salud. Para dudas médicas, consulta con el personal del INEN.',
    }
  }

  if (incluyeAlguna(q, ['hola', 'buenos', 'buenas', 'gracias'])) {
    return {
      esRechazo: false,
      texto:
        '¡Hola! Estoy para ayudarte a entender tu proceso. Puedes preguntarme: ¿qué debo llevar?, ¿cuándo es mi cita?, ¿en qué etapa estoy? o ¿cómo registro a un cuidador?',
    }
  }

  // 3) Por defecto
  return {
    esRechazo: false,
    texto:
      'Puedo orientarte sobre tu proceso: documentos a llevar, próxima cita, tu etapa actual, alertas o cómo registrar a un cuidador. ¿Sobre cuál quieres saber?\n\nRecuerda: no doy diagnósticos ni tratamientos.',
  }
}

export const SUGERENCIAS_IA = [
  '¿Qué debo llevar a mi cita?',
  '¿Cuándo es mi próxima cita?',
  '¿En qué etapa estoy?',
  '¿Cómo registro a un cuidador?',
  'Tradúcelo a quechua (demo)',
]
