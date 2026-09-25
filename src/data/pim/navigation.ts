import type { NavigationCategory, AnnouncementTicker, PromoBanner } from './types';

export const announcementTicker: AnnouncementTicker = {
  id: 'ticker-1',
  text: '¡10% dto. en tu primera compra web!',
  couponCode: 'PRIMERA10',
  couponText: 'Usa el código PRIMERA10',
  extraInfo: 'Despacho rápido a todo Santiago · Horario tienda Lun-Sáb 10:00 a 20:00',
  active: true,
};

export const promoBanners: PromoBanner[] = [
  {
    id: 'banner-hero-home',
    tag: 'SOLO POR ESTE FIN DE SEMANA',
    title: '2x1 en Camas, Mantas y Ropa',
    subtitle: 'Para perros y gatos de todos los tamaños. ¡Combínalas como quieras!',
    disclaimer: '*Válido hasta agotar stock. Descuento aplicado automáticamente al carrito.',
    ctaText: 'Ver Promociones 2x1',
    ctaHref: '/ofertas',
    badge: '2x1 WEEKEND',
  },
  {
    id: 'banner-perros',
    tag: 'ESPECIAL CANINO',
    title: 'Nutrición Premium para tu Perro',
    subtitle: 'Alimentos secos, húmedos y snacks con hasta 25% de descuento.',
    ctaText: 'Explorar Alimentos para Perro',
    ctaHref: '/perros',
    badge: 'HASTA 25% OFF',
    petTarget: 'Perros',
  },
  {
    id: 'banner-gatos',
    tag: 'MUNDO FELINO',
    title: 'Todo para los Reyes de la Casa',
    subtitle: 'Arenas aglomerantes, rascadores y latitas gourmet seleccionadas.',
    ctaText: 'Ver Todo para Gatos',
    ctaHref: '/gatos',
    badge: 'SUPER PRECIOS',
    petTarget: 'Gatos',
  },
  {
    id: 'banner-ofertas',
    tag: 'ZONA DE OPORTUNIDADES',
    title: 'Liquidaciones y SuperPrecios FIVE',
    subtitle: 'Encuentra las mejores marcas al precio más conveniente.',
    ctaText: 'Aprovechar Ofertas',
    ctaHref: '/ofertas',
    badge: 'LIQUIDACIÓN',
  },
];

export const navigationCategories: NavigationCategory[] = [
  {
    name: 'Perro',
    slug: 'perro',
    href: '/perros',
    hasDropdown: true,
    sections: [
      {
        title: 'Alimentos',
        href: '/perros',
        items: [
          { label: 'Alimentos seco', href: '/perros' },
          { label: 'Alimentos húmedos', href: '/perros' },
          { label: 'Dietas veterinarias', href: '/perros' },
          { label: 'Alimento natural', href: '/perros' },
          { label: 'Snack y premios', href: '/snacks' },
        ],
      },
      {
        title: 'Accesorios',
        href: '/accesorios',
        items: [
          { label: 'Camas y mantas', href: '/accesorios', badge: '2x1' },
          { label: 'Collares, arneses y correas', href: '/accesorios' },
          { label: 'Platos y bebederos', href: '/accesorios' },
          { label: 'Transportadores y viajes', href: '/accesorios' },
          { label: 'Ropa y abrigo', href: '/accesorios' },
        ],
      },
      {
        title: 'Juguetes',
        href: '/accesorios',
        items: [
          { label: 'Cachorros', href: '/perros' },
          { label: 'Peluches', href: '/accesorios' },
          { label: 'Mordedores y pelotas', href: '/accesorios' },
          { label: 'Juegos interactivos', href: '/accesorios' },
        ],
      },
      {
        title: 'Farmacia e Higiene',
        href: '/farmacia',
        items: [
          { label: 'Antiparasitarios', href: '/farmacia', badge: 'Top' },
          { label: 'Farmacia y salud', href: '/farmacia' },
          { label: 'Sabanillas y pañales', href: '/higiene' },
          { label: 'Cuidado dental', href: '/higiene' },
        ],
      },
    ],
  },
  {
    name: 'Gato',
    slug: 'gato',
    href: '/gatos',
    hasDropdown: true,
    sections: [
      {
        title: 'Alimentos',
        href: '/gatos',
        items: [
          { label: 'Alimento seco', href: '/gatos' },
          { label: 'Alimento húmedo (Sobres y latas)', href: '/gatos' },
          { label: 'Esterilizados', href: '/gatos', badge: 'Popular' },
          { label: 'Snacks y churu', href: '/snacks' },
        ],
      },
      {
        title: 'Higiene y Arena',
        href: '/higiene',
        items: [
          { label: 'Arenas aglomerantes', href: '/higiene', badge: 'Oferta' },
          { label: 'Areneros y palas', href: '/higiene' },
          { label: 'Desodorizantes', href: '/higiene' },
        ],
      },
      {
        title: 'Accesorios y Rascadores',
        href: '/accesorios',
        items: [
          { label: 'Rascadores y gimnasios', href: '/accesorios' },
          { label: 'Camas y cuevas', href: '/accesorios' },
          { label: 'Juguetes con catnip', href: '/accesorios' },
          { label: 'Platos y fuentes de agua', href: '/accesorios' },
        ],
      },
      {
        title: 'Farmacia',
        href: '/farmacia',
        items: [
          { label: 'Antiparasitarios externos e internos', href: '/farmacia' },
          { label: 'Vitaminas y suplementos', href: '/farmacia' },
          { label: 'Higiene y cepillado', href: '/higiene' },
        ],
      },
    ],
  },
  {
    name: 'Alimentos',
    slug: 'alimentos',
    href: '/alimentos',
    hasDropdown: false,
  },
  {
    name: 'Farmacia',
    slug: 'farmacia',
    href: '/farmacia',
    hasDropdown: false,
  },
  {
    name: 'Accesorios',
    slug: 'accesorios',
    href: '/accesorios',
    hasDropdown: false,
  },
  {
    name: 'Higiene',
    slug: 'higiene',
    href: '/higiene',
    hasDropdown: false,
  },
  {
    name: 'Snacks',
    slug: 'snacks',
    href: '/snacks',
    hasDropdown: false,
  },
  {
    name: 'Ofertas',
    slug: 'ofertas',
    href: '/ofertas',
    hasDropdown: false,
  },
  {
    name: 'Conoce FIVE',
    slug: 'conoce-five',
    href: '/conoce-five',
    hasDropdown: false,
  },
];
