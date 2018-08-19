import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth/auth';
import * as firebase from 'firebase/app';

/*
  Generated class for the FcmProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FcmProvider {

  constructor(
    public firebaseNative: Firebase,
    public afs: AngularFirestore,
    public platform: Platform,
    private afAuth: AngularFireAuth,

  ) {
  }

  async getToken() {
    let token;
    if (this.platform.is('android')) {
      console.log('android');
      token = await this.firebaseNative.getToken();
    }

    if (this.platform.is('ios')) {
      console.log('ios');
      token = await this.firebaseNative.getToken();
      console.log(token);
      const perm = await this.firebaseNative.grantPermission();
    }

    // Is not cordova == web PWA
    if (!this.platform.is('cordova')) {
      console.log('web');
      const messaging = firebase.messaging();
      messaging.usePublicVapidKey(`BBcOFXaauOSn8E1CC0vRGNlqiHuu5x0B5tTV5orJb2ndQ
      1qWOy40pnuo_MX0peLuubWTc-u5m6pwWgWp86O28g`);
      messaging.requestPermission()
      .then(async () => {
        console.log('Notification permission granted.');
        token = await messaging.getToken();
        console.log(token);
      })
      .catch((err) => {
        console.log('Unable to get permission to notify.', err);
      });
    }
    console.log(`Token: ${token}`);
    return this.saveTokenToFirestore(token);
  }

  private saveTokenToFirestore(token) {
    if (!token) return;
    const devicesRef = this.afs.collection('devices');
    console.log('tokenID', this.afAuth.idToken);

    const docData = {
      token,
      userId: 'testUser',
    };
    return devicesRef.doc(token).set(docData);
  }

  listenToNotifications() {
    return this.firebaseNative.onNotificationOpen();
  }
}
