// server/shipping.mjs
// Tarifas oficiales de despacho para FIVE Mascotas (Maule y RM)

export const defaultShippingRates = [
  {
    id: 'ship-talca',
    city: 'Talca',
    region: 'Maule',
    price: 1500,
    isDefault: true,
    cutoffTime: '14:00',
    deliveryNote: 'Mismo día en compras hasta las 14:00 hrs. Los repartos inician a las 15:00 hrs.',
  },
  {
    id: 'ship-maule',
    city: 'Maule / San Clemente',
    region: 'Maule',
    price: 2000,
    isDefault: false,
    cutoffTime: '13:00',
    deliveryNote: 'Repartos los días Martes y Jueves.',
  },
  {
    id: 'ship-curico',
    city: 'Curicó',
    region: 'Maule',
    price: 2500,
    isDefault: false,
    cutoffTime: '12:00',
    deliveryNote: 'Despacho en 24 a 48 hrs hábiles.',
  },
  {
    id: 'ship-linares',
    city: 'Linares',
    region: 'Maule',
    price: 2500,
    isDefault: false,
    cutoffTime: '12:00',
    deliveryNote: 'Despacho en 24 a 48 hrs hábiles.',
  },
  {
    id: 'ship-santiago',
    city: 'Santiago (Región Metropolitana)',
    region: 'Metropolitana',
    price: 3990,
    isDefault: false,
    cutoffTime: '14:00',
    deliveryNote: 'Despacho express 24 a 48 hrs.',
  },
];
