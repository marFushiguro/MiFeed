import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

// 🔥 Firebase Modular API (NO mezclar con AngularFire Compat)
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { firebaseConfig } from './services/firebase-config';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule, HttpClientModule,
    // ✅ Firebase ya se inicializa aquí, NO repetir en el constructor
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,  // ✅ Importamos solo lo necesario
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
