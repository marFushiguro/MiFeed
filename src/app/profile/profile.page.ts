import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProfilePage {
  user = {
    username: '',
    photoURL: ''
  };

  private auth = getAuth();
  private db = getFirestore();
  private storage = getStorage();

  constructor(private authService: AuthService) {
    this.loadUserData();
  }

  async loadUserData() {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      this.user.username = currentUser.displayName || '';
      this.user.photoURL = currentUser.photoURL || 'assets/default-avatar.png';
    }
  }

  async saveChanges() {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      const userRef = doc(this.db, 'users', currentUser.uid);
      await updateDoc(userRef, { username: this.user.username });
      alert('Cambios guardados');
    }
  }

  async changePhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const storageRef = ref(this.storage, `profile_pictures/${this.auth.currentUser?.uid}`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        this.user.photoURL = photoURL;
        await updateDoc(doc(this.db, 'users', this.auth.currentUser!.uid), { photoURL });
      }
    };
    input.click();
  }
}
