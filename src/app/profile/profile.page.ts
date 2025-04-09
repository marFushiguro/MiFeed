// Definición de la interfaz para la respuesta del perfil
interface UpdateProfileResponse {
  message: string;
  nombre: string;
  username: string;
  email: string;
  fotoPerfil: string | null;
}

import { Component, OnInit } from '@angular/core'; 
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { doc, getFirestore, getDoc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '../services/firebase-config';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, HttpClientModule],
})
export class ProfilePage implements OnInit {
  userId: string | null = null;
  nombre: string = '';
  username: string = '';
  email: string = '';
  fotoPerfil: string = '';
  isEditing: boolean = false;
  fotoNueva: string = '';

  private db = getFirestore(initializeApp(firebaseConfig));
  private storage = getStorage();

  constructor(
    private authService: AuthService,
    private location: Location,
    private httpClient: HttpClient
  ) {}

  async ngOnInit() {
    this.userId = this.authService.getUserId();
    if (this.userId) {
      // Obtener los datos del usuario desde Firestore o un servidor
      const userRef = `http://localhost:3000/users/${this.userId}`;
      try {
        const response = await this.httpClient.get<UpdateProfileResponse>(userRef).toPromise();
        if (response) {
          this.nombre = response.nombre;
          this.username = response.username;
          this.email = response.email;
          this.fotoPerfil = response.fotoPerfil || '';
        }
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
      }
    }
  }

  habilitarEdicion() {
    this.isEditing = true;
  }

  async guardarCambios() {
    if (!this.userId) return;

    const body = {
      userId: this.userId,
      nombre: this.nombre,
      username: this.username,
      fotoPerfilBase64: this.fotoNueva ? this.fotoNueva : undefined
    };

    try {
      const response = await this.httpClient.post<UpdateProfileResponse>('http://localhost:3000/updateUserProfile', body).toPromise();
      if (response) {
        alert(response.message);
        this.isEditing = false;
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil');
    }
  }

  volver() {
    this.location.back();
  }

  async seleccionarFoto() {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });

    this.fotoNueva = image.base64String!;
    this.fotoPerfil = 'data:image/jpeg;base64,' + this.fotoNueva;
  }

  async tomarFoto() {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    this.fotoNueva = image.base64String!;
    this.fotoPerfil = 'data:image/jpeg;base64,' + this.fotoNueva;
  }
  async guardarFoto() {
    if (!this.userId || !this.fotoNueva) return;
    const fileRef = ref(this.storage, `fotos_perfil/${this.userId}.jpg`);
    await uploadString(fileRef, this.fotoNueva, 'base64');
    const url = await getDownloadURL(fileRef);
    this.fotoPerfil = url;
    this.fotoNueva = '';

    await updateDoc(doc(this.db, 'users', this.userId), { fotoPerfil: url });

    alert('📸 Foto de perfil guardada');
  }

}
