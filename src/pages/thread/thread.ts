import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Broadcast } from '../../models/broadcast';
import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { User } from '../../models/user';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeThreadPage } from '../compose-thread/compose-thread';
import { Observable } from 'rxjs/Observable';
import { ProfilePage } from '../profile/profile';
/**
 * Generated class for the ThreadPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-thread',
  templateUrl: 'thread.html',
})
export class ThreadPage {
  firebaseStorage = firebase.storage();
  broadcastItems$: Observable<any>;
  broadcast = {} as Broadcast;
  orgId = '';
  isBroadcast: boolean;
  constructor(public navCtrl: NavController,
              private navParams: NavParams,
              private firebaseService: FirebaseServiceProvider,
              private modal: ModalController) {
  }

  ionViewDidLoad() {
    this.dataSetup();
  }

  async dataSetup() {
    const data = this.navParams.data;
    this.broadcast = JSON.parse(data.broadcast);
    this.orgId = data.organizationId;
    this.isBroadcast = data.isBroadcast;
    if (this.isBroadcast) {
      this.broadcastItems$ = this.firebaseService
        .getCommentListBroadcast(this.orgId, this.broadcast.key).valueChanges();
    } else {
      this.broadcastItems$ = this.firebaseService
        .getCommentListMessage(this.orgId, this.broadcast.key).valueChanges();
    }
  }

  goToComposeThread() {
    const myModal = this.modal.create(ComposeThreadPage, {
      key: this.broadcast.key,
      isBroadcast: this.isBroadcast,
    });
    myModal.present();
  }

  viewProfile($event) {
    this.navCtrl.push(ProfilePage, {
      uid: $event,
    });
  }
}
