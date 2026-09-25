# Metodología de Auditoría: Coherencia Documental vs Código Real

Uno de los objetivos más críticos de la auditoría técnica es descubrir la brecha entre lo que el proyecto **promete comercialmente** (en Landing Pages, READMEs, Términos y Condiciones o Políticas de Privacidad) y lo que el software **realmente hace** en el backend y la base de datos.

---

## 1. Categorías de Evaluación de Promesas

Para cada afirmación comercial, funcional o legal encontrada en la documentación, el auditor debe asignarle uno de los siguientes estados:

1. **Implementada:** Existe evidencia en el código backend o infraestructura de que la función o garantía opera efectivamente y con enforcement técnico.
2. **Parcialmente Implementada:** La función existe en el código pero carece de controles esenciales (ejemplo: hay un endpoint de exportación pero solo exporta el perfil básico y no el historial de transacciones).
3. **Sólo Interfaz sin Enforcement:** La pantalla o botón existe en el frontend, pero la llamada al backend no valida permisos, guarda datos ficticios o está conectada a un handler vacío.
4. **No Implementada:** La landing page o README publicita la función (ej. *"Copia de seguridad automática cada hora"* o *"Soporte para múltiples organizaciones"*), pero no existe rastro alguno de código, workers ni tablas en la base de datos que la sustenten.
5. **No Verificable:** La función depende de servicios externos, credenciales de producción o infraestructura a la que no se tiene acceso durante la auditoría.

---

## 2. Matriz de Contraste Obligatoria

En la sección 11 del informe `AUDITORIA_COMPLETA.md`, debe incluirse la siguiente tabla de análisis comparativo:

| Promesa Documental / Comercial | Fuente (Landing, README, ToS) | Estado Real en Código | Evidencia en Repositorio | Riesgo Legal o Comercial |
| :--- | :--- | :--- | :--- | :--- |
| *"Cifrado de extremo a extremo en todos tus mensajes"* | Landing Page (Sección Seguridad) | **No Implementada** | Mensajes guardados en texto claro en `messages.content` (`src/db/schema.sql:L84`). | 🔴 **Crítico:** Acusación por publicidad engañosa ante la FTC/SERNAC y violación de la Ley N° 21.719 de Chile. |
| *"Exporta todos tus datos en 1 clic en formato JSON"* | Términos de Servicio (Art. 7) | **Sólo Interfaz** | Botón en `Settings.tsx:L120` con `alert("Próximamente")`. | 🟠 **Alto:** Incumplimiento del derecho de portabilidad ARCO-POL exigido por ley. |
| *"Cancelación de suscripción inmediata sin preguntas"* | Landing Page (FAQ) | **Parcialmente Implementada** | Endpoint `/api/cancel` envía un email a soporte pero no cancela la suscripción en la pasarela de pagos automáticamente. | 🟡 **Medio:** Disputas y contracargos con usuarios en Stripe. |
| *"Autenticación con doble factor (2FA) obligatoria"* | README del Proyecto | **No Implementada** | No existen tablas de TOTP ni middleware de 2FA en el backend. | 🟠 **Alto:** Falsa sensación de seguridad en clientes corporativos B2B. |

---

## 3. Directrices para el Auditor

- **Revisa la Landing Page completa:** Examina el copy de precios, los límites de cuotas (*"almacenamiento ilimitado"*), la disponibilidad publicitada (*"99.9% uptime"*) y la periodicidad de backups.
- **Revisa los Términos de Servicio:** Contrasta los plazos de respuesta para soporte técnico o devoluciones con los flujos automáticos implementados.
- **Reporta el riesgo de mantener la promesa:** Si una promesa no está implementada, la recomendación técnica prioritaria es **eliminar la afirmación de la landing page inmediatamente** para erradicar el riesgo de multas regulatorias mientras se programa la funcionalidad real.
