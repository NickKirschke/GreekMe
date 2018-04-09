import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Broadcast } from '../../models/broadcast';
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {User} from "../../models/user";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeThreadPage } from '../compose-thread/compose-thread';
import { Observable } from 'rxjs/Observable';
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
  broadcastItems: Observable<any>;
  broadcast = {} as Broadcast;
  orgId = "";
  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     public firebaseService: FirebaseServiceProvider) {

    this.broadcast.avatar_url = navParams.get("avatar_url");
    this.broadcast.text = navParams.get("text");
    this.broadcast.name= navParams.get("name");
    this.broadcast.date = navParams.get("date");
    this.broadcast.uid = navParams.get("uid");
    this.broadcast.key = navParams.get("key");
    this.orgId = navParams.get("orgId");
    this.broadcastItems = this.firebaseService.getCommentListBroadcast(this.orgId, this.broadcast.key).valueChanges();   
  }

  goToComposeThread() {
    this.navCtrl.push(ComposeThreadPage,{
      key: this.broadcast.key
    } );
  }

}
