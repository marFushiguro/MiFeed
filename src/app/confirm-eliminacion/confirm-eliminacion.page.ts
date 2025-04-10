import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { getAuth, deleteUser } from 'firebase/auth';

@Component({
  selector: 'app-confirm-eliminacion',
  templateUrl: './confirm-eliminacion.page.html',
  styleUrls: ['./confirm-eliminacion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class ConfirmEliminacionPage {

  constructor(
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async confirmarEliminacion() {
    const alert = await this.alertCtrl.create({
      header: '¿Estás seguro?',
      message: 'Esta acción eliminará tu cuenta permanentemente.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.router.navigate(['/home']);
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.eliminarCuenta();
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarCuenta() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        await deleteUser(user);
        console.log('Cuenta eliminada exitosamente');
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('Error eliminando cuenta:', error);
        // Aquí podrías mostrar otra alerta en caso de error
      }
    }
  }

  cancelar() {
    this.router.navigate(['/home']);
  }
}
