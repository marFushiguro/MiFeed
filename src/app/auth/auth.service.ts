import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
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

  private currentUser: User | null = null;
  private username: string | null = null;
  private nombre: string | null = null;

  constructor(private router: Router) {}

  getUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  getUsername(): string | null {
    return this.username;
  }

  getNombre(): string | null {
    return this.nombre;
  }

  async register(email: string, password: string, username: string, nombre: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Guardar información adicional en Firestore
      const userRef = doc(this.db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: email,
        username: username,
        nombre: nombre,
        createdAt: new Date().toISOString(),
      });

      // Guardar valores en el servicio
      this.currentUser = user;
      this.username = username;
      this.nombre = nombre;

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
      const user = userCredential.user;
      this.currentUser = user;

      const userRef = doc(this.db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        interface UserData {
          username: string;
          nombre: string;
          email: string;
          uid: string;
          createdAt: string;
          fcmToken?: string;
        }

        const data = docSnap.data() as UserData;
        this.username = data.username;
        this.nombre = data.nombre;
        console.log('✅ Usuario autenticado:', data);
      } else {
        console.log('❌ No se encontró el documento del usuario');
        this.username = null;
        this.nombre = null;
      }

      // Guardar el token de FCM
      await this.saveToken(user.uid);

      // Redirigir a /home
      this.router.navigate(['/home']).then(() => {
        console.log('✅ Redirigido a /home');
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
      const token = await getToken(this.messaging, {
        vapidKey: 'TU_VAPID_KEY', // ← Reemplaza con tu clave real
      });

      if (token) {
        console.log('📲 Token de FCM obtenido:', token);
        const userRef = doc(this.db, 'users', userId);
        await updateDoc(userRef, { fcmToken: token });
      } else {
        console.log('⚠️ No se pudo obtener el token.');
      }
    } catch (error) {
      console.error('❌ Error al obtener token:', error);
    }
  }

  logout() {
    signOut(this.auth);
    this.username = null;
    this.nombre = null;
    this.currentUser = null;
    this.router.navigate(['/login']);
  }
}
