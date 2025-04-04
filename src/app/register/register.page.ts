import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class RegisterPage {
  email = '';
  password = '';
  confirmPassword = '';
  username = '';
  mostrarErrorPasswords = false;

  constructor(private authService: AuthService, private router: Router) {}

  validarPasswords() {
    this.mostrarErrorPasswords = this.confirmPassword !== '' && this.password !== this.confirmPassword;
  }

  formValido(): boolean {
    return this.email !== '' && this.password !== '' && this.username !== '' && 
           this.confirmPassword !== '' && !this.mostrarErrorPasswords;
  }

  async register() {
    if (this.mostrarErrorPasswords) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    try {
      await this.authService.register(this.email, this.password, this.username);
      alert('Registro exitoso');
      this.router.navigate(['/login']);
    } catch (error: unknown) {
      let errorMessage = 'Ocurrió un error, por favor intente nuevamente.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    }
  }

  irAPaginaLogin() {
    this.router.navigate(['/login']);
  }
}
