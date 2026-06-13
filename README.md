# OncoRuta Mujer IA — Prototipo MVP

> Plataforma de **navegación diagnóstica** para mujeres con sospecha de cáncer de mama o cérvix atendidas en el INEN.
> **Transformagob 2026 · Reto INEN · Desafío 14**

OncoRuta Mujer IA acompaña a la paciente paso a paso en su proceso administrativo dentro del INEN: le muestra en qué etapa está, cuál es su próximo paso, sus citas, documentos pendientes y alertas, e involucra a un cuidador de confianza. Para el personal del INEN ofrece un panel de seguimiento con semáforo de riesgo **operativo** (riesgo de demora, no clínico).

> ⚠️ **Importante:** la plataforma **no diagnostica, no predice cáncer, no reemplaza al médico y no recomienda tratamientos**. Solo orienta y acompaña en lo administrativo.

---

## 1. Cómo ejecutarlo localmente

Requisitos: **Node.js 18+** y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el entorno de desarrollo
npm run dev
# Abre http://localhost:5173

# (Opcional) Generar build de producción
npm run build
npm run preview
```

No requiere backend ni variables de entorno: todos los datos son ficticios y viven en memoria.

---

## 2. Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** (tokens de marca, accesibilidad y animaciones)
- Estado y "API" simulada en memoria con **React Context**
- Sin backend real, sin integraciones con sistemas del INEN, sin datos personales reales

---

## 3. Organización del proyecto

```
src/
├── main.tsx                  Punto de entrada (envuelve la app en los Providers)
├── App.tsx                   Enrutador por pantalla + rol
├── types.ts                  Modelo de datos (sin campos clínicos)
│
├── context/
│   ├── AppContext.tsx        Sesión, navegación y acciones simuladas (confirmar cita, etc.)
│   └── AccesibilidadContext.tsx  Letra grande, contraste, audio, idioma
│
├── data/
│   ├── pacientes.ts          5 pacientes demo con ruta, citas, documentos, alertas
│   └── i18n.ts               Diccionario español / quechua (demo)
│
├── lib/
│   ├── semaforo.ts           Reglas del semáforo de riesgo operativo
│   └── asistenteIA.ts        Asistente IA NO clínico (motor de reglas determinista)
│
├── components/
│   ├── RutaTimeline · SemaforoRiesgo · ChecklistDocumentos · TarjetaCita
│   ├── AlertaCard · NotificacionDemo · ChatIANoClinico
│   ├── ui/        (Icon, Card, Chip, BotonAudio, AvisoSeguridad…)
│   └── layout/    (AppShell, BarraAccesibilidad, BottomNav)
│
└── screens/
    ├── Login · Registro
    ├── PacienteHome · MiRuta · MisCitas · Documentos · Alertas
    ├── ModoCuidador · CuidadorHome · Accesibilidad
    └── PanelINEN · DetallePaciente · AdminPanel
```

### Roles
| Rol | Pantalla inicial | Qué ve |
|-----|------------------|--------|
| **Paciente** | Inicio | Su ruta, próximo paso, citas, documentos, alertas, cuidador, asistente IA |
| **Cuidador / familiar** | Acompañamiento | Vista resumida de la paciente, sin información médica sensible |
| **Personal INEN** | Panel de pacientes | Lista con semáforo, días sin avance, etapa, próxima acción, detalle |
| **Administrador** | Tablero | Métricas globales, distribución por riesgo/etapa, reglas del semáforo |

---

## 4. Reglas del semáforo de riesgo (operativo, NO clínico)

Mide el riesgo de **demora o pérdida de seguimiento**. No usa imágenes, biopsias ni resultados.

- 🟢 **Verde — Avance normal:** documentos completos, cita programada, menos de 3 días sin avance.
- 🟡 **Amarillo — Posible demora:** documentos importantes pendientes, 3–7 días sin avance, provincia con documentos incompletos, o sin cuidador y baja alfabetización digital.
- 🔴 **Rojo — Riesgo alto:** más de 7 días sin avance, cita perdida, sin próxima cita, o alerta roja sin atender.

El semáforo nunca depende solo del color: siempre muestra **punto + ícono + texto** (accesibilidad).

---

## 5. Datos mock

5 pacientes ficticias diseñadas para cubrir los tres estados del semáforo:

| Paciente | Edad | Procedencia | Sospecha | Etapa | Días | Semáforo |
|----------|------|-------------|----------|-------|------|----------|
| **María Quispe Huamán** | 52 | Ayacucho | Mama | Exámenes | 8 | 🔴 Rojo (cuidadora + quechua) |
| **Rosa López García** | 38 | Lima | Cérvix | Primera cita | 1 | 🟢 Verde |
| **Juana Cárdenas Flores** | 64 | Huancavelica | Mama | Admisión | 5 | 🟡 Amarillo |
| **Elena Torres Rojas** | 45 | Lima | Cérvix | Informe | 6 | 🟡 Amarillo |
| **Carmen Poma Sánchez** | 59 | Cusco | Mama | Historia clínica | 9 | 🔴 Rojo |

La paciente/cuidador de demostración es **María Quispe** (caso 🔴, el más rico para mostrar alertas, cuidador y quechua).

> Todos los datos son inventados. Los DNI están enmascarados. No hay información médica real ni resultados de exámenes.

---

## 6. Asistente IA no clínico

Es un **motor de reglas determinista** (sin LLM real) pensado para una demo segura y sin conexión:

- Responde sobre **documentos, citas, etapas, cómo llegar y cuidador**.
- **Rechaza** toda pregunta clínica (síntomas, diagnóstico, tratamiento, resultados) y redirige al personal del INEN.
- Tiene una traducción demo a quechua.

En producción se puede reemplazar el motor por un LLM **manteniendo las mismas barreras de seguridad** (rechazo de consultas clínicas).

---

## 7. Recomendación de demo (≈4 min)

1. **Login** → entra como **Paciente**.
2. **Inicio (María):** lee el saludo humano, el semáforo 🔴 explicado en lenguaje simple y el próximo paso. Pulsa **Escuchar**.
3. **Mi ruta:** muestra el camino con la marca *“Estás aquí”* y el progreso.
4. **Documentos:** marca un documento como *Listo* → aparece una **notificación simulada** (WhatsApp/SMS).
5. **Asistente IA** (botón flotante): haz una pregunta administrativa ("¿qué llevo a mi cita?") y luego una **clínica** ("¿tengo cáncer?") para mostrar el **rechazo seguro**.
6. **Accesibilidad:** activa **letra grande** + **alto contraste** y cambia a **quechua**.
7. Cierra sesión y entra como **Personal INEN** → **Panel:** ordena por riesgo, abre el **detalle de María**, **registra una acción** y **envía un recordatorio**.
8. (Opcional) Entra como **Administrador** para el tablero global y las reglas del semáforo.

---

## 8. Camino a producción (fuera del alcance del MVP)

- Integración con el sistema de citas/admisión del INEN (reemplazar la API simulada).
- Asistente con LLM real conservando las barreras no clínicas.
- Validación de las traducciones al quechua con hablantes nativos.
- Envío real de notificaciones (WhatsApp Business / SMS) y autenticación.
- Auditoría, consentimiento informado y protección de datos personales (Ley N.° 29733).

---

*Prototipo de demostración. Datos ficticios. No es un producto médico.*
