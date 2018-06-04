import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Broadcast } from '../../models/broadcast';
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { User } from "../../models/user";
import { Storage } from "@ionic/storage";
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
  user = {} as User;
  broadcastItems$: Observable<any>;
  broadcast = {} as Broadcast;
  orgId = "";
  isBroadcast: boolean;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public firebaseService: FirebaseServiceProvider) {
    this.broadcast = JSON.parse(navParams.get("broadcast"));
    this.orgId = navParams.get("orgId");
    this.isBroadcast = navParams.get("isBroadcast");
    if (this.isBroadcast) {
      this.broadcastItems$ = this.firebaseService.getCommentListBroadcast(this.orgId, this.broadcast.key).valueChanges();
    } else {
      this.broadcastItems$ = this.firebaseService.getCommentListMessage(this.orgId, this.broadcast.key).valueChanges();
    }
  }

  goToComposeThread() {
    this.navCtrl.push(ComposeThreadPage, {
      key: this.broadcast.key,
      isBroadcast: this.isBroadcast
    });
  }

  viewProfile($event) {
    this.navCtrl.push(ProfilePage, {
      uid: $event
    });
  }

}
