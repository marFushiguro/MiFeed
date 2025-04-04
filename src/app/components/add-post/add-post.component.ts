/*import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/auth/auth.service'; // Importamos el servicio de autenticación
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss'],
})
export class AddPostComponent {
  post = {
    text: '',
    imageUrl: '',
    location: '',
  };

  selectedFile: File | null = null;
  private storage = getStorage();
  userId: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private firestoreService: FirestoreService,
    private authService: AuthService // Inyectamos el servicio de autenticación
  ) {}

  async ngOnInit() {
    this.userId = await this.authService.getUserId(); // Obtenemos el ID del usuario autenticado
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async publishPost() {
    if (!this.post.text.trim()) {
      console.error('❌ El texto del post no puede estar vacío');
      return;
    }

    if (this.selectedFile) {
      await this.uploadImageToFirebase();
    } else {
      this.savePost('');
    }
  }

  private async uploadImageToFirebase() {
    try {
      const fileName = `posts/${Date.now()}_${this.selectedFile!.name}`;
      const fileRef = ref(this.storage, fileName);
      const blob = await this.selectedFile!.arrayBuffer();
      await uploadBytes(fileRef, new Blob([blob]));

      const imageUrl = await getDownloadURL(fileRef);
      console.log('✅ Imagen subida. URL:', imageUrl);
      this.savePost(imageUrl);
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error);
    }
  }

  private async savePost(imageUrl: string) {
    if (!this.userId) {
      console.error('❌ No se encontró el ID del usuario autenticado');
      return;
    }

    await this.firestoreService.createPost(
      this.post.text,
      imageUrl,
      this.post.location, 
      '', 
      this.userId // Ahora se guarda correctamente el ID del usuario autenticado
    );

    this.modalCtrl.dismiss(true);
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.post.imageUrl = URL.createObjectURL(file);
    }
  }
}*/
