import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, Timestamp, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase-config';
import { DocumentData } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private db = getFirestore(initializeApp(firebaseConfig));

  constructor() {}

  // Crear un nuevo post
  async createPost(postText: string, imageUrl: string, url: string, location: string, userId: string) {
    try {
      const postRef = await addDoc(collection(this.db, 'posts'), {
        text: postText,
        imageUrl: imageUrl,
        url: url,
        location: location,
        userId: userId,
        timestamp: Timestamp.fromDate(new Date()),
        likes: 0,
        likedBy: []
      });
      console.log('✅ Post creado con ID:', postRef.id);
    } catch (e) {
      console.error('❌ Error añadiendo el post:', e);
    }
  }

  // Guardar el token FCM del usuario en Firestore
  async saveFcmToken(userId: string, fcmToken: string) {
    try {
      const userRef = doc(this.db, 'users', userId);
      // Verificamos si el documento del usuario ya existe
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        // Si el documento ya existe, actualizamos el token
        await updateDoc(userRef, { fcmToken });
        console.log('✅ Token FCM actualizado para el usuario:', userId);
      } else {
        // Si no existe el documento, lo creamos con el token FCM
        await updateDoc(userRef, { fcmToken });
        console.log('✅ Token FCM guardado para el usuario:', userId);
      }
    } catch (error) {
      console.error('❌ Error guardando el token FCM:', error);
    }
  }

  // Obtener todos los posts
  async getPosts() {
    try {
      const postsCollection = collection(this.db, 'posts');
      const snapshot = await getDocs(postsCollection);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) }));
      console.log('📢 Posts cargados:', posts);
      return posts;
    } catch (e) {
      console.error('❌ Error obteniendo posts:', e);
      return [];
    }
  }

  // Manejar el Like de un post
  async toggleLike(postId: string, userId: string) {
    try {
      const postRef = doc(this.db, 'posts', postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        console.error('❌ El post no existe');
        return;
      }

      let postData = postSnap.data() as DocumentData;
      let likedBy: string[] = postData['likedBy'] || [];
      let likes: number = postData['likes'] || 0;

      if (likedBy.includes(userId)) {
        likedBy = likedBy.filter(id => id !== userId);
        likes--;
      } else {
        likedBy.push(userId);
        likes++;
      }

      await updateDoc(postRef, { likedBy, likes });

      console.log('👍 Like actualizado en post:', postId);
    } catch (error) {
      console.error('❌ Error al manejar el like:', error);
    }
  }
}
