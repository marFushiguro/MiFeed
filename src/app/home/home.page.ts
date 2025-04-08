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
import { AlertController } from '@ionic/angular';


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
  currentUserId: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private firestoreService: FirestoreService,
    private platform: Platform,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    console.log('✅ HomePage cargada');
    this.currentUserId = this.authService.getUserId(); // Puede ser null
    this.loadPosts();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  irAperfil() {
    this.router.navigate(['/profile']);
  }

  goBack() {
    this.location.back();
  }
  // Función para redirigir a la página de Eventos
  goToEvents() {
    this.router.navigate(['/events']);  // Navegar a la ruta de eventos
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
      this.loadPosts();
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
    const username = this.authService.getUsername();
  
    if (!userId) {
      console.error('❌ No se ha encontrado un usuario autenticado.');
      return;
    }
  
    if (!username) {
      console.error('❌ El nombre de usuario no está disponible');
      return;
    }
  
    try {
      await this.firestoreService.createPost(
        this.postText,
        this.imageUrl,
        '',
        '',
        userId,
        username
      );
      this.postText = '';
      this.selectedImage = '';
      this.imageUrl = '';
      this.loadPosts();
    } catch (error) {
      console.error('❌ Error al publicar el post:', error);
    }
  }
  

  async editPost(post: any) {
    try {
      const modal = await this.modalCtrl.create({
        component: AddPostPage,
        componentProps: { post }
      });
      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        this.loadPosts();
      }
    } catch (error) {
      console.error('❌ Error al abrir el modal de edición:', error);
    }
  }

  async deletePost(postId: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar post?',
      message: '¿Seguro que quieres eliminar este post?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.firestoreService.deletePost(postId);
              this.loadPosts();
            } catch (error) {
              console.error('❌ Error al eliminar el post:', error);
            }
          }
        }
      ]
    });
  
    await alert.present();
  }
}
