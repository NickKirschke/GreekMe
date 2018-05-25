import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, App, NavParams } from 'ionic-angular';
import { AngularFireList } from "angularfire2/database";
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { AngularFireAuth } from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import { User } from "../../models/user";
import { UserLike } from "../../models/userLike";
import { Broadcast } from "../../models/broadcast";
import { UserServiceProvider } from "../../providers/user-service/user-service";
import { AngularFireObject } from "angularfire2/database";
import { async } from "rxjs/scheduler/async";
import { Storage } from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeBroadcastPage } from '../compose-broadcast/compose-broadcast';
import { ThreadPage } from '../thread/thread';
import { Observable } from 'rxjs/Observable';
import { PACKAGE_ROOT_URL } from '@angular/core/src/application_tokens';
import { getAllLifecycleHooks } from '@angular/compiler/src/lifecycle_reflector';
import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-greekme',
  templateUrl: 'greekme.html'
})
export class GreekMePage {
  @ViewChild('fixed') mapElement: ElementRef;
  fixedHeight: any;
  firebaseStorage = firebase.storage();
  userData: AngularFireObject<User>
  user = {} as User;
  validRole = false;
  broadcastItems: Observable<Broadcast[]>;
  broadcastItemRef: AngularFireList<any>;
  image: any;
  userLikedListRef: AngularFireList<any>;
  userLikedList: Observable<UserLike[]>;

  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private app: App,
    private userService: UserServiceProvider,
    private storage: Storage) {
        this.dataSetup();
  }

  logout() {
    this.afAuth.auth.signOut();
  }


  async dataSetup() {
    try {
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
    this.broadcastItemRef = this.firebaseService.getBroadcastList(this.user.organization_ID);
    this.userLikedListRef = this.firebaseService.getUserLikeList(this.user.uid);
    this.userLikedList = this.userLikedListRef.snapshotChanges().map(action => {
      return action.map(c => ({
        key: c.payload.key, ...c.payload.val()
      }));
    });
    this.broadcastItems = this.broadcastItemRef.snapshotChanges().map(action => {
      return action.map(c => ({
        key: c.payload.key, ...c.payload.val(), iconName: this.checkIcons(c.payload.key)
      })).reverse();
    });
    if (this.user.role == 'President' || this.user.role == ('Vice President') || this.user.role == ('Chair Member')) {
      this.validRole = true;
    }
    const imageGrab = this.firebaseService.getGreetingImage(this.user.organization_ID);
    imageGrab.then((result) => {
      this.image = result;
    }, (error) => {
      this.image = 'https://firebasestorage.googleapis.com/v0/b/greekme-7475a.appspot.com/o/GM_Default.png?alt=media&token=6bc30d40-17a2-40bb-9af7-edff78112780';
    });
  } catch(e) {
    console.log(e);
  }
    // console.log("End of data setup");
  }



  getLikeList() {
    return new Promise((resolve, reject) => {
      let likeList: UserLike[] = [];
      this.userLikedListRef.valueChanges().subscribe(items => items.forEach(item => likeList.push(item)));
      resolve(likeList);
    });
  }

  checkIcons(key: string) {

    // var iconType = "stupid";
    // this.userLikedList.forEach(items => {
    //       console.log(items);
    //       for (let i of items) {
    //         if (i.key === aKey) {
    //           iconType = "heart"
    //         }
    //       }
    //     });
    // if (iconType == "stupid") {
    //   iconType = "heart-outline";
    // }
    // return iconType;
    // const likes = this.getLikeList();
    // console.log(likes);
    let likeList: UserLike[] = [];
    const a = this.userLikedList.subscribe(items => items.forEach(item => likeList.push(item)));
    // console.log("bacon");
    // console.log(likeList);

    return likeList.some(item => item.key === key) ? "heart" : "heart-outline";
  }

  // ionViewDidEnter() {
  //   this.fixedHeight = this.mapElement.nativeElement.offsetHeight;
  // }

  calculateCommentLength(orgId: String, broadcastId: String) {
    this.firebaseService.getCommentListBroadcast(orgId, broadcastId);
  }

  doLike(item, index, $event) {
    // console.log($event);
    var heart = document.getElementById(index);
    if(item.iconName === 'heart-outline') {
      item.iconName = 'heart';
      console.log("heart");
    } else {
      item.iconName = 'heart-outline';

      console.log("outline");
    }
    // const promise = new Promise((resolve, reject) => {
    //   this.userLikedList.forEach(items => {
    //     console.log(items);
    //     var count = 0;
    //     for (let i of items) {
    //       if (i.key === item.key) {
    //         console.log("Liked set to true" + count);
    //         resolve(true);
    //         count++;
    //       }
    //       count++;
    //     }
    //     console.log("resolving false");
    //     resolve(false);
    //   });
    // });
    // const promise = new Promise((resolve) => {
    //   var result: boolean = false;
    //   const a = new Promise((resolve) => {
    //     this.userLikedList.forEach(likes => likes.forEach(like => {
    //       if (like.key === item.key) {
    //         resolve(true);
    //       }
    //     }));
    //   }).catch(err => console.log("no match"));
    //   a.then(function(res) {
    //     if(res) {
    //       resolve(true);
    //     } else {
    //       resolve(false);
    //     }
    //   }).catch(error => console.log(error))
    // });
    const promise = Promise.resolve(this.userLikedList).then(function (results) {
      return results.forEach(likes => likes.some(like => like.key === item.key)).then(function (res) {
        // console.log(res);
      })
    });

    // console.log(promise);
    promise.then((res) => {
      if (res) {
        // Do unlike
        console.log("doing unlike");
        heart.classList.toggle("hideHeart");
        // outline.classList.toggle("hideHeart");
        var updates = {};
        var currentLikes;
        var numOfLikesRef = firebase.database().ref('/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/numOfLikes');
        numOfLikesRef.on('value', function (snapshot) {
          currentLikes = snapshot.val();
        });
        updates['/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/likeList/' + this.user.uid] = null;
        updates['/users/' + this.user.uid + '/likeList/' + item.key] = null;
        updates['/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/numOfLikes/'] = currentLikes - 1;

        firebase.database().ref().update(updates).then(function () {
          console.log("Like removed");
          // console.log(outline);
          console.log(heart);
        }).catch(function (error) {
          console.log("Error");
          console.log(error);
        });
      } else {
        // Do like
        console.log("doing like");
        heart.classList.toggle("hideHeart");
        // outline.classList.toggle("hideHeart");
        var updates = {};
        //This is the object stored on the broadcast like list
        var userLikeObj = {
          name: this.user.name
        }
        //This is the object stored on the user's like list
        var broadcastLikeObj = {
          name: item.text,
          key: item.key
        }
        var currentLikes;
        var numOfLikesRef = firebase.database().ref('/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/numOfLikes');
        numOfLikesRef.on('value', function (snapshot) {
          currentLikes = snapshot.val();
        });
        updates['/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/likeList/' + this.user.uid] = userLikeObj;
        updates['/users/' + this.user.uid + '/likeList/' + item.key] = broadcastLikeObj;
        updates['/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/numOfLikes/'] = currentLikes + 1;
        firebase.database().ref().update(updates).then(function () {
          console.log("Like added ");
          // console.log(outline);
          console.log(heart);
          // console.log(document.getElementById("0"));
          //console.log(num)
        }).catch(function (error) {
          console.log("Error");
          console.log(error);

        });
      }
    }).catch(err => {
      console.log("Error");
    });
  }

  // doUnlike(item) {
  //   var updates = {};
  //   var currentLikes;
  //   var numOfLikesRef = firebase.database().ref('/organization/' + this.user.organization_ID + '/broadcast/' + item.$key + '/numOfLikes');
  //   numOfLikesRef.on('value', function (snapshot) {
  //     currentLikes = snapshot.val();
  //   });
  //   updates['/organization/' + this.user.organization_ID + '/broadcast/' + item.$key + '/likeList/' + this.user.uid] = null;
  //   updates['/users/' + this.user.uid + '/likeList/' + item.$key] = null;
  //   updates['/organization/' + this.user.organization_ID + '/broadcast/' + item.$key + '/numOfLikes/'] = currentLikes - 1;
  //   firebase.database().ref().update(updates).then(function () {
  //     console.log("Like removed");
  //   }).catch(function (error) {
  //     console.log(error);
  //   });
  // }

  // Make an attirbute 

  async isLiked(key: String) {
    var liked = false;
    const a = this.userLikedList.forEach(likes => likes.find(like => like.key === key));
    a.then(res => {return res});
  }

  itemSelected(item) {
    let bc = JSON.stringify(item);
    this.navCtrl.push(ThreadPage, {
      orgId: this.user.organization_ID,
      broadcast: bc,
      isBroadcast: true
    });
  }

  goToComposeBroadcast() {
    this.navCtrl.push(ComposeBroadcastPage, {
      isBroadcast: true
    });
  }

  viewProfile($event) {
    this.navCtrl.push(ProfilePage, {
      uid: $event
    });
  }
}


