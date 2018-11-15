"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.broadcastPostNotification = functions.database
    .ref('/organization/{orgId}/broadcast/{broadcastId}')
    .onCreate((snapshot, context) => __awaiter(this, void 0, void 0, function* () {
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
            name: broadcastData.name,
            message: broadcastData.text,
        }
    };
    const db = admin.firestore();
    const devicesRef = db.collection(organizationId);
    const query = devicesRef.where('broadcastNotifications', '==', true);
    // get the user's tokens and send notifications
    const devices = yield query.get();
    const tokens = [];
    // send a notification to each device token
    devices.forEach(result => {
        const token = result.data().token;
        if (result.data().userId !== broadcastData.uid) {
            tokens.push(token);
        }
    });
    return admin.messaging().sendToDevice(tokens, payload).catch((error) => {
        console.log(error);
    });
}));
exports.feedPostNotification = functions.database
    .ref('/organization/{orgId}/message/{messageId}')
    .onCreate((snapshot, context) => __awaiter(this, void 0, void 0, function* () {
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
            name: messageData.name,
            message: messageData.text,
        }
    };
    const db = admin.firestore();
    const devicesRef = db.collection(organizationId);
    const query = devicesRef.where('feedNotifications', '==', true);
    // get the user's tokens and send notifications
    const devices = yield query.get();
    const tokens = [];
    // send a notification to each device token
    devices.forEach(result => {
        const token = result.data().token;
        if (result.data().userId !== messageData.uid) {
            tokens.push(token);
        }
    });
    return admin.messaging().sendToDevice(tokens, payload).catch((error) => {
        console.log(error);
    });
}));
//# sourceMappingURL=index.js.map