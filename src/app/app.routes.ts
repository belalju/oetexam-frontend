import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './auth/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            { path: '', loadComponent: () => import('./main/pages/home/home').then(m => m.Home) },
            { path: 'store', loadComponent: () => import('./main/pages/store/store').then(m => m.Store) },
            { path: 'product-details', loadComponent: () => import('./main/pages/product-details/product-details').then(m => m.ProductDetails) },
            { path: 'student/test', loadComponent: () => import('./student/pages/test/test').then(m => m.Test), canActivate: [authGuard] },
            { path: 'results', loadComponent: () => import('./student/pages/results/results').then(m => m.Results), canActivate: [authGuard] },
            { path: 'blogs', loadComponent: () => import('./main/pages/under-construction/under-construction').then(m => m.UnderConstruction) },
            { path: 'about-us', loadComponent: () => import('./main/pages/about-us/about-us').then(m => m.AboutUs) },
            { path: 'privacy-policy', loadComponent: () => import('./main/pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy) },
            { path: 'refund-and-return-policy', loadComponent: () => import('./main/pages/refund-and-return-policy/refund-and-return-policy').then(m => m.RefundAndReturnPolicy) },
            { path: 'terms-and-conditions', loadComponent: () => import('./main/pages/terms-and-conditions/terms-and-conditions').then(m => m.TermsAndConditions) },
            { path: 'checkout/:packageId', loadComponent: () => import('./main/pages/checkout/checkout').then(m => m.Checkout), canActivate: [authGuard] },
            { path: 'payment/success', data: { outcome: 'success' }, loadComponent: () => import('./main/pages/payment-result/payment-result').then(m => m.PaymentResult) },
            { path: 'payment/fail', data: { outcome: 'fail' }, loadComponent: () => import('./main/pages/payment-result/payment-result').then(m => m.PaymentResult) },
            { path: 'payment/cancel', data: { outcome: 'cancel' }, loadComponent: () => import('./main/pages/payment-result/payment-result').then(m => m.PaymentResult) },
        ]
    },
    {
        path: 'auth',
        loadComponent: () => import('./layout/auth-layout/auth-layout').then(m => m.AuthLayout),
        loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
    },
    {
        path: 'student',
        loadComponent: () => import('./layout/student-layout/student-layout').then(m => m.StudentLayout),
        children: [
            { path: 'home', loadComponent: () => import('./student/pages/student-home/student-home').then(m => m.StudentHome), canActivate: [authGuard] },
            { path: 'exam-preparation', loadComponent: () => import('./student/pages/exam-preparation/exam-preparation').then(m => m.ExamPreparation), canActivate: [authGuard] },
            { path: 'test-catalog', loadComponent: () => import('./student/pages/test-catalog/test-catalog').then(m => m.TestCatalog), canActivate: [authGuard] },
            { path: 'my-history', loadComponent: () => import('./student/pages/my-history/my-history').then(m => m.MyHistory), canActivate: [authGuard] },
            { path: 'results', loadComponent: () => import('./student/pages/results/results').then(m => m.Results), canActivate: [authGuard] },
        ]
    },
    {
        path: 'admin',
        loadComponent: () => import('./layout/admin-layout/admin-layout').then(m => m.AdminLayout),
        children: [
            { path: 'dashboard', loadComponent: () => import('./admin/pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard), canActivate: [authGuard, adminGuard] },
            { path: 'create-test', loadComponent: () => import('./admin/pages/create-test/create-test').then(m => m.CreateTest), canActivate: [authGuard, adminGuard] },
            { path: 'users', loadComponent: () => import('./admin/pages/users/users').then(m => m.Users) , canActivate: [authGuard, adminGuard] },
        ]
    },
];
