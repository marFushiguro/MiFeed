/*import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseConfig } from '../services/firebase-config';
import { initializeApp } from 'firebase/app';

// Inicializa Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function createPost(postText: string, imageUrl: string) {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      text: postText,
      imageUrl: imageUrl,
      timestamp: new Date(),
    });
    console.log("Post creado con ID: ", docRef.id);
  } catch (e) {
    console.error("Error añadiendo el documento: ", e);
  }
}*/
