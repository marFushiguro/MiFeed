import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { NotificationService } from 'src/app/services/notification.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class LoginPage {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private firestoreService: FirestoreService,
    private notificationService: NotificationService
  ) {}

  async login() {
    if (!this.email.trim() || !this.password.trim()) {
      alert('Por favor completa todos los campos.');
      return;
    }

    if (this.password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      const userCredential = await this.authService.login(this.email, this.password);
      const user = userCredential.user;

      if (!user) {
        throw new Error("No se pudo obtener la información del usuario");
      }

      console.log('✅ Login exitoso, UID:', user.uid);

      const fcmToken = await this.notificationService.requestPermission();

      if (fcmToken) {
        console.log('✅ Token FCM obtenido:', fcmToken);
        await this.firestoreService.saveFcmToken(user.uid, fcmToken);
        console.log('✅ Token FCM guardado en Firestore');
      } else {
        console.warn('⚠️ No se obtuvo token FCM');
      }

      this.notificationService.listenForMessages();

      await this.router.navigate(['/home']);
      console.log('✅ Redirigido a /home');
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      alert(error instanceof Error ? error.message : 'Error inesperado');
    }
  }
}
