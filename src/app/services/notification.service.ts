import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from 'src/app/services/firebase-config'; 

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private messaging = getMessaging(initializeApp(firebaseConfig));

  constructor() {}

  // Solicitar permisos y obtener el token
  async requestPermission(): Promise<string | null> {
    try {
      const token = await getToken(this.messaging, { vapidKey: 'TU_CLAVE_VAPID' });
      if (token) {
        console.log('✅ Token FCM obtenido:', token);
        return token;
      } else {
        console.warn('⚠️ No se pudo obtener el token FCM.');
        return null;
      }
    } catch (error) {
      console.error('❌ Error obteniendo token FCM:', error);
      return null;
    }
  }

  // Escuchar mensajes en tiempo real
  listenForMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('📩 Notificación recibida:', payload);
      alert(`🔔 ${payload.notification?.title}: ${payload.notification?.body}`);
    });
  }
}
