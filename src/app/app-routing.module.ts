import { Routes, RouterModule } from '@angular/router';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { HomePage } from './home/home.page'; // Importa la página de inicio
import { ProfilePage } from './profile/profile.page';
import { EventsPageComponent } from 'src/app/events/events.page/events.page.component';
import { MyEventsComponent } from 'src/app/my-events/my-events.component'; 
import { ConfirmEliminacionPage } from './confirm-eliminacion/confirm-eliminacion.page';





const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./register/register.page').then(m => m.RegisterPage) },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage)
  },
  //{ path: 'profile', component: ProfilePage },
  {
    path: 'add-post',
    loadChildren: () => import('./add-post/add-post.module').then( m => m.AddPostPageModule)
  },
  {
    path: 'events',
    loadComponent: () => import('./events/events.page/events.page.component').then(m => m.EventsPageComponent)

  },
  {
    path: 'my-events',
    loadComponent: () => import('./my-events/my-events.component').then(m => m.MyEventsComponent)
  },
  {
    path: 'confirm-eliminacion',
    loadComponent: () => import('./confirm-eliminacion/confirm-eliminacion.page').then(m => m.ConfirmEliminacionPage)
  },
 
  
];


export const AppRoutingModule = RouterModule.forRoot(routes);
