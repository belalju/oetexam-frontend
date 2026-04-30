import { Routes } from '@angular/router';
import { Store } from './main/pages/store/store';
import { Home } from './main/pages/home/home';
import { ProductDetails } from './main/pages/product-details/product-details';
import { Test } from './student/pages/test/test';
import { App } from './app';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { StudentLayout } from './layout/student-layout/student-layout';
import { StudentHome } from './student/pages/student-home/student-home';
import { ExamPreparation } from './student/pages/exam-preparation/exam-preparation';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { AdminDashboard } from './admin/pages/admin-dashboard/admin-dashboard';
import { CreateTest } from './admin/pages/create-test/create-test';
import { AUTH_ROUTES } from './auth/auth.routes';
import { TestCatalog } from './student/pages/test-catalog/test-catalog';
import { adminGuard, authGuard } from './auth/guards/auth-guard';
import { MyHistory } from './student/pages/my-history/my-history';
import { Results } from './student/pages/results/results';
import { Users } from './admin/pages/users/users';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', component: Home },
            // {path:'', redirectTo:'home', pathMatch:'full'},
            {
                path:'store',
                component:Store
            },
            {
                path:'product-details',
                component:ProductDetails
            },
            { path: 'student/test', component: Test, canActivate: [authGuard] },
            
        ]
    },
    {
        path: 'auth',
        component: AuthLayout,
        loadChildren: () =>
            AUTH_ROUTES
    },
    {
        path: 'student',
        component: StudentLayout,
        children: [
            { path: 'home', component: StudentHome, canActivate: [authGuard] },
            { path: 'exam-preparation', component: ExamPreparation, canActivate: [authGuard] },
            { path: 'test-catalog', component: TestCatalog, canActivate: [authGuard] },
            { path: 'my-history', component: MyHistory, canActivate: [authGuard] },
            { path: 'results', component: Results, canActivate: [authGuard] },
            
        ]
    },
    {
        path: 'admin',
        component: AdminLayout,
        children: [
            { 
                path: 'dashboard', 
                component: AdminDashboard,
                canActivate: [authGuard, adminGuard],
            },
            { 
                path: 'create-test', 
                component: CreateTest,
                canActivate: [authGuard, adminGuard]
            },
            { 
                path: 'users', 
                component: Users,
                canActivate: [authGuard, adminGuard]
            },
        ]
    },


];
