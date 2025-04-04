import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FirestoreService } from './firestore.service';  // Importa el servicio de Firestore

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(private storage: AngularFireStorage, private firestoreService: FirestoreService) {}

  // Subir imagen al storage
  uploadImage(file: File, path: string): Observable<string> {
    const fileRef = this.storage.ref(path);
    const task = this.storage.upload(path, file);

    return new Observable((observer) => {
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(
            (url) => {
              console.log('Imagen subida correctamente. URL:', url);
              observer.next(url);
              observer.complete();
            },
            (error) => observer.error(error)
          );
        })
      ).subscribe();
    });
  }

  // Crear post en Firestore
  async createPost(userId: string, text: string, imageUrl: string, url: string, location: string) {
    try {
      await this.firestoreService.createPost(text, imageUrl, url, location, userId);
      console.log('Post creado exitosamente');
    } catch (error) {
      console.error('Error al crear el post:', error);
      throw new Error('No se pudo crear el post. Intenta nuevamente.');
    }
  }
}
