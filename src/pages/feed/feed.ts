import {Component} from '@angular/core';
import {NavController, App} from 'ionic-angular';
import {AngularFireList} from "angularfire2/database";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import {User} from "../../models/user";
import {Broadcast} from "../../models/broadcast";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {AngularFireObject} from "angularfire2/database";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeFeedPage } from '../compose-feed/compose-feed';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html'
})
export class FeedPage {
  firebaseStorage = firebase.storage();
  userData: AngularFireObject<User>
  user = {} as User;
  // this tells the tabs component which Pages
  // should be each tab's root Page
  feedItems: Observable<any>;
  feedItemRef: AngularFireList<any>;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private app: App,
    private userService: UserServiceProvider) {
    this.afAuth.authState.subscribe(data=> {
      if(data && data.email && data.uid) {
         const userGrab =  this.userService.currentUserInfo();
         userGrab.then((result) =>{
           this.user = result as User;
           this.feedItemRef = this.firebaseService.getFeedList(this.user.organization_ID);
           this.feedItems = this.feedItemRef.snapshotChanges().map(action => {
            return action.map(c => ({
              key: c.payload.key, ...c.payload.val()
            })).reverse();
            
          });;
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