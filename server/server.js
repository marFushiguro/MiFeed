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


// 🌍 Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
