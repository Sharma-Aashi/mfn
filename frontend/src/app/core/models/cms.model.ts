export interface HeroSection {
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  image: string;
}

export interface UspItem {
  icon: string;
  title: string;
  description: string;
}

export interface UspSection {
  items: UspItem[];
}

export interface WhyItem {
  title: string;
  description: string;
}

export interface WhySection {
  heading: string;
  items: WhyItem[];
}

export interface PromoBannerSection {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

export interface NewsletterSection {
  heading: string;
  subtitle: string;
}

export interface HomeContent {
  hero: HeroSection;
  usp: UspSection;
  whyVitalora: WhySection;
  promoBanner: PromoBannerSection;
  newsletter: NewsletterSection;
}

export interface TextSection {
  heading: string;
  body: string;
  name?: string;
}

export interface AboutContent {
  hero: { heading: string; subtitle: string };
  story: TextSection;
  mission: TextSection;
  vision: TextSection;
  quality: TextSection;
  ingredients: TextSection;
  founder: TextSection;
}

export interface ContactInfo {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  businessHours: string;
}

export interface ContactContent {
  info: ContactInfo;
}

export interface PolicyContent {
  privacy: { title: string; body: string };
  terms: { title: string; body: string };
  shipping: { title: string; body: string };
  refund: { title: string; body: string };
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  displayOrder: number;
  active: boolean;
}

export interface BannerRequest {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  displayOrder?: number;
  active?: boolean;
}
