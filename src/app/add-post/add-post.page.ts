import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/auth/auth.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './add-post.page.html',
  styleUrls: ['./add-post.page.scss'],
})
export class AddPostPage implements AfterViewInit {
  post = {
    text: '',
    imageUrl: '',
    location: '',
  };

  selectedFile: File | null = null;
  selectedImage: string | null = null;
  private storage = getStorage();
  userId: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private modalCtrl: ModalController,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private platform: Platform
  ) {}

  async ngOnInit() {
    this.userId = await this.authService.getUserId();
  }

  ngAfterViewInit() {
    if (!this.fileInput) {
      console.error('❌ fileInput no está inicializado');
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async publishPost() {
    if (!this.post.text.trim()) {
      console.error('❌ El texto del post no puede estar vacío');
      return;
    }

    let imageUrl = '';

    if (this.selectedFile) {
      imageUrl = await this.uploadImageToFirebase();
    }

    this.savePost(imageUrl);
  }

  private async uploadImageToFirebase(): Promise<string> {
    try {
      if (!this.selectedFile) {
        console.error('❌ No hay archivo seleccionado para subir.');
        return '';
      }

      const fileName = `posts/${Date.now()}_${this.selectedFile.name}`;
      const fileRef = ref(this.storage, fileName);
      const blob = await this.selectedFile.arrayBuffer();
      await uploadBytes(fileRef, new Blob([blob]));

      const imageUrl = await getDownloadURL(fileRef);
      console.log('✅ Imagen subida. URL:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error);
      return '';
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
      this.userId
    );

    this.modalCtrl.dismiss(true);
  }

  // Seleccionar imagen desde la galería o input file
  async selectImageFromGallery() {
    if (this.platform.is('cordova')) {
      try {
        const photo = await Camera.getPhoto({
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos,
          quality: 100,
        });

        this.selectedImage = photo.webPath || '';
        console.log('✅ Imagen seleccionada:', this.selectedImage);
      } catch (error) {
        console.error('❌ Error seleccionando imagen:', error);
      }
    } else {
      if (this.fileInput) {
        this.fileInput.nativeElement.click();
      }
    }
  }

  // Tomar foto usando la cámara y subirla a Firebase
  async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 100,
      });

      if (!photo.base64String) {
        console.error('❌ No se pudo obtener la imagen en base64');
        return;
      }

      // Convertimos la imagen base64 a Blob
      const imageBlob = this.base64ToBlob(photo.base64String, 'image/jpeg');
      this.selectedFile = new File([imageBlob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Asignamos la imagen tomada como preview
      this.selectedImage = `data:image/jpeg;base64,${photo.base64String}`;

      console.log('✅ Foto tomada y convertida a archivo:', this.selectedFile);
    } catch (error) {
      console.error('❌ Error tomando foto:', error);
    }
  }

  // Convertir Base64 a Blob
  private base64ToBlob(base64: string, contentType = '') {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    return new Blob([new Uint8Array(byteArrays)], { type: contentType });
  }

  // Manejar carga de imágenes desde el input file
  uploadImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedImage = URL.createObjectURL(file);
    }
  }
}
