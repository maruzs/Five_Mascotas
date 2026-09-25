# PLAYBOOK Y PLANTILLAS DE NOTIFICACIÓN DE BRECHAS DE SEGURIDAD (72 HORAS)
### Conforme al Art. 34 de la Ley N° 21.719 (Chile) y Art. 33/34 del RGPD (Unión Europea)

> **Instrucciones de uso:** Ante una sospecha o confirmación de fuga de datos, acceso no autorizado, ransomware o filtración de credenciales, el tiempo corre en contra del fundador. Este documento proporciona el protocolo de acción de emergencia y las dos plantillas obligatorias que deben emitirse antes del vencimiento fatal de **72 horas**.

---

## 1. Cronograma de Respuesta Operativa de Emergencia

| Ventana Temporal | Foco de Acción | Medidas Técnicas Inmediatas |
| :--- | :--- | :--- |
| **Horas 0 a 12** | **Aislamiento & Contención** | 1. Revocar de inmediato tokens comprometidos, credenciales de API y certificados SSL afectados.<br>2. Aislar servidores o contenedores afectados de la red.<br>3. Preservar logs inmutables de acceso (Cloudflare, Nginx, DB) para análisis forense.<br>4. Determinar si la brecha está activa o mitigada. |
| **Horas 12 a 24** | **Evaluación de Alcance** | 1. Cuantificar volumen de titulares afectados y categorías de datos (PII básica, financiera, contraseñas, datos sensibles).<br>2. Si eres Encargado (proveedor/agencia), **notificar formalmente al Responsable** antes de cumplir las 24 horas.<br>3. Iniciar redacción del informe técnico preliminar. |
| **Horas 24 a 48** | **Remediación & Triage Legal** | 1. Parchear vulnerabilidad de origen (inyección SQL, bucket público, credencial expuesta).<br>2. Forzar reseteo de contraseñas de usuarios afectados si hubo riesgo de credenciales.<br>3. Preparar borrador de notificación a la APDP / Autoridad de Control. |
| **Horas 48 a 72** | **Notificación Formal Obligatoria** | 1. Enviar formulario oficial a la **Agencia de Protección de Datos Personales (APDP)** o autoridad europea competente.<br>2. Si existe alto riesgo para los derechos de los usuarios, enviar correo directo a los titulares afectados. |

---

## 2. Plantilla A: Notificación Oficial a la APDP / Autoridad de Control

**Destinatario:** Agencia de Protección de Datos Personales de Chile (o Autoridad de Control del EEE)  
**Canal de Ingreso:** Mesa de partes digital / Canal oficial de notificación de brechas de la APDP  
**Plazo:** Antes de cumplirse 72 horas desde la toma de conocimiento confirmado.

```text
FORMULARIO FORMAL DE NOTIFICACIÓN DE INCIDENTE DE SEGURIDAD DE DATOS PERSONALES
(Artículo 34 Ley N° 21.719 / Artículo 33 RGPD)

1. IDENTIFICACIÓN DEL RESPONSABLE DEL TRATAMIENTO:
- Razón Social / Nombre: [NOMBRE_EMPRESA_O_STARTUP]
- RUT / Tax ID: [RUT_EMPRESA]
- Domicilio Legal: [DOMICILIO_COMPLETO]
- Representante Legal / Fundador: [NOMBRE_DEL_FUNDADOR]
- Punto de Contacto de Privacidad / DPO Técnico: [EMAIL_PRIVACIDAD] | [TELÉFONO_URGENCIA]

2. DETALLES CRONOLÓGICOS DEL INCIDENTE:
- Fecha y hora estimada de ocurrencia: [AAAA-MM-DD HH:MM UTC]
- Fecha y hora de detección/confirmación: [AAAA-MM-DD HH:MM UTC]
- Estado actual de la brecha: [ ] En curso  [X] Contenida  [ ] Resuelta definitivamente

3. NATURALEZA Y CAUSA DE LA VULNERACIÓN:
- Vector de entrada: [Ejemplo: Acceso indebido a endpoint API con autorización deficiente / Exposición temporal de respaldo en bucket S3 / Filtración de credencial de servicio / Ataque de fuerza bruta].
- Tipo de afectación: [X] Confidencialidad  [ ] Integridad  [ ] Disponibilidad

4. CATEGORÍAS Y VOLUMEN ESTIMADO DE DATOS Y TITULARES:
- Número aproximado de titulares afectados: [Ejemplo: 450 usuarios]
- Categorías de datos comprometidos:
  [X] Identificadores personales (Nombre, Apellidos, RUT/DNI)
  [X] Datos de contacto (Correo electrónico, Teléfono)
  [ ] Datos financieros (Últimos 4 dígitos de tarjeta; NO se almacenan números completos)
  [ ] Datos sensibles / Biométricos (NO comprometidos)
  [ ] Contraseñas (Almacenadas con hash Argon2id con salt; no texto plano)

5. EVALUACIÓN DE RIESGOS PARA LOS TITULARES:
- Nivel de riesgo estimado para los derechos de las personas: [ ] Bajo  [X] Medio  [ ] Alto / Crítico
- Posibles consecuencias identificadas: [Ejemplo: Riesgo potencial de intentos de phishing dirigido hacia los correos electrónicos filtrados].

6. MEDIDAS TÉCNICAS Y ORGANIZATIVAS DE MITIGACIÓN ADOPTADAS:
- Medidas de contención inmediata: [Ejemplo: Revocación inmediata de tokens de API afectados, bloqueo de direcciones IP atacantes mediante Cloudflare WAF, cierre de puertos no autorizados].
- Medidas de remediación definitiva: [Ejemplo: Despliegue de parche de código corregido, rotación completa de credenciales de base de datos, forzado de actualización de contraseñas para los usuarios involucrados].

7. COMUNICACIÓN A LOS TITULARES DE LOS DATOS:
- ¿Se ha notificado a los afectados?: [X] Sí, en fecha [FECHA_ENVÍO]  [ ] No requerido (Riesgo bajo evaluado).

Firma y Declaración:
Declaro bajo juramento que los antecedentes proporcionados reflejan fielmente el estado técnico del incidente y las medidas correctivas adoptadas hasta el momento de este informe.

Nombre: [NOMBRE_DEL_FUNDADOR]
Cargo: Representante Legal / Responsable Técnico
Fecha: [FECHA_ACTUAL]
```

---

## 3. Plantilla B: Comunicación de Transparencia a Usuarios Afectados

**Asunto del Correo:** `[AVISO IMPORTANTE DE SEGURIDAD] Información sobre tu cuenta en [NOMBRE_PLATAFORMA]`  
**Remitente:** `seguridad@[TUDOMINIO.COM]`

```markdown
Estimado/a [NOMBRE_USUARIO]:

En **[NOMBRE_EMPRESA]**, la privacidad y la protección de tus datos son una prioridad absoluta. En cumplimiento con la Ley N° 21.719 de Protección de Datos Personales y nuestros estándares de transparencia, nos comunicamos directamente contigo para informarte sobre un incidente de seguridad reciente que pudo haber involucrado parte de tu información de usuario.

### ¿Qué ocurrió?
El día **[FECHA_DETECCIÓN]**, nuestro equipo de ingeniería detectó un acceso no autorizado a uno de nuestros servicios backend, ocasionado por **[DESCRIPCIÓN SENCILLA: ej. una vulnerabilidad temporal en un componente de sincronización]**. Tan pronto como se confirmó el incidente, nuestro equipo aplicó de inmediato las medidas de aislamiento y corrección técnica pertinentes para cerrar el vector de acceso y blindar la infraestructura.

### ¿Qué información se vio comprometida?
De acuerdo con nuestra auditoría forense interna:
- **Datos que pudieron ser visualizados:** Tu nombre de usuario, correo electrónico y fecha de registro.
- **Datos que se mantuvieron 100% SEGUROS:**
  * Tus contraseñas están resguardadas mediante algoritmos de cifrado de última generación (hashing robusto con salt) y **no** fueron expuestas en texto legible.
  * **No** almacenamos números completos de tarjetas de crédito ni datos financieros sensibles, los cuales son gestionados directamente por pasarelas de pago certificadas (Stripe/Transbank).

### ¿Qué medidas adoptamos de inmediato?
1. Cerramos y parchamos definitivamente la vulnerabilidad en nuestro sistema.
2. Revocamos todas las sesiones activas asociadas a la plataforma para prevenir accesos no reconocidos.
3. Notificamos formalmente a la autoridad reguladora de protección de datos en cumplimiento con el plazo legal de 72 horas.

### ¿Qué te recomendamos hacer?
Como medida preventiva de higiene digital:
- Si utilizas la misma contraseña de [NOMBRE_PLATAFORMA] en otros servicios web, te sugerimos actualizarla en esos sitios.
- Desconfía de correos electrónicos sospechosos que soliciten contraseñas o información confidencial a nombre de [NOMBRE_PLATAFORMA]. Nuestro equipo **jamás** te pedirá tu contraseña por correo electrónico o mensajería.

Lamentamos profundamente cualquier inquietud que este evento pueda provocarte. Hemos reforzado nuestros controles perimetrales y de base de datos para evitar situaciones similares.

Si tienes cualquier duda adicional o deseas ejercer tus derechos legales de acceso o verificación, puedes contactar directamente a nuestro canal oficial de privacidad en **privacidad@[TUDOMINIO.COM]**.

Atentamente,  
**[NOMBRE_DEL_FUNDADOR]**  
Fundador / Responsable de Seguridad  
[NOMBRE_EMPRESA]
```
