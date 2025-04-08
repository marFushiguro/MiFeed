import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
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
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
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

  constructor(private authService: AuthService, private location: Location) {}

  async ngOnInit() {
    this.userId = this.authService.getUserId();
    if (this.userId) {
      const userRef = doc(this.db, 'users', this.userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.nombre = data['nombre'];
        this.username = data['username'];
        this.email = data['email'];
        this.fotoPerfil = data['fotoPerfil'] || '';
      }
    }
  }

  habilitarEdicion() {
    this.isEditing = true;
  }

  async guardarCambios() {
    if (!this.userId) return;
    const userRef = doc(this.db, 'users', this.userId);
    await updateDoc(userRef, {
      nombre: this.nombre,
      username: this.username,
      fotoPerfil: this.fotoPerfil,
    });
    this.isEditing = false;
    alert('✅ Perfil actualizado');
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
