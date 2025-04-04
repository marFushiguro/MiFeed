import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';

// 🔥 Firebase Modular API (NO mezclar con AngularFire Compat)
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { firebaseConfig } from './services/firebase-config';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    // ✅ Firebase ya se inicializa aquí, NO repetir en el constructor
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,  // 🔥 Solo se necesita Auth, NO `AngularFireStorageModule`
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
