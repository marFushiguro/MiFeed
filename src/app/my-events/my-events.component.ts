import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Auth } from '@angular/fire/auth';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-my-events',
  standalone: true,
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class MyEventsComponent implements OnInit {
  private firestoreService = inject(FirestoreService);
  private auth = inject(Auth);
  private alertController = inject(AlertController);

  myEvents: any[] = [];
  userId: string = '';
  editingEvent: any = null; // Evento en edición

  ngOnInit() {
    this.getUserId();  // Obtener el ID del usuario al iniciar
  }

  async getUserId() {
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      this.loadMyEvents();
    } else {
      console.log('Usuario no autenticado');
    }
  }

  async loadMyEvents() {
    try {
      const allEvents = await this.firestoreService.getEvents();
      this.myEvents = allEvents.filter(event => event.userId === this.userId);  // Filtramos por el ID del usuario
    } catch (error) {
      console.error('Error al cargar mis eventos:', error);
    }
  }

  // Método para editar el evento
  editEvent(eventId: string) {
    const event = this.myEvents.find(e => e.id === eventId);
    if (event) {
      // Creamos una copia y convertimos las reglas en texto
      this.editingEvent = {
        ...event,
        reglasTexto: event.reglas.join(', ') // Convertimos las reglas a texto
      };
    }
  }

  // Método para guardar los cambios en el evento
  async saveChanges() {
    const updatedEvent = {
      ...this.editingEvent,
      reglas: this.editingEvent.reglasTexto
        .split(',')
        .map((r: string) => r.trim()) // Ahora indicamos explícitamente que r es un string
    };
  
  

    try {
      await this.firestoreService.updateEvento(this.editingEvent.id, updatedEvent);
      this.editingEvent = null;  // Limpiar formulario de edición
      this.loadMyEvents();  // Recargar eventos
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    }
  }

  // Método para cancelar la edición
  cancelEdit() {
    this.editingEvent = null;
  }

  // Método para eliminar evento con confirmación
  async deleteEvent(eventId: string) {
    const alert = await this.alertController.create({
      header: '¿Eliminar evento?',
      message: '¿Estás seguro de que quieres eliminar este evento?',
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
              await this.firestoreService.deleteEvento(eventId);
              const success = await this.alertController.create({
                header: 'Eliminado',
                message: 'Evento eliminado con éxito',
                buttons: ['OK']
              });
              await success.present();
              this.loadMyEvents();  // Recargar eventos
            } catch (error) {
              console.error('Error al eliminar evento:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
