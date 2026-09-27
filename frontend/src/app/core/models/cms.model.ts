export interface HeroSection {
  /** Small badge above the headline; hidden when empty. */
  eyebrow?: string;
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
  /**
   * The founder's note under the heading. It is the one paragraph on the home
   * page a competitor cannot copy, so it gets its own field rather than being
   * squeezed into an item.
   */
  body?: string;
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

/**
 * One block of the home page, as the admin arranges it.
 *
 * <p>The array's order is the page's order, so reordering is a drag rather
 * than a migration. `key` binds the row to the markup that renders it, which
 * is why it is not editable: the heading is the words, the key is the block.
 */
export interface HomeSection {
  /** Which block this row controls. Fixed — the admin edits around it. */
  key: string;
  /** What the section calls itself on the page. Empty hides the title only. */
  heading: string;
  visible: boolean;
  /**
   * For the two banner blocks: which shipped photograph to use. Chosen from a
   * fixed list rather than uploaded, because the API's upload folder is wiped
   * on every container restart.
   */
  image?: string;
}

export interface HomeContent {
  hero: HeroSection;
  usp: UspSection;
  whyVitalora: WhySection;
  promoBanner: PromoBannerSection;
  newsletter: NewsletterSection;
  /** Missing on an older database; the page then falls back to its built-in order. */
  sections?: HomeSection[];
}

export interface TextSection {
  heading: string;
  body: string;
  name?: string;
}

export interface AboutContent {
  hero: { heading: string; subtitle: string };
  story: TextSection;
  storyImage?: { url: string };
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
  /** Google Maps "Embed a map" iframe src URL; empty hides the map. */
  mapEmbedUrl?: string;
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
