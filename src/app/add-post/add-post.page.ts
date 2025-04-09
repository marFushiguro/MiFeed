import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/auth/auth.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';
import { getFirestore, doc, getDoc } from 'firebase/firestore';


@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './add-post.page.html',
  styleUrls: ['./add-post.page.scss'],
})
export class AddPostPage implements AfterViewInit {
  @Input() post: any = {
    text: '',
    imageUrl: '',
    location: '',
    id: null,
  };

  selectedFile: File | null = null;
  selectedImage: string | null = null;
  private storage = getStorage();
  userId: string | null = null;
  fotoPerfil: string | null = null; // Para almacenar la foto de perfil del usuario
  username: string | null = null;
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private modalCtrl: ModalController,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private platform: Platform,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.userId = await this.authService.getUserId();
    this.selectedImage = this.post.imageUrl || null;

    // Obtener datos del usuario
    if (this.userId) {
      const userRef = doc(getFirestore(), 'users', this.userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.fotoPerfil = data['fotoPerfil'] || null;
        this.username = data['username'] || null;
      }
    }
    
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

    let imageUrl = this.post.imageUrl;

    if (this.selectedFile) {
      imageUrl = await this.uploadImageToFirebase();
    }

    if (this.post.id) {
      // Editar post existente
      await this.firestoreService.updatePost(this.post.id, {
        text: this.post.text,
        imageUrl,
        location: this.post.location,
        userId: this.userId,
        fotoPerfil: this.fotoPerfil, // Incluir la foto de perfil
      });
    } else {
      // Crear nuevo post
      if (!this.userId) {
        console.error('❌ No se encontró el ID del usuario autenticado');
        return;
      }
      
      if (!this.username) {
        console.error('❌ El nombre de usuario no está disponible');
        return;
      }
      

      await this.firestoreService.createPost(
        this.post.text,
        imageUrl,
        this.post.location,
        '',
        this.userId,
        this.username,
        this.fotoPerfil // Guardar la foto de perfil junto con el post
      );
    }

    this.presentToast(this.post.id ? 'Post actualizado' : 'Post publicado');
    this.modalCtrl.dismiss(true);
  }

  private async uploadImageToFirebase(): Promise<string> {
    try {
      if (!this.selectedFile) return '';
      const fileName = `posts/${Date.now()}_${this.selectedFile.name}`;
      const fileRef = ref(this.storage, fileName);
      const blob = await this.selectedFile.arrayBuffer();
      await uploadBytes(fileRef, new Blob([blob]));
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error);
      return '';
    }
  }

  async selectImageFromGallery() {
    if (this.platform.is('cordova')) {
      try {
        const photo = await Camera.getPhoto({
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos,
          quality: 100,
        });
        this.selectedImage = photo.webPath || '';
      } catch (error) {
        console.error('❌ Error seleccionando imagen:', error);
      }
    } else {
      if (this.fileInput) this.fileInput.nativeElement.click();
    }
  }

  async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 100,
      });

      if (!photo.base64String) return;

      const imageBlob = this.base64ToBlob(photo.base64String, 'image/jpeg');
      this.selectedFile = new File([imageBlob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      this.selectedImage = `data:image/jpeg;base64,${photo.base64String}`;
    } catch (error) {
      console.error('❌ Error tomando foto:', error);
    }
  }

  private base64ToBlob(base64: string, contentType = '') {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    return new Blob([new Uint8Array(byteArrays)], { type: contentType });
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedImage = URL.createObjectURL(file);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}
