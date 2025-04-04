import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { IonicModule, Platform, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AddPostPage } from '../add-post/add-post.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class HomePage {
  welcomeMessage: string = 'Bienvenido';
  posts: any[] = [];
  selectedImage: string | null = null;
  postText: string = '';
  imageUrl: string = '';
  private storage = getStorage();

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private firestoreService: FirestoreService,
    private platform: Platform,
    private modalCtrl: ModalController
  ) {
    console.log('✅ HomePage cargada');
    this.loadPosts();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goBack() {
    this.location.back();
  }

  async loadPosts() {
    try {
      this.posts = await this.firestoreService.getPosts();
      console.log('📢 Posts cargados:', this.posts);
    } catch (error) {
      console.error('❌ Error al cargar posts:', error);
    }
  }

  async likePost(postId: string) {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('❌ No se ha encontrado un usuario autenticado.');
      return;
    }
    try {
      await this.firestoreService.toggleLike(postId, userId);
      this.loadPosts(); // Recargar los posts después del like
    } catch (error) {
      console.error('❌ Error al dar like al post:', error);
    }
  }

  async openAddPostModal() {
    const modal = await this.modalCtrl.create({
      component: AddPostPage,
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.loadPosts();
    }
  }

  async selectImage() {
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
      console.error('❌ Solo disponible en dispositivos móviles.');
    }
  }

  async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100,
      });
      this.selectedImage = photo.webPath || '';
    } catch (error) {
      console.error('❌ Error tomando foto:', error);
    }
  }

  async submitPost() {
    if (!this.postText.trim()) {
      console.error('❌ El texto del post no puede estar vacío');
      return;
    }

    if (this.selectedImage) {
      await this.uploadImageToFirebase(this.selectedImage);
    } else {
      this.publishPost();
    }
  }

  async uploadImageToFirebase(imagePath: string) {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const fileName = `posts/${new Date().getTime()}.jpg`;
      const fileRef = ref(this.storage, fileName);
      await uploadBytes(fileRef, blob);
      this.imageUrl = await getDownloadURL(fileRef);
      this.publishPost();
    } catch (error) {
      console.error('❌ Error subiendo la imagen:', error);
    }
  }

  async publishPost() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('❌ No se ha encontrado un usuario autenticado.');
      return;
    }
    try {
      await this.firestoreService.createPost(
        this.postText,
        this.imageUrl,
        '',
        '',
        userId
      );
      this.postText = '';
      this.selectedImage = '';
      this.imageUrl = '';
      this.loadPosts();
    } catch (error) {
      console.error('❌ Error al publicar el post:', error);
    }
  }
}
