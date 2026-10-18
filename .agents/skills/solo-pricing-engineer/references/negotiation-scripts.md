# Simulador de Negociación Bidireccional y Scripts de Cierre

Esta guía documenta los dos modos de simulación y los guiones de cierre en UF para proyectos de software en Chile.

---

## 1. Los Dos Modos de Simulación con Subagentes

### MODO 1: Tú juegas a ser el Cliente (IA = Agencia / Desarrolladores)
* **Objetivo:** Permite que ingreses los requisitos de un proyecto real y le pidas cotizaciones a la IA simulando distintas agencias de mercado.
* **Dinámica:**
  - La IA puede adoptar el perfil de una **Software Factory establecida** (cotizando alto, detallando células ágiles) o de un **Freelancer independiente** (cotizando bajo pero con advertencias de riesgo).
  - Tú puedes ponerte en el papel del cliente regateando agresivamente para descubrir cuál es el "piso razonable" del mercado antes de hablar con tu cliente real.

---

### MODO 2: La IA juega a ser el Cliente (Simulador de Estrés en 5 Rondas)
El simulador no se limita a un par de preguntas; ejecuta un **debate continuo de 4 a 5 rondas progresivas** donde el cliente simulado aprieta cada vez más:

* **Ronda 1 (Objeción de Precio):** *"Está fuera de presupuesto / me parece caro para un software que parece sencillo."*
* **Ronda 2 (Objeción de Solo-Founder / Estudiante):** *"Eres una sola persona y aún estás en la universidad. ¿Por qué no contratar a una empresa con 10 personas?"*
* **Ronda 3 (Objeción de Infraestructura / Homelab Proxmox):** *"¿El servidor va a estar en tu casa? ¿Qué pasa si hay un corte de luz en tu sector, falla tu internet o te hackean?"*
* **Ronda 4 (Objeción de Continuidad / Single Point of Failure):** *"¿Qué pasa si te enfermas, tienes exámenes en la universidad o dejas el proyecto a medias?"*
* **Ronda 5 (Cierre / Contraoferta Dura):** *"Te ofrezco [50% del precio] en efectivo ya mismo y te firmo hoy. Si no, seguimos buscando."*

Al terminar la 5ta ronda, la IA sale del personaje y entrega un **informe de feedback**: califica tu firmeza, tus argumentos de valor y te da consejos exactos para pulir tu discurso.

---

## 2. Guion de Cierre de Propuesta en UF

Cuando presentas el presupuesto (en persona, PDF o WhatsApp):

> *"Revisando el alcance integral del sistema y las necesidades que levantamos con su equipo, el proyecto queda presupuestado en **[X] UF** (equivalente a \$[Monto en CLP] al valor observado de hoy).
> 
> Esto contempla:
> - El desarrollo completo de los módulos web y móviles acordados.
> - Despliegue en ambiente de pruebas desde las primeras etapas para validar flujos con su equipo en caliente.
> - 1 semana dedicada de testing final y capacitación a usuarios clave.
> - **Módulos operativos adicionales:** Como valoramos el impacto del proyecto, incluimos las automatizaciones operativas (valorizadas en [Y] UF) **completamente bonificadas a costo \$0** dentro de esta propuesta."*
