import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFireList } from "angularfire2/database";
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { AngularFireAuth } from "angularfire2/auth/auth";
import { User } from "../../models/user";
import { Broadcast } from "../../models/broadcast";
import { UserServiceProvider } from "../../providers/user-service/user-service";
import { AngularFireObject } from "angularfire2/database";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { Observable } from 'rxjs/Observable';
import { ThreadPage } from '../thread/thread';
import { ComposeBroadcastPage } from '../compose-broadcast/compose-broadcast';
import { ProfilePage } from '../profile/profile';


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
  feedItems$: Observable<Broadcast[]>;
  feedItemRef: AngularFireList<any>;
  userLikedList$: Observable<any>;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private userService: UserServiceProvider) {
        const userGrab = this.userService.currentUserInfo();
        userGrab.then((result) => {
          this.user = result as User;
          this.feedItemRef = this.firebaseService.getFeedList(this.user.organization_ID);
          this.feedItems$ = this.feedItemRef.snapshotChanges().map(action => {
            return action.map(c => ({
              key: c.payload.key, ...c.payload.val(), iconName: "heart-outline"
            })).reverse();
          });
          this.userLikedList$ = this.firebaseService.getUserLikeList(this.user.uid).snapshotChanges().map(action => {
            return action.map(c => ({
              key: c.payload.key, ...c.payload.val()
            }));
          });
    });
  }
  logout() {
    this.afAuth.auth.signOut();
  }

  doLike(item) {
    //console.log(document.getElementById('0'));
    if (item.iconName === 'heart-outline') {
      item.iconName = 'heart';
      console.log("heart");
    } else {
      item.iconName = 'heart-outline';

      console.log("outline");
    }

    const promise = Promise.resolve(this.userLikedList$).then(function (results) {
      return results.forEach(likes => likes.some(like => like.key === item.key)).then(function (res) {
        // console.log(res);
      })
    });
    // const promise = new Promise((resolve, reject) => {
    //   this.userLikedList.subscribe(items => {
    //     for (let i of items) {
    //       if (i.key === item.key) {
    //         console.log("Liked set to true");
    //         resolve(true);
    //       }
    //     }
    //     resolve(false);
    //   });
    // });
    promise.then((res) => {
      if (res) {
        // Do unlike
        let updates = {};
        let currentLikes;
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

        let updates = {};
        let userLikeObj = {
          name: this.user.name
        }
        let messageLikeObj = {
          name: item.text
        }
        let currentLikes;
        let numOfLikesRef = firebase.database().ref('/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/numOfLikes');
        numOfLikesRef.on('value', function (snapshot) {
          currentLikes = snapshot.val();
        });
        updates['/organization/' + this.user.organization_ID + '/message/' + item.key + '/likeList/' + this.user.uid] = userLikeObj;
        updates['/users/' + this.user.uid + '/likeList/' + item.key] = messageLikeObj;
        updates['/organization/' + this.user.organization_ID + '/message/' + item.key + '/numOfLikes/'] = currentLikes + 1;
        firebase.database().ref().update(updates).then(function () {
          console.log("Like added!");
        }).catch(function (error) {
          console.log(error);
        });
      }
    });
  }

  itemSelected(item) {
    let bc = JSON.stringify(item);
    this.navCtrl.push(ThreadPage, {
      orgId: this.user.organization_ID,
      broadcast: bc,
      isBroadcast: false
    });
  }

  goToComposeFeed() {
    this.navCtrl.push(ComposeBroadcastPage, {
      isBroadcast: false
    });
  }

  viewProfile($event) {
    this.navCtrl.push(ProfilePage, {
      uid: $event
    });
  }
}