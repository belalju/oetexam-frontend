import { Routes } from '@angular/router';
import { Store } from './main/pages/store/store';
import { Home } from './main/pages/home/home';
import { ProductDetails } from './main/pages/product-details/product-details';
import { Test } from './main/pages/test/test';
import { Registration } from './components/registration/registration';
import { Login } from './components/login/login';
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
            {
                path:'test',
                component:Test
            },
        ]
    },
    {
        path: '',
        component: AuthLayout,
        children: [
            { path: 'login', component: Login },
            { path: 'registration', component: Registration },
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
            { path: 'home', component: StudentHome },
            { path: 'exam-preparation', component: ExamPreparation },
        ]
    },
    {
        path: 'admin',
        component: AdminLayout,
        children: [
            { path: 'dashboard', component: AdminDashboard },
            { path: 'create-test', component: CreateTest },
        ]
    },


    // {path:'', redirectTo:'home', pathMatch:'full'},
    // {
    //     path:'home',
    //     component:Home
    // },
    // {
    //     path:'store',
    //     component:Store
    // },
    // {
    //     path:'product-details',
    //     component:ProductDetails
    // },
    // {
    //     path:'test',
    //     component:Test
    // },
    // {
    //     path:'registration',
    //     component:Registration
    // },
    // {
    //     path:'login',
    //     component:Login
    // },

];
