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
  nombre = '';  
  mostrarErrorPasswords = false;
  mostrarErrorPasswordLength = false;

  constructor(private authService: AuthService, private router: Router) {}

  // Validación de contraseñas (en tiempo real)
  validarPasswords() {
    this.mostrarErrorPasswords = this.password !== this.confirmPassword;
  }

  // Validación de la longitud de la contraseña (al escribir)
  validarPasswordLength() {
    this.mostrarErrorPasswordLength = this.password.length < 8;
  }

  formValido(): boolean {
    return this.nombre.trim() !== '' &&
           this.username.trim() !== '' &&
           this.email.trim() !== '' &&
           this.password.trim() !== '' &&
           this.confirmPassword.trim() !== '' &&
           this.password.length >= 8 &&
           !this.mostrarErrorPasswords;
  }

  async register() {
    if (!this.formValido()) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    try {
      await this.authService.register(this.email, this.password, this.username, this.nombre); 
      alert('✅ Registro exitoso');
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
