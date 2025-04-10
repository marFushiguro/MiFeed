import { Routes } from '@angular/router';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { HomePage } from './home/home.page';
import { ProfilePage } from './profile/profile.page';
import { EventsPageComponent } from './events/events.page/events.page.component';
import { MyEventsComponent } from 'src/app/my-events/my-events.component';
import { ConfirmEliminacionPage } from './confirm-eliminacion/confirm-eliminacion.page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'home', component: HomePage },
  { path: 'profile', component: ProfilePage },
  { path: 'events', component: EventsPageComponent },
  { path: 'my-events', component: MyEventsComponent },
  { path: 'confirm-eliminacion', component: ConfirmEliminacionPage },

];
