export interface BrandSettings {
  name: string;
  tagline: string;
  /** Empty string means "use the built-in leaf mark". */
  logoUrl: string;
}

export interface FooterSettings {
  about: string;
  copyrightName: string;
}

export interface SocialSettings {
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
}

export interface NavLink {
  label: string;
  path: string;
}

export interface NavSettings {
  links: NavLink[];
}

export interface ThemeSettings {
  /** Key of a theme defined in styles/_themes.scss. Unknown keys fall back to the default. */
  key: string;
}

export interface CommerceSettings {
  freeShippingThreshold: number;
  shippingFee: number;
  estimatedDeliveryDays: number;
}

export interface SiteSettings {
  brand: BrandSettings;
  theme: ThemeSettings;
  footer: FooterSettings;
  social: SocialSettings;
  nav: NavSettings;
  commerce: CommerceSettings;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand: { name: 'VITALORA', tagline: 'Better Health. Better Every Day.', logoUrl: '' },
  theme: { key: 'emerald' },
  footer: {
    about: 'Better Health. Better Every Day. Premium, science-backed supplements for modern wellness routines.',
    copyrightName: 'VITALORA Wellness Pvt. Ltd.',
  },
  social: { instagram: '', facebook: '', twitter: '', youtube: '' },
  nav: {
    links: [
      { label: 'Home', path: '/' },
      { label: 'Shop', path: '/products' },
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'FAQ', path: '/faq' },
    ],
  },
  commerce: { freeShippingThreshold: 999, shippingFee: 79, estimatedDeliveryDays: 5 },
};
