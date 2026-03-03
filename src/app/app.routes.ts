import { Routes } from '@angular/router';
import { Store } from './components/store/store';
import { Home } from './components/home/home';
import { ProductDetails } from './components/product-details/product-details';
import { Test } from './components/test/test';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch:'full'},
    {
        path:'home',
        component:Home
    },
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

];
