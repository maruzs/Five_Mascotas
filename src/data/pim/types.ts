export type PetType = 'Perros' | 'Gatos' | 'Perros Gatos';

export type CategoryType = 
  | 'Alimentos' 
  | 'Farmacia' 
  | 'Accesorios' 
  | 'Higiene' 
  | 'Snacks';

export type LifeStage = 'Cachorro' | 'Adulto' | 'Senior' | 'Todas las edades';

export interface Product {
  id: string;
  name: string;
  pet: PetType;
  brand: string;
  category: CategoryType;
  subcategory: string;
  detail: string;
  format: string;
  lifeStage: LifeStage;
  price: number;
  oldPrice: number;
  badge?: string;
  color: 'violet' | 'green' | 'peach' | 'lavender';
  image: string;
  featured?: boolean;
}

export interface MegaMenuItem {
  title: string;
  href: string;
  items: { label: string; href: string; badge?: string }[];
}

export interface NavigationCategory {
  name: string;
  slug: string;
  href: string;
  hasDropdown: boolean;
  sections?: MegaMenuItem[];
}

export interface AnnouncementTicker {
  id: string;
  text: string;
  couponCode?: string;
  couponText?: string;
  extraInfo?: string;
  active: boolean;
  order?: number;
}

export interface PromoBanner {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  disclaimer?: string;
  ctaText?: string;
  ctaHref?: string;
  couponCode?: string;
  expiresAt?: string;
  badge?: string;
  bgGradient?: string;
  categoryTarget?: string;
  petTarget?: string;
  active: boolean;
  order?: number;
}

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  active: boolean;
  order?: number;
}

export interface CmsState {
  tickers: AnnouncementTicker[];
  banners: PromoBanner[];
  heroSlides: HeroSlide[];
}
