# ACUERDO DE ENCARGO DE TRATAMIENTO DE DATOS PERSONALES (DPA)
### Conforme a la Ley N° 21.719 de Protección de Datos Personales de Chile y Estándares Internacionales

> **Instrucciones de uso:** Este documento constituye el anexo contractual de protección de datos (*Data Processing Agreement* o DPA) que debes adjuntar obligatoriamente a tus propuestas comerciales, cotizaciones o contratos de desarrollo de software a medida, despliegue cloud, mantención o soporte técnico con empresas clientes. Los campos entre corchetes `[...]` deben completarse con los datos de cada contratación.

---

En Santiago de Chile, a **[FECHA_DE_FIRMA]**, comparecen:

De una parte, **[RAZÓN_SOCIAL_DEL_CLIENTE]**, Rol Único Tributario N° **[RUT_DEL_CLIENTE]**, domiciliada para estos efectos en **[DOMICILIO_DEL_CLIENTE]**, representada legalmente por don/doña **[NOMBRE_REPRESENTANTE_CLIENTE]**, Cédula de Identidad N° **[RUT_REPRESENTANTE_CLIENTE]**, en adelante indistintamente denominada como el **"Responsable"** o el **"Cliente"**;

Y de la otra parte, **[NOMBRE_COMPLETO_O_RAZÓN_SOCIAL_PROVEEDOR]**, Rol Único Tributario N° **[RUT_PROVEEDOR]**, con domicilio en **[DOMICILIO_PROVEEDOR]**, actuando en su calidad de titular de la empresa de servicios de desarrollo de software y soluciones informáticas, en adelante denominado como el **"Encargado"** o el **"Proveedor"**;

Conjuntamente denominadas como las **"Partes"** e individualmente como la **"Parte"**, quienes han convenido en celebrar el siguiente **Acuerdo de Encargo de Tratamiento de Datos Personales** (en adelante, el "Acuerdo" o "DPA"), como anexo indisoluble del contrato principal de servicios informáticos:

---

### PRIMERA: OBJETO DEL ENCARGO
El presente Acuerdo tiene por objeto regular las condiciones de seguridad, confidencialidad y tratamiento bajo las cuales el **Proveedor** (Encargado) accederá, almacenará, procesará o alojará datos personales por cuenta, encargo e instrucción exclusiva del **Cliente** (Responsable), en el marco de la prestación de servicios de desarrollo de software, arquitectura en la nube, soporte o mantenimiento informático (en adelante, el "Servicio Principal").

El Proveedor se obliga expresamente a no utilizar, divulgar ni destinar los datos personales tratados a finalidades distintas a aquellas estrictamente autorizadas e indispensables para la ejecución del Servicio Principal.

---

### SEGUNDA: PROPIEDAD Y CONTROL EXCLUSIVO DE LOS DATOS
Las Partes reconocen y declaran que todos los datos personales, bases de datos, perfiles de usuario, credenciales y contenidos procesados con ocasión del Servicio Principal son y permanecerán en todo momento bajo la exclusiva titularidad, propiedad y control del **Cliente**.

El Proveedor no adquiere derecho alguno de propiedad, titularidad, usufructo, ni licencia comercial sobre la información tratada, actuando única y exclusivamente como mandatario técnico conforme a las exigencias de la **Ley N° 21.719 sobre Protección de Datos Personales de la República de Chile**.

---

### TERCERA: OBLIGACIONES DEL PROVEEDOR (ENCARGADO)
En observancia de los principios de licitud, finalidad, proporcionalidad, seguridad y responsabilidad, el Proveedor se obliga a:

1. **Tratamiento según Instrucciones Documentadas:** Tratar los datos personales únicamente siguiendo las instrucciones técnicas y directrices escritas emanadas por el Cliente.
2. **Deber de Confidencialidad y Secreto Profesional:** Guardar estricta reserva, confidencialidad y secreto profesional sobre todos los datos e información a los que tenga acceso, subsistiendo esta obligación de manera indefinida aun después del término de la relación contractual.
3. **Medidas Técnicas y Organizativas de Seguridad:** Implementar y mantener salvaguardas técnicas acordes al estado del arte para proteger los datos contra destrucción accidental o ilícita, pérdida, alteración, comunicación o acceso no autorizado (cifrado en tránsito TLS 1.3, cifrado en reposo AES-256, políticas de contraseñas robustas y segmentación de entornos).
4. **Asistencia en Derechos ARCOP-B (Art. 11 Ley N° 21.719):** Cooperar diligentemente con el Cliente y poner a su disposición las herramientas técnicas pertinentes para que este pueda responder en tiempo y forma a las solicitudes de ejercicio de los derechos de **Acceso, Rectificación, Cancelación, Oposición, Portabilidad y Bloqueo (ARCOP-B)** formuladas por los titulares de los datos. Dado que el plazo legal fatal para que el Responsable dé respuesta al titular es de **15 días corridos**, el Proveedor se compromete a evacuar cualquier requerimiento técnico del Cliente dentro de un plazo máximo de **cinco (5) días corridos** contados desde su recepción.
5. **Implementación de Bloqueo Temporal:** Proveer la capacidad técnica en la base de datos para marcar datos personales en estado de "bloqueo" temporal (`status = 'blocked'`), suspendiendo cualquier tratamiento activo o procesamiento algorítmico mientras subsista una controversia, sin borrarlos físicamente durante dicho período.
6. **Prohibición de Uso para Inteligencia Artificial y Perfilamiento no Autorizado:** Queda expresamente prohibido al Proveedor utilizar datos personales del Cliente para alimentar, evaluar o entrenar modelos de Inteligencia Artificial (propios o de terceros) o generar perfiles automatizados sin la expresa autorización previa y por escrito del Cliente.
7. **Decisiones Automatizadas:** En caso de que el software encargado incorpore componentes de toma de decisiones automatizadas que afecten legal o sustancialmente a los titulares, el Proveedor diseñará el sistema permitiendo que el Cliente pueda habilitar canales de revisión e intervención humana, explicabilidad de los criterios y mecanismos de objeción técnica.

---

### CUARTA: SUBCONTRATACIÓN DE INFRAESTRUCTURA Y TRANSFERENCIAS INTERNACIONALES (SUBENCARGADOS & SCCS)
El Cliente autoriza de manera general al Proveedor para contratar servicios de infraestructura en la nube, telecomunicaciones auxiliares y proveedores SaaS indispensables para el despliegue del software.

El Proveedor declara utilizar servicios tecnológicos de primer nivel con altos estándares de cumplimiento de privacidad y seguridad física/lógica, tales como:
- Red de entrega de contenidos, WAF y túneles cifrados (ej. Cloudflare, Inc.).
- Infraestructura de almacenamiento y cómputo seguro (ej. Cloudflare R2 / AWS / Supabase / Proxmox debidamente securizado).
- Pasarelas de pago certificadas PCI-DSS (ej. Stripe, Inc., Transbank, Mercado Pago).
- Servicios de autenticación y notificaciones transaccionales (ej. Supabase Auth, Resend, SendGrid).
- Proveedores de APIs de Inteligencia Artificial con política contractual de Zero Data Retention / No Training (ej. Anthropic, OpenAI Enterprise/API).

En caso de que el tratamiento implique transferencias internacionales de datos fuera del territorio de Chile o del Espacio Económico Europeo (EEE), el Proveedor garantiza que dichos subencargados operan bajo marcos de adecuación reconocidos o mediante la suscripción de las **Cláusulas Contractuales Tipo (Standard Contractual Clauses - SCCs)** aprobadas por la Comisión Europea (Decisión de Ejecución UE 2021/914), asegurando un nivel de protección equivalente al exigido por la Ley N° 21.719 y el Reglamento (UE) 2016/679 (GDPR).

El Proveedor se compromete a que los subencargados mantengan obligaciones contractuales de confidencialidad y protección de datos equivalentes a las estipuladas en el presente Acuerdo.

---

### QUINTA: NOTIFICACIÓN DE INCIDENTES Y BRECHAS DE SEGURIDAD (ART. 34 LEY N° 21.719)
En cumplimiento estricto del Artículo 34 de la Ley N° 21.719 de Chile:

1. Si el Proveedor toma conocimiento efectivo o detecta una brecha de seguridad que afecte o comprometa la confidencialidad, integridad o disponibilidad de los datos personales tratados por cuenta del Cliente, el Proveedor notificará al Cliente **a la brevedad posible y a más tardar dentro de las veinticuatro (24) horas siguientes a la confirmación del incidente**.
2. Esta pronta notificación tiene por finalidad directa permitir al Cliente, en su calidad de Responsable legal del tratamiento, cumplir con la obligación perentoria de informar formalmente a la **Agencia de Protección de Datos Personales (APDP)** y a los titulares afectados en un plazo máximo fatal de **setenta y dos (72) horas** contadas desde que tuvo conocimiento confirmado del incidente.
3. La notificación remitida por el Proveedor incluirá, en cuanto esté disponible:
   - Naturaleza y vector de la vulneración de seguridad;
   - Categorías y número aproximado de titulares y registros de datos comprometidos;
   - Medidas técnicas inmediatas de mitigación y contención adoptadas;
   - Recomendaciones técnicas para subsanar los efectos y prevenir incidentes análogos.

---

### SEXTA: DESTINO DE LOS DATOS AL TÉRMINO DEL SERVICIO
A la terminación de la relación contractual o habiéndose completado las fases del Servicio Principal, el Proveedor procederá, según las instrucciones del Cliente, a:
1. Poner a disposición del Cliente la totalidad de los datos personales y esquemas en un formato interoperable, legible y estructurado (ej. SQL dump, JSON o CSV); y
2. Proceder a la destrucción y borrado lógico/físico seguro e irreversible de todas las copias o respaldos existentes en los servidores y entornos de desarrollo del Proveedor, emitiendo constancia de ello si fuere requerido, a excepción de aquella información cuya conservación sea exigida por obligaciones legales o tributarias chilenas.

---

### SÉPTIMA: RÉGIMEN Y LÍMITE DE RESPONSABILIDAD
Las Partes acuerdan que la responsabilidad indemnizatoria total y acumulada del Proveedor por cualquier incumplimiento del presente DPA o incidentes de seguridad —salvo que medie dolo o culpa grave judicialmente declarada— estará sujeta a un límite máximo equivalente a la suma total efectivamente percibida por el Proveedor en virtud del contrato principal durante los últimos **seis (6) meses** previos a la ocurrencia del hecho generador.

En ningún caso el Proveedor responderá por daños indirectos, lucro cesante, daño moral, pérdida de reputación ni multas administrativas impuestas por la APDP u otros organismos reguladores cuando dichas sanciones deriven de instrucciones erróneas, negligencias o retrasos imputables exclusivamente al Cliente.

---

### OCTAVA: LEY APLICABLE, JURISDICCIÓN Y DOMICILIO
El presente Acuerdo se regirá e interpretará con arreglo a las leyes de la **República de Chile**, con sujeción a la **Ley N° 21.719 sobre Protección de Datos Personales**, sus reglamentos e instrucciones que dicte la **Agencia de Protección de Datos Personales (APDP)**.

Para todos los efectos legales que de este instrumento emanen, las Partes fijan su domicilio convencional en la ciudad y comuna de Santiago de Chile y se someten a la competencia de sus Tribunales Ordinarios de Justicia.

---

En señal de conformidad, las Partes suscriben el presente Acuerdo en dos ejemplares de idéntico tenor y fecha, o mediante firma electrónica simple o avanzada.

<br><br>

______________________________________________  
**POR EL CLIENTE (RESPONSABLE)**  
Nombre: [NOMBRE_REPRESENTANTE_CLIENTE]  
RUT: [RUT_REPRESENTANTE_CLIENTE]  
Razón Social: [RAZÓN_SOCIAL_DEL_CLIENTE]  

<br><br>

______________________________________________  
**POR EL PROVEEDOR (ENCARGADO)**  
Nombre: [NOMBRE_COMPLETO_O_RAZÓN_SOCIAL_PROVEEDOR]  
RUT: [RUT_PROVEEDOR]  
Titular / Representante Legal  
