import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { UserServiceProvider } from '../userService/userService';
import { User } from '../../models/user';

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
    private userService: UserServiceProvider,
  ) {}

  async getToken() {
    let token;
    if (this.platform.is('android')) {
      console.log('android');
      token = await this.firebaseNative.getToken();
    }

    if (this.platform.is('ios')) {
      console.log('ios');
      token = await this.firebaseNative.getToken();
      await this.firebaseNative.grantPermission();
    }

    console.log(`Token: ${token}`);
    return this.saveTokenToFirestore(token);
  }

  private async saveTokenToFirestore(token) {
    if (!token) return;
    const userGrab = await this.userService.currentUserInfo();
    const user = userGrab as User;
    const devicesRef = this.afs.collection(user.organizationId);

    const docData = {
      token,
      userId: user.uid,
      broadcastNotifications: user.broadcastNotifications,
      feedNotifications: user.feedNotifications,
    };
    return devicesRef.doc(token).set(docData);
  }

  listenToNotifications() {
    return this.firebaseNative.onNotificationOpen();
  }
}
