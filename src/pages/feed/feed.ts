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
import { MessageThreadPage } from '../message-thread/message-thread';


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
  userLikedList: Observable<any>;
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
          });
          this.userLikedList = this.firebaseService.getUserLikeList(this.user.uid).snapshotChanges().map(action => {
            return action.map(c => ({
              key: c.payload.key, ...c.payload.val()
            }));
          });
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
  doLike(item) {
    //console.log(document.getElementById('0'));
    const promise = new Promise((resolve, reject) => {
      this.userLikedList.subscribe(items => {
        for (let i of items) {
          if (i.key === item.key) {
            console.log("Liked set to true");
            resolve(true);
          }
        }
        resolve(false);
      });
    });
    promise.then((res) => {
      if (res) {
        // Do unlike
        var updates = {};
        var currentLikes;
        let numOfLikesRef = firebase.database().ref('/organization/' + this.user.organization_ID + '/message/' + item.key + '/numOfLikes');
        numOfLikesRef.on('value', function (snapshot) {
          currentLikes = snapshot.val();
        });
        updates['/organization/' + this.user.organization_ID + '/message/' + item.key + '/likeList/' + this.user.uid] = null;
        updates['/users/' + this.user.uid + '/likeList/' + item.key] = null;
        updates['/organization/' + this.user.organization_ID + '/message/' + item.key + '/numOfLikes/'] = currentLikes - 1;
        
        firebase.database().ref().update(updates).then(function () {
          console.log("Like removed");
        }).catch(function (error) {
          console.log(error);
        });
      } else {
        // Do like
        var updates = {};
        var userLikeObj = {
          name: this.user.name
        }
        var messageLikeObj = {
          name: item.text
        }
        var currentLikes;
        let numOfLikesRef = firebase.database().ref('/organization/' + this.user.organization_ID + '/broadcast/' + item.$key + '/numOfLikes');
        numOfLikesRef.on('value', function (snapshot) {
          currentLikes = snapshot.val();
        });
        updates['/organization/' + this.user.organization_ID + '/message/' + item.key + '/likeList/' + this.user.uid] = userLikeObj;
        updates['/users/' + this.user.uid + '/likeList/' + item.key] = messageLikeObj;
        updates['/organization/' + this.user.organization_ID + '/message/' + item.key + '/numOfLikes/'] = currentLikes + 1;
        firebase.database().ref().update(updates).then(function () {
          console.log("Like added ");
          // console.log(document.getElementById("0"));
          //console.log(num)
        }).catch(function (error) {
          console.log(error);
        });
      }
    });
  } 
  itemSelected(item) {
    console.log(item);
    // console.log(item);
    this.navCtrl.push(MessageThreadPage, {
      avatar_url: item.avatar_url,
      text: item.text,
      name: item.name,
      date: item.date,
      uid: item.uid,
      key: item.key,
      orgId: this.user.organization_ID
    });
  }
}