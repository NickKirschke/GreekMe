import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { User } from '../../models/user';
import firebase from 'firebase';
import { Storage } from '@ionic/storage';
import * as admin from 'firebase-admin';
import { AngularFirestore } from 'angularfire2/firestore';
/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  user = {} as User;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private view: ViewController,
    private storage: Storage,
    private afs: AngularFirestore,
  ) {}

  async ionViewWillEnter() {
    this.user = JSON.parse(this.navParams.data.user);
  }

  async updateSettings() {
    try {
      const data = {
        user: JSON.stringify(this.user),
      };
      // Get all the devices and then reduce the devices to the ones that only relate to this user
      // Then update his notification settings

      const deviceRef = this.afs.firestore.collection(this.user.organizationId);
      const query = deviceRef.where('userId', '==', this.user.uid);
      const res = await query.get();
      const batch = this.afs.firestore.batch();
      res.forEach(device => {
        batch.update(deviceRef.doc(device.id), {
          broadcastNotifications: this.user.broadcastNotifications,
          feedNotifications: this.user.feedNotifications,
        });
      });
      const batchCommit = batch.commit();
      const userUpdate = firebase
        .database()
        .ref(`users/${this.user.uid}/`)
        .set(this.user);
      const localUserUpdate = this.storage.set('user', JSON.stringify(this.user));
      await batchCommit;
      await userUpdate;
      await localUserUpdate;
      this.view.dismiss(data);
    } catch (error) {
      console.log('ERROR', error.code);
    }
  }

  closeModal() {
    this.view.dismiss();
  }
}
