const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

// Función para enviar notificación push
async function sendNotification(userId, postId) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return { error: 'Usuario no encontrado' };
    }

    const userData = userSnap.data();
    const deviceToken = userData.deviceToken;

    if (!deviceToken) {
      return { error: 'El usuario no tiene un token de notificación registrado' };
    }

    // Mensaje de la notificación
    const message = {
      notification: {
        title: '¡Nuevo like!',
        body: 'Alguien ha dado like a tu post.',
      },
      token: deviceToken,
    };

    // Enviar la notificación
    const response = await admin.messaging().send(message);
    console.log('✅ Notificación enviada:', response);

    return { success: true, message: 'Notificación enviada' };
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
    return { error: 'Error enviando la notificación' };
  }
}

module.exports = { sendNotification };
