import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'screen/home', pathMatch: 'full' },
    { path: 'index.jsp', redirectTo: 'screen/home' },
    { path: 'screen/home', loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES) },
];
