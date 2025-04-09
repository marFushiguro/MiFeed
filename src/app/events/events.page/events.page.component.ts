import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { RouterModule } from '@angular/router';
import { Timestamp, doc, getDoc, getFirestore } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';
import { AddPostPage } from 'src/app/add-post/add-post.page';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.component.html',
  styleUrls: ['./events.page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class EventsPageComponent implements OnInit {
  events: any[] = [];
  eventTitle: string = '';
  eventDescription: string = '';
  eventDate: string = '';
  eventRules: string = '';
  commentTextPorEvento: { [eventId: string]: string } = {};

  userId: string = '';
  username: string = '';
  userPhoto: string = '';

  // Servicios
  private firestoreService = inject(FirestoreService);
  private auth = inject(Auth);
  private modalController = inject(ModalController);
  private db = getFirestore();

  ngOnInit() {
    this.getUserData();
  }

  async getUserData() {
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      try {
        const userDoc = await getDoc(doc(this.db, 'users', this.userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          this.username = data['name'] || '';
          this.userPhoto = data['fotoPerfil'] || '';

        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
      this.loadEvents();
    } else {
      console.log('Usuario no autenticado');
    }
  }

  async loadEvents() {
    try {
      this.events = await this.firestoreService.getEvents();
      console.log('Eventos cargados:', this.events);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  }

  async createEvent() {
    const newEvent = {
      titulo: this.eventTitle,
      descripcion: this.eventDescription,
      fechaLimite: this.eventDate,
      reglas: this.eventRules.split(',').map(rule => rule.trim()),
      userId: this.userId,
      username: this.username,
      userPhoto: this.userPhoto,
      timestamp: Timestamp.fromDate(new Date()),
      submissions: [],
      finalizado: false,
      ganador: null,
      comments: []
    };

    try {
      await this.firestoreService.createEvento(newEvent);
      this.loadEvents();
      this.resetForm();
    } catch (error) {
      console.error('Error al crear evento:', error);
    }
  }

  resetForm() {
    this.eventTitle = '';
    this.eventDescription = '';
    this.eventDate = '';
    this.eventRules = '';
  }

  async addComment(eventId: string) {
    const text = this.commentTextPorEvento[eventId];
    if (text?.trim()) {
      const comment = {
        userId: this.userId,
        username: this.username, 
        userPhoto: this.userPhoto,
        text: text.trim(),
        timestamp: Timestamp.fromDate(new Date()),
        likes: 0,
        likedBy: []
      };

      try {
        await this.firestoreService.addComment(eventId, comment);
        this.commentTextPorEvento[eventId] = '';
        this.loadEvents();
      } catch (error) {
        console.error('Error al agregar comentario:', error);
      }
    }
  }

  async likeComment(eventId: string, commentIndex: number) {
    try {
      await this.firestoreService.likeComment(eventId, commentIndex, this.userId);
      this.loadEvents();
    } catch (error) {
      console.error('Error al dar like al comentario:', error);
    }
  }

  async uploadImageToEvent(eventId: string, imageUrl: string) {
    const submission = {
      userId: this.userId,
      username: this.username, 
      userPhoto: this.userPhoto,
      imageUrl: imageUrl,
      timestamp: Timestamp.fromDate(new Date()),
      likes: 0,
      likedBy: []
    };

    try {
      await this.firestoreService.addSubmission(eventId, submission);
      this.loadEvents();
    } catch (error) {
      console.error('Error al añadir imagen al evento:', error);
    }
  }

  async likeImage(eventId: string, submissionIndex: number) {
    try {
      await this.firestoreService.likeSubmission(eventId, submissionIndex, this.userId);
      this.loadEvents();
    } catch (error) {
      console.error('Error al dar like a la imagen:', error);
    }
  }

  async openAddPostModal() {
    const modal = await this.modalController.create({
      component: AddPostPage,
    });
    return await modal.present();
  }
}
