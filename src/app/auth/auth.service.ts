import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '../services/firebase-config';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private app = initializeApp(firebaseConfig);
  private auth = getAuth(this.app);
  private db = getFirestore(this.app);
  private messaging = getMessaging(this.app);

  constructor(private router: Router) {}

  // Método para obtener el ID del usuario autenticado
  getUserId(): string | null {
    const user = this.auth.currentUser;
    return user ? user.uid : null;
  }

  async register(email: string, password: string, username: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Guardar información adicional en Firestore
      const userRef = doc(this.db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: email,
        username: username,
        createdAt: new Date().toISOString(),
      });

      // Obtener y guardar el token de FCM
      await this.saveToken(user.uid);

      return userCredential;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Ocurrió un error inesperado');
    }
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Usuario autenticado:', userCredential.user);
      
      // Guardar el token de FCM después del login
      await this.saveToken(userCredential.user.uid);
      
      this.router.navigate(['/home']).then(() => {
        console.log('✅ Redirigido a /home');
      }).catch(err => {
        console.error('❌ Error en la redirección:', err);
      });
  
      return userCredential;
    } catch (error: unknown) {
      console.error('❌ Error en login:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Ocurrió un error inesperado');
    }
  }

  async saveToken(userId: string) {
    try {
      const token = await getToken(this.messaging, { vapidKey: "TU_VAPID_KEY" });

      if (token) {
        console.log("📲 Token de FCM obtenido:", token);
        const userRef = doc(this.db, 'users', userId);
        await updateDoc(userRef, { fcmToken: token });
      } else {
        console.log("⚠️ No se pudo obtener el token.");
      }
    } catch (error) {
      console.error("❌ Error al obtener token:", error);
    }
  }

  logout() {
    signOut(this.auth);
    this.router.navigate(['/login']);
  }
}
