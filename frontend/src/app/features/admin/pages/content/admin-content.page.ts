import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Banner, BannerRequest } from '../../../../core/models/cms.model';
import { MediaUrlPipe } from '../../../../core/pipes/media-url.pipe';
import { CmsService } from '../../../../core/services/cms.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ImageUploadFieldComponent } from '../../../../shared/components/image-upload-field/image-upload-field.component';

type Tab = 'home' | 'about' | 'contact' | 'policies' | 'banners';

type UspItemGroup = FormGroup<{ icon: FormControl<string>; title: FormControl<string>; description: FormControl<string> }>;
type WhyItemGroup = FormGroup<{ title: FormControl<string>; description: FormControl<string> }>;

/** Icon keys the homepage USP strip knows how to draw. */
export const USP_ICON_OPTIONS = [
  { value: 'shield-check', label: 'Shield (quality/safety)' },
  { value: 'leaf', label: 'Leaf (natural/clean)' },
  { value: 'flask', label: 'Flask (science)' },
  { value: 'ban', label: 'Ban (no additives)' },
];

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [ReactiveFormsModule, ImageUploadFieldComponent, MediaUrlPipe],
  templateUrl: './admin-content.page.html',
})
export class AdminContentPage {
  private readonly fb = inject(FormBuilder);
  private readonly cmsService = inject(CmsService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly tabs: { key: Tab; label: string }[] = [
    { key: 'home', label: 'Homepage' },
    { key: 'about', label: 'About Us' },
    { key: 'contact', label: 'Contact Us' },
    { key: 'policies', label: 'Policies' },
    { key: 'banners', label: 'Banners' },
  ];
  protected readonly policyKeys = [
    { key: 'privacy', label: 'Privacy Policy' },
    { key: 'terms', label: 'Terms & Conditions' },
    { key: 'shipping', label: 'Shipping Policy' },
    { key: 'refund', label: 'Returns & Refunds' },
  ];
  protected readonly uspIconOptions = USP_ICON_OPTIONS;

  protected readonly tab = signal<Tab>('home');
  protected readonly saving = signal(false);

  protected readonly homeForm = this.fb.nonNullable.group({
    heroEyebrow: [''],
    heroTitle: [''],
    heroSubtitle: [''],
    heroPrimaryCtaText: [''],
    heroPrimaryCtaLink: [''],
    heroSecondaryCtaText: [''],
    heroSecondaryCtaLink: [''],
    heroImage: [''],
    uspItems: new FormArray<UspItemGroup>([]),
    whyHeading: [''],
    whyItems: new FormArray<WhyItemGroup>([]),
    promoTitle: [''],
    promoSubtitle: [''],
    promoCtaText: [''],
    promoCtaLink: [''],
    newsletterHeading: [''],
    newsletterSubtitle: [''],
  });

  protected readonly aboutForm = this.fb.nonNullable.group({
    heroHeading: [''],
    heroSubtitle: [''],
    storyHeading: [''],
    storyBody: [''],
    storyImage: [''],
    missionHeading: [''],
    missionBody: [''],
    visionHeading: [''],
    visionBody: [''],
    qualityHeading: [''],
    qualityBody: [''],
    ingredientsHeading: [''],
    ingredientsBody: [''],
    founderHeading: [''],
    founderBody: [''],
    founderName: [''],
  });

  protected readonly contactForm = this.fb.nonNullable.group({
    companyName: [''],
    email: [''],
    phone: [''],
    address: [''],
    businessHours: [''],
    mapEmbedUrl: [''],
  });

  protected readonly policiesForm = this.fb.nonNullable.group({
    privacyTitle: [''],
    privacyBody: [''],
    termsTitle: [''],
    termsBody: [''],
    shippingTitle: [''],
    shippingBody: [''],
    refundTitle: [''],
    refundBody: [''],
  });

  protected readonly banners = signal<Banner[]>([]);
  protected readonly bannerFormOpen = signal(false);
  protected readonly editingBannerId = signal<number | null>(null);
  protected readonly bannerForm = this.fb.nonNullable.group({
    title: [''],
    subtitle: [''],
    imageUrl: [''],
    ctaText: [''],
    ctaLink: [''],
    displayOrder: [0],
    active: [true],
  });

  protected get uspItems(): FormArray<UspItemGroup> {
    return this.homeForm.controls.uspItems;
  }

  protected get whyItems(): FormArray<WhyItemGroup> {
    return this.homeForm.controls.whyItems;
  }

  constructor() {
    inject(SeoService).update('Website Content');
    this.loadHome();
    this.loadAbout();
    this.loadContact();
    this.loadPolicies();
    this.loadBanners();
  }

  protected setTab(tab: Tab): void {
    this.tab.set(tab);
  }

  // ---------------------------------------------------------------- homepage

  private uspItemGroup(icon = 'leaf', title = '', description = ''): UspItemGroup {
    return this.fb.nonNullable.group({ icon: [icon], title: [title], description: [description] });
  }

  private whyItemGroup(title = '', description = ''): WhyItemGroup {
    return this.fb.nonNullable.group({ title: [title], description: [description] });
  }

  protected addUspItem(): void {
    this.uspItems.push(this.uspItemGroup());
  }

  protected addWhyItem(): void {
    this.whyItems.push(this.whyItemGroup());
  }

  protected moveItem(array: FormArray, index: number, delta: -1 | 1): void {
    const target = index + delta;
    if (target < 0 || target >= array.length) return;
    const control = array.at(index);
    array.removeAt(index);
    array.insert(target, control);
  }

  private loadHome(): void {
    this.cmsService.getHome().subscribe((c) => {
      this.homeForm.patchValue({
        heroEyebrow: c.hero?.eyebrow ?? '',
        heroTitle: c.hero?.title, heroSubtitle: c.hero?.subtitle,
        heroPrimaryCtaText: c.hero?.primaryCtaText, heroPrimaryCtaLink: c.hero?.primaryCtaLink,
        heroSecondaryCtaText: c.hero?.secondaryCtaText, heroSecondaryCtaLink: c.hero?.secondaryCtaLink,
        heroImage: c.hero?.image,
        whyHeading: c.whyVitalora?.heading,
        promoTitle: c.promoBanner?.title, promoSubtitle: c.promoBanner?.subtitle,
        promoCtaText: c.promoBanner?.ctaText, promoCtaLink: c.promoBanner?.ctaLink,
        newsletterHeading: c.newsletter?.heading, newsletterSubtitle: c.newsletter?.subtitle,
      });
      this.uspItems.clear();
      (c.usp?.items ?? []).forEach((i) => this.uspItems.push(this.uspItemGroup(i.icon, i.title, i.description)));
      this.whyItems.clear();
      (c.whyVitalora?.items ?? []).forEach((i) => this.whyItems.push(this.whyItemGroup(i.title, i.description)));
      this.homeForm.markAsPristine();
    });
  }

  protected saveHome(): void {
    const v = this.homeForm.getRawValue();
    this.saving.set(true);
    this.cmsService
      .updateHome({
        hero: {
          eyebrow: v.heroEyebrow,
          title: v.heroTitle, subtitle: v.heroSubtitle,
          primaryCtaText: v.heroPrimaryCtaText, primaryCtaLink: v.heroPrimaryCtaLink,
          secondaryCtaText: v.heroSecondaryCtaText, secondaryCtaLink: v.heroSecondaryCtaLink,
          image: v.heroImage,
        },
        usp: { items: v.uspItems.filter((i) => i.title.trim()) },
        whyVitalora: { heading: v.whyHeading, items: v.whyItems.filter((i) => i.title.trim()) },
        promoBanner: { title: v.promoTitle, subtitle: v.promoSubtitle, ctaText: v.promoCtaText, ctaLink: v.promoCtaLink },
        newsletter: { heading: v.newsletterHeading, subtitle: v.newsletterSubtitle },
      })
      .subscribe({
        next: () => { this.saving.set(false); this.homeForm.markAsPristine(); this.toast.success('Homepage content updated.'); },
        error: () => this.saving.set(false),
      });
  }

  // ------------------------------------------------------------------- about

  private loadAbout(): void {
    this.cmsService.getAbout().subscribe((c) => {
      this.aboutForm.reset({
        heroHeading: c.hero?.heading, heroSubtitle: c.hero?.subtitle,
        storyHeading: c.story?.heading, storyBody: c.story?.body,
        storyImage: c.storyImage?.url ?? '',
        missionHeading: c.mission?.heading, missionBody: c.mission?.body,
        visionHeading: c.vision?.heading, visionBody: c.vision?.body,
        qualityHeading: c.quality?.heading, qualityBody: c.quality?.body,
        ingredientsHeading: c.ingredients?.heading, ingredientsBody: c.ingredients?.body,
        founderHeading: c.founder?.heading, founderBody: c.founder?.body, founderName: c.founder?.name,
      });
    });
  }

  protected saveAbout(): void {
    const v = this.aboutForm.getRawValue();
    this.saving.set(true);
    this.cmsService
      .updateAbout({
        hero: { heading: v.heroHeading, subtitle: v.heroSubtitle },
        story: { heading: v.storyHeading, body: v.storyBody },
        storyImage: { url: v.storyImage },
        mission: { heading: v.missionHeading, body: v.missionBody },
        vision: { heading: v.visionHeading, body: v.visionBody },
        quality: { heading: v.qualityHeading, body: v.qualityBody },
        ingredients: { heading: v.ingredientsHeading, body: v.ingredientsBody },
        founder: { heading: v.founderHeading, body: v.founderBody, name: v.founderName },
      })
      .subscribe({
        next: () => { this.saving.set(false); this.toast.success('About page content updated.'); },
        error: () => this.saving.set(false),
      });
  }

  // ----------------------------------------------------------------- contact

  private loadContact(): void {
    this.cmsService.getContact().subscribe((c) => this.contactForm.reset({ mapEmbedUrl: '', ...c.info }));
  }

  protected saveContact(): void {
    const info = this.contactForm.getRawValue();
    info.mapEmbedUrl = this.extractMapSrc(info.mapEmbedUrl);
    this.contactForm.patchValue({ mapEmbedUrl: info.mapEmbedUrl });
    this.saving.set(true);
    this.cmsService.updateContact({ info }).subscribe({
      next: () => { this.saving.set(false); this.toast.success('Contact info updated.'); },
      error: () => this.saving.set(false),
    });
  }

  /** Accepts either the bare embed URL or the full <iframe ...> snippet Google Maps gives you. */
  private extractMapSrc(value: string): string {
    const trimmed = value.trim();
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : trimmed;
  }

  // ---------------------------------------------------------------- policies

  private loadPolicies(): void {
    this.cmsService.getPolicies().subscribe((c) => {
      this.policiesForm.reset({
        privacyTitle: c.privacy?.title, privacyBody: c.privacy?.body,
        termsTitle: c.terms?.title, termsBody: c.terms?.body,
        shippingTitle: c.shipping?.title, shippingBody: c.shipping?.body,
        refundTitle: c.refund?.title, refundBody: c.refund?.body,
      });
    });
  }

  protected savePolicies(): void {
    const v = this.policiesForm.getRawValue();
    this.saving.set(true);
    this.cmsService
      .updatePolicies({
        privacy: { title: v.privacyTitle, body: v.privacyBody },
        terms: { title: v.termsTitle, body: v.termsBody },
        shipping: { title: v.shippingTitle, body: v.shippingBody },
        refund: { title: v.refundTitle, body: v.refundBody },
      })
      .subscribe({
        next: () => { this.saving.set(false); this.toast.success('Policies updated.'); },
        error: () => this.saving.set(false),
      });
  }

  // ----------------------------------------------------------------- banners

  private loadBanners(): void {
    this.cmsService.getAllBannersForAdmin().subscribe((b) => this.banners.set(b));
  }

  protected openNewBanner(): void {
    this.editingBannerId.set(null);
    this.bannerForm.reset({ title: '', subtitle: '', imageUrl: '', ctaText: '', ctaLink: '', displayOrder: 0, active: true });
    this.bannerFormOpen.set(true);
  }

  protected openEditBanner(b: Banner): void {
    this.editingBannerId.set(b.id);
    this.bannerForm.reset({
      title: b.title, subtitle: b.subtitle ?? '', imageUrl: b.imageUrl ?? '',
      ctaText: b.ctaText ?? '', ctaLink: b.ctaLink ?? '',
      displayOrder: b.displayOrder, active: b.active,
    });
    this.bannerFormOpen.set(true);
  }

  protected saveBanner(): void {
    const request: BannerRequest = this.bannerForm.getRawValue();
    if (!request.title.trim()) {
      this.toast.error('Banner title is required.');
      return;
    }
    const id = this.editingBannerId();
    const obs = id ? this.cmsService.updateBanner(id, request) : this.cmsService.createBanner(request);
    obs.subscribe(() => {
      this.bannerFormOpen.set(false);
      this.toast.success(id ? 'Banner updated.' : 'Banner created.');
      this.loadBanners();
    });
  }

  protected toggleBannerStatus(b: Banner): void {
    this.cmsService.updateBannerStatus(b.id, !b.active).subscribe(() => this.loadBanners());
  }

  protected async removeBanner(b: Banner): Promise<void> {
    const confirmed = await this.confirmService.confirm({ title: 'Delete banner', message: `Delete "${b.title}"?`, confirmText: 'Delete', danger: true });
    if (!confirmed) return;
    this.cmsService.deleteBanner(b.id).subscribe(() => {
      this.toast.success('Banner deleted.');
      this.loadBanners();
    });
  }
}
