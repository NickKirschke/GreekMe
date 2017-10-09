import { Component } from '@angular/core';
import { NavController, App, NavParams } from 'ionic-angular';
import { Broadcast } from '../../models/broadcast';
import {FirebaseListObservable} from "angularfire2/database/firebase_list_observable";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import {User} from "../../models/user";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {async} from "rxjs/scheduler/async";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeThreadPage } from '../compose-thread/compose-thread';
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
  validRole=false;
  // this tells the tabs component which Pages
  // should be each tab's root Page
  broadcastItems: FirebaseListObservable<Broadcast>;
  broadcast = {} as Broadcast;
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
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ThreadPage');
  }
  goToComposeThread() {
    this.navCtrl.push(ComposeThreadPage,{
      key: this.broadcast.key
    } );
  }

}
