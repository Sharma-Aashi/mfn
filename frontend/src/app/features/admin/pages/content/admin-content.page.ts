import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Banner, BannerRequest } from '../../../../core/models/cms.model';
import { CmsService } from '../../../../core/services/cms.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ToastService } from '../../../../core/services/toast.service';

type Tab = 'home' | 'about' | 'contact' | 'policies' | 'banners';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-content.page.html',
})
export class AdminContentPage {
  private readonly fb = inject(FormBuilder);
  private readonly cmsService = inject(CmsService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly tab = signal<Tab>('home');
  protected readonly saving = signal(false);

  protected readonly homeForm = this.fb.nonNullable.group({
    heroTitle: [''],
    heroSubtitle: [''],
    heroPrimaryCtaText: [''],
    heroPrimaryCtaLink: [''],
    heroSecondaryCtaText: [''],
    heroSecondaryCtaLink: [''],
    heroImage: [''],
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
    ctaText: [''],
    ctaLink: [''],
    displayOrder: [0],
    active: [true],
  });

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

  private loadHome(): void {
    this.cmsService.getHome().subscribe((c) => {
      this.homeForm.reset({
        heroTitle: c.hero?.title, heroSubtitle: c.hero?.subtitle,
        heroPrimaryCtaText: c.hero?.primaryCtaText, heroPrimaryCtaLink: c.hero?.primaryCtaLink,
        heroSecondaryCtaText: c.hero?.secondaryCtaText, heroSecondaryCtaLink: c.hero?.secondaryCtaLink,
        heroImage: c.hero?.image,
        promoTitle: c.promoBanner?.title, promoSubtitle: c.promoBanner?.subtitle,
        promoCtaText: c.promoBanner?.ctaText, promoCtaLink: c.promoBanner?.ctaLink,
        newsletterHeading: c.newsletter?.heading, newsletterSubtitle: c.newsletter?.subtitle,
      });
    });
  }

  private loadAbout(): void {
    this.cmsService.getAbout().subscribe((c) => {
      this.aboutForm.reset({
        heroHeading: c.hero?.heading, heroSubtitle: c.hero?.subtitle,
        storyHeading: c.story?.heading, storyBody: c.story?.body,
        missionHeading: c.mission?.heading, missionBody: c.mission?.body,
        visionHeading: c.vision?.heading, visionBody: c.vision?.body,
        qualityHeading: c.quality?.heading, qualityBody: c.quality?.body,
        ingredientsHeading: c.ingredients?.heading, ingredientsBody: c.ingredients?.body,
        founderHeading: c.founder?.heading, founderBody: c.founder?.body, founderName: c.founder?.name,
      });
    });
  }

  private loadContact(): void {
    this.cmsService.getContact().subscribe((c) => this.contactForm.reset({ ...c.info }));
  }

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

  private loadBanners(): void {
    this.cmsService.getAllBannersForAdmin().subscribe((b) => this.banners.set(b));
  }

  protected saveHome(): void {
    const v = this.homeForm.getRawValue();
    this.saving.set(true);
    this.cmsService
      .updateHome({
        hero: {
          title: v.heroTitle, subtitle: v.heroSubtitle,
          primaryCtaText: v.heroPrimaryCtaText, primaryCtaLink: v.heroPrimaryCtaLink,
          secondaryCtaText: v.heroSecondaryCtaText, secondaryCtaLink: v.heroSecondaryCtaLink,
          image: v.heroImage,
        },
        promoBanner: { title: v.promoTitle, subtitle: v.promoSubtitle, ctaText: v.promoCtaText, ctaLink: v.promoCtaLink },
        newsletter: { heading: v.newsletterHeading, subtitle: v.newsletterSubtitle },
      })
      .subscribe({
        next: () => { this.saving.set(false); this.toast.success('Homepage content updated.'); },
        error: () => this.saving.set(false),
      });
  }

  protected saveAbout(): void {
    const v = this.aboutForm.getRawValue();
    this.saving.set(true);
    this.cmsService
      .updateAbout({
        hero: { heading: v.heroHeading, subtitle: v.heroSubtitle },
        story: { heading: v.storyHeading, body: v.storyBody },
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

  protected saveContact(): void {
    this.saving.set(true);
    this.cmsService.updateContact({ info: this.contactForm.getRawValue() }).subscribe({
      next: () => { this.saving.set(false); this.toast.success('Contact info updated.'); },
      error: () => this.saving.set(false),
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

  protected openNewBanner(): void {
    this.editingBannerId.set(null);
    this.bannerForm.reset({ displayOrder: 0, active: true });
    this.bannerFormOpen.set(true);
  }

  protected openEditBanner(b: Banner): void {
    this.editingBannerId.set(b.id);
    this.bannerForm.reset({
      title: b.title, subtitle: b.subtitle ?? '', ctaText: b.ctaText ?? '', ctaLink: b.ctaLink ?? '',
      displayOrder: b.displayOrder, active: b.active,
    });
    this.bannerFormOpen.set(true);
  }

  protected saveBanner(): void {
    const id = this.editingBannerId();
    const request: BannerRequest = this.bannerForm.getRawValue();
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
