import {Component} from '@angular/core';
import {NavController, App, NavParams} from 'ionic-angular';
import {FirebaseListObservable} from "angularfire2/database/firebase_list_observable";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import {User} from "../../models/user";
import {Broadcast} from "../../models/broadcast";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {FirebaseObjectObservable} from "angularfire2/database/firebase_object_observable";
import {async} from "rxjs/scheduler/async";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeFeedPage } from '../compose-feed/compose-feed';
import { ThreadPage } from '../thread/thread';

@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html'
})
export class FeedPage {
  firebaseStorage = firebase.storage();
  userData: FirebaseObjectObservable<User>
  user = {} as User;
  // this tells the tabs component which Pages
  // should be each tab's root Page
  feedItems: FirebaseListObservable<Broadcast>;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private app: App,
    private userService: UserServiceProvider,
    private storage: Storage) {
    this.afAuth.authState.subscribe(data=> {
      if(data && data.email && data.uid) {
         const userGrab =  this.userService.currentUserInfo();
         userGrab.then((result) =>{
           this.user = result as User;           
           this.feedItems = this.firebaseService.getFeedList(this.user.organization_ID);
        });        
      } else {
        this.app.getRootNavs()[0].setRoot(LoginPage);
      }
    });
  }
  logout() {
    this.afAuth.auth.signOut();
  }
  goToComposeFeed() {
    this.navCtrl.push(ComposeFeedPage);
  }
}