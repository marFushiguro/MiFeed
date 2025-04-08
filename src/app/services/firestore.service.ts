import { Injectable } from '@angular/core';
import {
  getFirestore, collection, addDoc, Timestamp, getDocs, doc,
  updateDoc, deleteDoc, getDoc
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase-config';
import { DocumentData } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);

// Interfaces fuera de la clase
export interface Submission {
  userId: string;
  imageUrl: string;
  timestamp: Timestamp;
  likes: number;
  likedBy: string[];
}

export interface Evento {
  id?: string;
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  reglas: string[];
  userId: string;
  userName: string;        // 👈 Nuevo
  userPhoto: string; 
  timestamp: Timestamp;
  submissions: Submission[];
  finalizado: boolean;
  ganador: Submission | null;
  comments?: Comment[];
}

export interface Comment {
  text: string;
  userId: string;
  timestamp: Timestamp;
  likes: number;
  likedBy: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private db = getFirestore(app);

  constructor() {}

  // Crear un post
  async createPost(postText: string, imageUrl: string, url: string, location: string, userId: string, username: string) {
    try {
      const postRef = await addDoc(collection(this.db, 'posts'), {
        text: postText,
        imageUrl,
        url,
        location,
        userId,
        username,
        timestamp: Timestamp.fromDate(new Date()),
        likes: 0,
        likedBy: []
      });
      console.log('✅ Post creado con ID:', postRef.id);
    } catch (e) {
      console.error('❌ Error añadiendo el post:', e);
    }
  }

  // Actualizar un post
  async updatePost(postId: string, updatedData: { text?: string; imageUrl?: string; url?: string; location?: string }) {
    try {
      const postRef = doc(this.db, 'posts', postId);
      await updateDoc(postRef, updatedData);
      console.log('✅ Post actualizado:', postId);
    } catch (error) {
      console.error('❌ Error al actualizar post:', error);
    }
  }

  // Eliminar un post
  async deletePost(postId: string) {
    try {
      const postRef = doc(this.db, 'posts', postId);
      await deleteDoc(postRef);
      console.log('🗑️ Post eliminado:', postId);
    } catch (error) {
      console.error('❌ Error al eliminar post:', error);
    }
  }

  // Obtener todos los posts
  async getPosts() {
    try {
      const postsCollection = collection(this.db, 'posts');
      const snapshot = await getDocs(postsCollection);
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) }));
    } catch (e) {
      console.error('❌ Error obteniendo posts:', e);
      return [];
    }
  }

  // Toggle de like para un post
  async toggleLike(postId: string, userId: string) {
    try {
      const postRef = doc(this.db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      if (!postSnap.exists()) return;

      const postData = postSnap.data();
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

  // Guardar token FCM
  async saveFcmToken(userId: string, fcmToken: string) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);
      await updateDoc(userRef, { fcmToken });
      console.log('✅ Token FCM guardado/actualizado:', userId);
    } catch (error) {
      console.error('❌ Error guardando el token FCM:', error);
    }
  }

  // 🎉 Eventos
  async createEvento(evento: Evento) {
    try {
      await addDoc(collection(this.db, 'eventos'), evento);
      console.log('✅ Evento creado');
    } catch (error) {
      console.error('❌ Error creando evento:', error);
    }
  }

  async getEvents(): Promise<Evento[]> {
    try {
      const eventsCollection = collection(this.db, 'eventos');
      const snapshot = await getDocs(eventsCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Evento)
      }));
    } catch (e) {
      console.error('❌ Error obteniendo eventos:', e);
      return [];
    }
  }
  
  // Actualizar un evento
  async updateEvento(eventId: string, updatedData: Partial<Evento>) {
    try {
      const eventRef = doc(this.db, 'eventos', eventId);
  
      // Convertir el objeto de Evento a un formato adecuado para Firestore
      const eventData: { [key: string]: any } = {
        titulo: updatedData.titulo,
        descripcion: updatedData.descripcion,
        fechaLimite: updatedData.fechaLimite,
        reglas: updatedData.reglas,
        userId: updatedData.userId,
        timestamp: updatedData.timestamp,
        submissions: updatedData.submissions,
        finalizado: updatedData.finalizado,
        ganador: updatedData.ganador,
        comments: updatedData.comments,
      };
  
      await updateDoc(eventRef, eventData);
      console.log('✅ Evento actualizado:', eventId);
    } catch (error) {
      console.error('❌ Error al actualizar evento:', error);
    }
  }
  

  // Eliminar un evento
  async deleteEvento(eventId: string) {
    try {
      const eventRef = doc(this.db, 'eventos', eventId);
      await deleteDoc(eventRef);
      console.log('🗑️ Evento eliminado:', eventId);
    } catch (error) {
      console.error('❌ Error al eliminar evento:', error);
    }
  }



  async addSubmission(eventoId: string, submission: Submission) {
    try {
      const eventoRef = doc(this.db, 'eventos', eventoId);
      const eventoSnap = await getDoc(eventoRef);
      if (!eventoSnap.exists()) return;

      const prevSubmissions: Submission[] = eventoSnap.data()['submissions'] || [];
      const updated = [...prevSubmissions, submission];

      await updateDoc(eventoRef, { submissions: updated });
      console.log('📸 Imagen agregada al evento');
    } catch (error) {
      console.error('❌ Error al agregar imagen al evento:', error);
    }
  }

  async likeSubmission(eventoId: string, submissionIndex: number, userId: string) {
    try {
      const eventoRef = doc(this.db, 'eventos', eventoId);
      const eventoSnap = await getDoc(eventoRef);
      if (!eventoSnap.exists()) return;

      const eventoData = eventoSnap.data();
      const submissions: Submission[] = eventoData['submissions'] || [];

      let sub = submissions[submissionIndex];
      if (!sub.likedBy.includes(userId)) {
        sub.likes++;
        sub.likedBy.push(userId);
      } else {
        sub.likes--;
        sub.likedBy = sub.likedBy.filter(id => id !== userId);
      }

      submissions[submissionIndex] = sub;
      await updateDoc(eventoRef, { submissions });
      console.log('✅ Like en imagen de evento actualizado');
    } catch (error) {
      console.error('❌ Error actualizando like en submission:', error);
    }
  }

  async finalizarEvento(eventoId: string) {
    try {
      const eventoRef = doc(this.db, 'eventos', eventoId);
      const eventoSnap = await getDoc(eventoRef);
      if (!eventoSnap.exists()) return;

      const submissions: Submission[] = eventoSnap.data()['submissions'] || [];
      const ganador = submissions.reduce((prev, curr) => (curr.likes > prev.likes ? curr : prev), submissions[0]);

      await updateDoc(eventoRef, {
        finalizado: true,
        ganador
      });

      console.log('🏁 Evento finalizado, ganador:', ganador.userId);
    } catch (error) {
      console.error('❌ Error al finalizar evento:', error);
    }
  }

  // Método para agregar un comentario a un evento
  async addComment(eventoId: string, comment: Comment) {
    try {
      const eventoRef = doc(this.db, 'eventos', eventoId);
      const eventoSnap = await getDoc(eventoRef);
      if (!eventoSnap.exists()) return;

      const eventoData = eventoSnap.data();
      const comments = eventoData['comments'] || [];

      comments.push(comment);  // Añadimos el nuevo comentario al array de comentarios

      await updateDoc(eventoRef, { comments });
      console.log('✅ Comentario añadido al evento');
    } catch (error) {
      console.error('❌ Error al agregar comentario:', error);
    }
  }

  // Método para dar like a un comentario
  async likeComment(eventoId: string, commentIndex: number, userId: string) {
    try {
      const eventoRef = doc(this.db, 'eventos', eventoId);
      const eventoSnap = await getDoc(eventoRef);
      if (!eventoSnap.exists()) return;

      const eventoData = eventoSnap.data();
      const comments = eventoData['comments'] || [];
      const comment = comments[commentIndex];

      if (!comment.likedBy.includes(userId)) {
        comment.likes++;
        comment.likedBy.push(userId);
      } else {
        comment.likes--;
        comment.likedBy = comment.likedBy.filter((id: string) => id !== userId);

      }

      comments[commentIndex] = comment;  // Actualizamos el comentario con los likes modificados

      await updateDoc(eventoRef, { comments });
      console.log('✅ Like actualizado en comentario');
    } catch (error) {
      console.error('❌ Error al manejar el like en comentario:', error);
    }
  }
}
