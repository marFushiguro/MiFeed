const path = require('path'); 
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();

app.use(express.static(path.join(__dirname, 'www')));
app.use(cors());
app.use(express.json());

// 🔥 Inicializar Firebase
if (admin.apps.length === 0) {
  const serviceAccount = require('./firebase-adminsdk.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "ionic-2-e5f0a.appspot.com"
  });
  console.log("✅ Firebase inicializado.");
} else {
  console.log("⚠️ Firebase ya estaba inicializado.");
}

const db = admin.firestore();

// 🚀 Ruta para crear un post
app.post('/createPost', async (req, res) => {
  try {
    const { text, imageUrl, userId } = req.body;
    if (!text || !userId) return res.status(400).json({ error: 'Faltan datos' });

    const docRef = await db.collection('posts').add({
      text,
      imageUrl: imageUrl || '',
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      likes: 0
    });

    res.status(200).json({ message: '✅ Post creado', id: docRef.id });
  } catch (error) {
    console.error('❌ Error creando post:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🚀 Ruta para enviar notificación cuando un usuario da like
app.post('/api/send-like-notification', async (req, res) => {
  try {
    const { userId, postId } = req.body;
    if (!userId || !postId) return res.status(400).json({ error: 'Faltan datos' });

    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists || !userSnap.data().fcmToken) {
      return res.status(404).json({ error: "Usuario no tiene token FCM." });
    }

    const token = userSnap.data().fcmToken;
    const message = {
      notification: {
        title: "Nuevo like en tu post!",
        body: `Alguien ha dado like a tu publicación!`,
      },
      token: token
    };

    await admin.messaging().send(message);
    res.status(200).json({ message: "✅ Notificación enviada con éxito." });
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🚀 Ruta para obtener un usuario por ID
app.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json(userSnap.data());  
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// 🚀 Ruta para enviar una notificación personalizada
app.post('/send-notification', async (req, res) => {
  try {
    const { userId, title, message } = req.body;

    // Obtener el token del usuario desde Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists || !userDoc.data().fcmToken) {
      return res.status(404).json({ error: "Usuario no tiene token FCM." });
    }

    const token = userDoc.data().fcmToken;

    const payload = {
      notification: {
        title: title,
        body: message
      },
      token: token
    };

    await admin.messaging().send(payload);
    res.status(200).json({ message: "✅ Notificación enviada con éxito." });
  } catch (error) {
    console.error("❌ Error enviando notificación:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:userId/token', async (req, res) => {
  const { userId } = req.params;
  try {
    const userSnap = await admin.firestore().collection('users').doc(userId).get();
    if (!userSnap.exists) return res.status(404).json({ error: 'Usuario no encontrado' });

    const data = userSnap.data();
    return res.json({ fcmToken: data.fcmToken || null });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


// 🚀 Ruta para actualizar el perfil del usuario
app.put('/updateUserProfile', async (req, res) => {
  try {
    const { userId, nombre, username, fotoPerfilBase64 } = req.body;
    if (!userId || !nombre || !username) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Si la foto de perfil fue enviada, puedes almacenarla en Firebase Storage y obtener la URL
    let fotoPerfilUrl = null;
    if (fotoPerfilBase64) {
      const bucket = admin.storage().bucket('ionic-2-e5f0a.firebasestorage.app');


      const file = bucket.file(`fotos_perfil/${userId}.jpg`);
      await file.save(Buffer.from(fotoPerfilBase64, 'base64'), { contentType: 'image/jpeg' });
      fotoPerfilUrl = `https://storage.googleapis.com/${bucket.name}/fotos_perfil/${userId}.jpg`;
    }

    // Actualizar el documento de usuario en Firestore
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      nombre,
      username,
      fotoPerfil: fotoPerfilUrl || null
    });

    res.status(200).json({ message: '✅ Perfil actualizado con éxito' });
  } catch (error) {
    console.error('❌ Error actualizando el perfil:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🚀 Ruta para eliminar una cuenta de usuario
app.delete('/deleteUser/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Eliminar usuario de Auth (si se requiere, con admin.auth().deleteUser(userId))

    // Eliminar usuario de Firestore
    await db.collection('users').doc(userId).delete();

    // Eliminar posts del usuario
    const postsSnapshot = await db.collection('posts').where('userId', '==', userId).get();
    const deletePromises = postsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    res.status(200).json({ message: '✅ Cuenta eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar cuenta:', error);
    res.status(500).json({ error: 'Error al eliminar cuenta' });
  }
});


// 🌍 Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
