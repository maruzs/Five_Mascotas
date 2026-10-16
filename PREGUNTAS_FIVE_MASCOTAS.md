# Cuestionario Operativo y Estratégico para FIVE Mascotas
> **Objetivo:** Recopilar definiciones del negocio para perfeccionar la integración entre **Nexo (ERP/PIM)** y la **Tienda Web / PWA (Five Mascotas)**, asegurando coherencia en catálogo, inventario, logística, medios de pago y atención al cliente.

---

## 1. Gestión de Catálogo y Stock (PIM & Inventario)

1. **Jerarquía y Control de Stock:**
   - ¿El inventario se descuenta centralizadamente desde la **Casa Matriz (10 Oriente)** o cada sucursal (ej. Las Rastras) maneja stock independiente para despacho?
   - Cuando un saco o producto queda con stock 0 en tienda física: ¿Debe ocultarse automáticamente de la web, mostrarse como "Agotado", o permitir venta bajo reserva / pedido por encargo?
2. **Formatos y Fraccionamiento:**
   - Hay sacos grandes (ej. 15 kg, 18 kg, 21 kg) y presentaciones pequeñas o pouch. ¿Venden alimento a granel / por kilo suelto en tienda física, o la web solo debe ofrecer sacos cerrados con empaque de fábrica?
3. **Farmacia y Antiparasitarios:**
   - En productos veterinarios (Nexgard, Bravecto, Simparica, etc.), ¿exigen alguna validación o receta previa en ciertos fármacos, o todos los que manejan son de venta libre bajo responsabilidad del tutor?
4. **Actualización de Precios:**
   - ¿Con qué frecuencia cambian los precios de los proveedores (Carozzi, Gepsa, Royal Canin, etc.)? ¿Quién y desde dónde será responsable de aprobar el cambio de precios en Nexo?

---

## 2. Ventas, Carrito y Pasarelas de Pago

1. **Flujo de Pago Online vs Presencial:**
   - Actualmente el checkout permite Webpay / tarjetas y transferencia. ¿Qué pasarela de pago oficial tienen contratada o prefieren habilitar (Transbank Webpay Plus, Mercado Pago, Flow)?
   - ¿Ofrecen o desean ofrecer la opción de *"Pagar al recibir"* (en efectivo o con máquina POS del repartidor) para entregas en Talca?
2. **Transferencias Bancarias:**
   - En caso de pago por transferencia: ¿Quién y en qué horario valida el comprobante antes de liberar el pedido para preparación? ¿Desean validación automática o manual vía WhatsApp?
3. **Boletas y Facturación Electrónica:**
   - ¿La emisión de boleta electrónica (DTE / SII) se genera de forma inmediata con Nexo/software contable al pagar, o se emite manualmente al momento de armar el paquete?

---

## 3. Logística, Despacho y Retiro en Tienda

1. **Zonas de Reparto y Costos:**
   - ¿Cuál es la cobertura exacta de despacho propio dentro de Talca y comunas aledañas (Maule, San Clemente, Pencahue)?
   - ¿Existe un monto mínimo de compra para **Despacho Gratis** (ej. sobre $25.000 o $30.000) o se cobra una tarifa plana según sector?
2. **Tiempos de Entrega (SLA):**
   - Para pedidos realizados antes de las 13:00 hrs: ¿Se entregan el mismo día (*Same-Day Delivery*) o en un rango de 24 a 48 horas hábiles?
   - ¿Se realizan despachos los días sábado y domingo?
3. **Retiro en Tienda (Click & Collect):**
   - Si el cliente elige retirar en tienda: ¿Puede retirar en cualquiera de las sucursales (10 Oriente o Las Rastras)? ¿Cuánto tiempo estimado tarda el personal en tener listo el paquete para entrega?

---

## 4. Promociones, Fidelización y Descuentos

1. **Precios Diferenciados:**
   - ¿Manejan o contemplan precios especiales para criadores, rescatistas o compras por volumen (más de 3 o 5 sacos)?
2. **Club / Fidelización:**
   - ¿Tienen actualmente algún sistema de acumulación de puntos, cupones de cumpleaños o convenio con clínicas veterinarias que debamos integrar en el perfil de usuario?

---

## 5. Atención al Cliente y Asistente Rayo

1. **Derivación a WhatsApp Humano:**
   - Cuando el cliente termina de armar su pedido o tiene dudas que Rayo (el asistente IA) deriva a un humano: ¿El WhatsApp oficial (+56 9 6418 3605) lo atiende una persona dedicada o el mismo personal en caja de 10 Oriente?
   - ¿Cuáles son los horarios exactos de atención humana en caso de que el cliente escriba fuera de horario comercial?
2. **Políticas de Cambio y Devolución:**
   - Si una mascota rechaza el alimento o la bolsa viene con falla de sellado: ¿Cuál es el protocolo de garantía o cambio de Five Mascotas para redactarlo con precisión en los términos legales de la web?

---

## 6. Panel de Administración y App Móvil (PWA)

1. **Uso Diario del Personal:**
   - ¿El administrador o encargado de bodega usará principalmente un computador en mesón o un teléfono celular para revisar los pedidos entrantes y cambiar estados (Preparando / En Ruta / Entregado)?
   - ¿A qué personas o números telefónicos deben llegar las alertas inmediatas cuando entre una nueva compra online?
