import { Routes } from '@angular/router';
import { Store } from './components/store/store';
import { Home } from './components/home/home';
import { ProductDetails } from './components/product-details/product-details';
import { Test } from './components/test/test';
import { Registration } from './components/registration/registration';
import { Login } from './components/login/login';
import { App } from './app';
import { MainLayout } from './components/layout/main-layout/main-layout';
import { AuthLayout } from './components/layout/auth-layout/auth-layout';
import { StudentLayout } from './components/layout/student-layout/student-layout';
import { StudentHome } from './components/student/student-home/student-home';
import { ExamPreparation } from './components/student/exam-preparation/exam-preparation';
import { AdminLayout } from './components/layout/admin-layout/admin-layout';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';
import { CreateTest } from './components/admin/create-test/create-test';

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
