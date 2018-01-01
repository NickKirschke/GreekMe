import { Component } from '@angular/core';
import { NavController, App, NavParams } from 'ionic-angular';
import { Broadcast } from '../../models/broadcast';
import {AngularFireList} from "angularfire2/database";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import {User} from "../../models/user";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {async} from "rxjs/scheduler/async";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';

import { Observable } from 'rxjs/Observable';
import { ComposeThreadMessagePage } from '../compose-thread-message/compose-thread-message';
/**
 * Generated class for the ThreadPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-message-thread',
  templateUrl: 'message-thread.html',
})

export class MessageThreadPage {
  firebaseStorage = firebase.storage();
  user = {} as User;
  validRole=false;
  // this tells the tabs component which Pages
  // should be each tab's root Page
  messageItems: Observable<any>;
  broadcast = {} as Broadcast;
  orgId = "";
  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     private afAuth: AngularFireAuth,
     public firebaseService: FirebaseServiceProvider,
     private app: App,
     private userService: UserServiceProvider,
     private storage: Storage) {

    this.broadcast.avatar_url = navParams.get("avatar_url");
    this.broadcast.text = navParams.get("text");
    this.broadcast.name= navParams.get("name");
    this.broadcast.date = navParams.get("date");
    this.broadcast.uid = navParams.get("uid");
    this.broadcast.key = navParams.get("key");
    this.orgId = navParams.get("orgId");
    this.messageItems = this.firebaseService.getCommentListMessage(this.orgId, this.broadcast.key).valueChanges();   
  }

  goToComposeThread() {
    this.navCtrl.push(ComposeThreadMessagePage,{
      key: this.broadcast.key
    } );
  }

}
