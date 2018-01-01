import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import {AngularFireList} from "angularfire2/database";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import { FeedPage } from '../feed/feed';
import {User} from "../../models/user";
import { Broadcast } from "../../models/broadcast";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {AngularFireObject} from "angularfire2/database";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'page-compose-feed',
  templateUrl: 'compose-feed.html'
})
export class ComposeFeedPage {
  firebaseStorage = firebase.storage();
  userData: AngularFireObject<User>
  user = {} as User;
  tempFeed = {} as Broadcast;
  feedItems: Observable<any>;
  error ='';
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
           this.feedItems = this.firebaseService.getFeedList(this.user.organization_ID).snapshotChanges();
         });
        } else {
          this.app.getRootNavs()[0].setRoot(LoginPage);
        }
      });
    }
    composeFeed(tempFeed: Broadcast) {
      if(tempFeed.text == null || tempFeed.text == '') {
        this.error = "Message cannot be blank!";
      } else {
        this.error = "";
        tempFeed.avatar_url = this.user.avatar_url;
        tempFeed.uid = this.user.uid;
        tempFeed.name = this.user.name;
        tempFeed.date = moment().toISOString();
        tempFeed.numOfComments = 0;
        tempFeed.numOfLikes = 0;
        this.firebaseService.addToFeedList(tempFeed,this.user.organization_ID);
        this.navCtrl.setRoot(FeedPage);
      }
      // this.firebaseService.addToBroadcastList
    }
  }
