import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private storage: AngularFireStorage) {}

  // Función para subir una imagen
  uploadImage(file: File, path: string): Observable<any> {
    const filePath = path;  // Puedes cambiar el path según tus necesidades
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    return task.snapshotChanges();  // Puedes obtener el progreso de la subida aquí
  }

  // Obtener la URL de descarga del archivo
  getFileDownloadURL(path: string): Observable<string> {
    const fileRef = this.storage.ref(path);
    return fileRef.getDownloadURL();
  }
}
