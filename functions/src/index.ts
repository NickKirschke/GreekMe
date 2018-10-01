import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

exports.broadcastPostNotification = functions.database
    .ref('/organization/{orgId}/broadcast/{broadcastId}')
    .onCreate(async (snapshot, context) => {
        const organizationId = context.params.orgId;
        const broadcastData = snapshot.val();
        // Notification content possibly add user face making the broadcast?
        const payload = {
            notification: {
                title: `Broadcast from ${broadcastData.name}`,
                body: `${broadcastData.text}`,
            },
            data: {
                contentType: broadcastData.contentType,
                key: snapshot.key,
                date: broadcastData.date,
                avatarUrl: broadcastData.avatarUrl,
                uid: broadcastData.uid,
            }
        };
        const db = admin.firestore();
        const devicesRef = db.collection(organizationId);
        const query = devicesRef.where('broadcastNotifications', '==', true);
        // get the user's tokens and send notifications
        const devices = await query.get();
        const tokens = [];
        // send a notification to each device token
        devices.forEach(result => {
            const token = result.data().token;
            if(result.data().userId !== broadcastData.uid) {
                tokens.push(token);
            }
        });
        return admin.messaging().sendToDevice(tokens, payload).catch((error) => {
            console.log(error);
        });
    });

exports.feedPostNotification = functions.database
    .ref('/organization/{orgId}/message/{messageId}')
    .onCreate(async (snapshot, context) => {
        const organizationId = context.params.orgId;
        const messageData = snapshot.val();
        // Notification content possibly add user face making the broadcast?
        const payload = {
            notification: {
                title: `Message from ${messageData.name}`,
                body: `${messageData.text}`,
            },
            data: {
                contentType: messageData.contentType,
                key: snapshot.key,
                date: messageData.date,
                avatarUrl: messageData.avatarUrl,
                uid: messageData.uid,
            }
        };
        const db = admin.firestore();
        const devicesRef = db.collection(organizationId);
        const query = devicesRef.where('feedNotifications', '==', true);
        // get the user's tokens and send notifications
        const devices = await query.get();
        const tokens = [];
        // send a notification to each device token
        devices.forEach(result => {
            const token = result.data().token;
            if(result.data().userId !== messageData.uid) {
                tokens.push(token);
            }
        })
        return admin.messaging().sendToDevice(tokens, payload).catch((error) => {
            console.log(error);
        });
    });