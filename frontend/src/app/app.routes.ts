import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { adminGuestGuard, guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/pages/product-list/product-list.page').then((m) => m.ProductListPage),
  },
  {
    path: 'products/:slug',
    loadComponent: () =>
      import('./features/products/pages/product-detail/product-detail.page').then((m) => m.ProductDetailPage),
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./features/checkout/pages/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'checkout/confirmation/:orderNumber',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/pages/order-confirmation.page').then((m) => m.OrderConfirmationPage),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.page').then((m) => m.ContactPage),
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/faq/faq.page').then((m) => m.FaqPage),
  },
  {
    path: 'policies/:slug',
    loadComponent: () => import('./features/faq/policy.page').then((m) => m.PolicyPage),
  },

  // ---- Account ----
  {
    path: 'account/login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/account/pages/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'account/register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/account/pages/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'account/forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/account/pages/forgot-password.page').then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'account/reset-password',
    loadComponent: () => import('./features/account/pages/reset-password.page').then((m) => m.ResetPasswordPage),
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/account-layout.page').then((m) => m.AccountLayoutPage),
    children: [
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
      { path: 'profile', loadComponent: () => import('./features/account/pages/profile.page').then((m) => m.ProfilePage) },
      { path: 'orders', loadComponent: () => import('./features/account/pages/orders.page').then((m) => m.OrdersPage) },
      { path: 'orders/:id', loadComponent: () => import('./features/account/pages/order-detail.page').then((m) => m.OrderDetailPage) },
      { path: 'wishlist', loadComponent: () => import('./features/account/pages/wishlist.page').then((m) => m.WishlistPage) },
      { path: 'addresses', loadComponent: () => import('./features/account/pages/addresses.page').then((m) => m.AddressesPage) },
    ],
  },

  // ---- Admin ----
  {
    path: 'admin/login',
    canActivate: [adminGuestGuard],
    loadComponent: () => import('./features/admin/pages/login/admin-login.page').then((m) => m.AdminLoginPage),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/layout/admin-layout.page').then((m) => m.AdminLayoutPage),
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', loadComponent: () => import('./features/admin/pages/products/admin-product-list.page').then((m) => m.AdminProductListPage) },
      { path: 'products/new', loadComponent: () => import('./features/admin/pages/products/admin-product-form.page').then((m) => m.AdminProductFormPage) },
      { path: 'products/:id/edit', loadComponent: () => import('./features/admin/pages/products/admin-product-form.page').then((m) => m.AdminProductFormPage) },
      { path: 'categories', loadComponent: () => import('./features/admin/pages/categories/admin-category-list.page').then((m) => m.AdminCategoryListPage) },
      { path: 'inventory', loadComponent: () => import('./features/admin/pages/inventory/admin-inventory.page').then((m) => m.AdminInventoryPage) },
      { path: 'reviews', loadComponent: () => import('./features/admin/pages/reviews/admin-reviews.page').then((m) => m.AdminReviewsPage) },
      { path: 'faqs', loadComponent: () => import('./features/admin/pages/faqs/admin-faqs.page').then((m) => m.AdminFaqsPage) },
      { path: 'content', loadComponent: () => import('./features/admin/pages/content/admin-content.page').then((m) => m.AdminContentPage) },
      { path: 'messages', loadComponent: () => import('./features/admin/pages/messages/admin-messages.page').then((m) => m.AdminMessagesPage) },
      { path: 'settings', loadComponent: () => import('./features/admin/pages/settings/admin-settings.page').then((m) => m.AdminSettingsPage) },
      { path: 'account', loadComponent: () => import('./features/admin/pages/account/admin-account.page').then((m) => m.AdminAccountPage) },
    ],
  },

  {
    path: '404',
    loadComponent: () => import('./shared/components/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
  { path: '**', redirectTo: '404' },
];
