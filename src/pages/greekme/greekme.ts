import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AngularFireList } from "angularfire2/database";
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { AngularFireAuth } from "angularfire2/auth/auth";
import { User } from "../../models/user";
import { UserLike } from "../../models/userLike";
import { Broadcast } from "../../models/broadcast";
import { UserServiceProvider } from "../../providers/user-service/user-service";
import { AngularFireObject } from "angularfire2/database";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeBroadcastPage } from '../compose-broadcast/compose-broadcast';
import { ThreadPage } from '../thread/thread';
import { Observable } from 'rxjs/Observable';
import { ProfilePage } from '../profile/profile';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-greekme',
  templateUrl: 'greekme.html'
})
export class GreekMePage {
  user = {} as User;
  validRole = false;
  broadcastItems$: Observable<Broadcast[]>;
  broadcastItemRef: AngularFireList<any>;
  image: any;
  userLikedListRef: AngularFireList<any>;
  userLikedList$: Observable<UserLike[]>;
  userLikeItems = [];
  userLikeSubscription: Subscription;
  firstLoadComplete: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private userService: UserServiceProvider, private modal: ModalController) {
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  async dataSetup() {
    try {
      const userGrab = await this.userService.currentUserInfo();
      this.user = userGrab as User;
      this.userLikedListRef = this.firebaseService.getUserLikeList(this.user.uid);
      this.broadcastItemRef = this.firebaseService.getBroadcastList(this.user.organization_ID);

      if (this.user.role == 'President' || this.user.role == ('Vice President') || this.user.role == ('Chair Member')) {
        this.validRole = true;
      }
      const imageGrab = this.firebaseService.getGreetingImage(this.user.organization_ID);
      imageGrab.then((result) => {
        this.image = result;
      }, (error) => {
        this.image = 'assets/img/8d9YHCdTlOXCBqO65zNP_GM_Master01.png';
      });
      this.buildSubscriptions();
      this.broadcastItems$ = this.broadcastItemRef.snapshotChanges().map(action => {
        return action.map(c => ({
          key: c.payload.key, ...c.payload.val(), iconName: this.userLikeItems.find(item => item === c.key) ? 'heart' : 'heart-outline'
        })).reverse();
      });
      this.firstLoadComplete = true;
    } catch (e) {
      console.log(e);
    }
  }

  ionViewWillLoad() {
    this.dataSetup();
  }

  ionViewWillEnter() {
    // The idea is to subscribe to the observables and then populate a data structure, then reference that datastructure in the html, clean up the subscriptions in the
    // ionViewWillLeave and resetup the ionViewWillLoad
    // Running into race issue between the data setup and initializing the subscriptions

    //If this is the intialization, do the subscription setup in the dataSetup
    if (this.firstLoadComplete) {
      this.buildSubscriptions();

    }
  }

  buildSubscriptions() {
    // Need to handle updates and deletes, deletes might get a little weird with unliking stuff.
    this.userLikeSubscription = this.userLikedListRef.stateChanges().subscribe(action => {
        let type = action.type;
        if (type === 'value' || type === 'child_added') {
          this.userLikeItems.push(action.key);
        } else if (type === 'child_removed') {
          let index = this.userLikeItems.indexOf(action.key);
          if(index !== -1) {
            this.userLikeItems.splice(index, 1);
          }
        }
      });
  }

  ionViewWillLeave() {
    this.userLikeSubscription.unsubscribe();
  }

  calculateCommentLength(orgId: String, broadcastId: String) {
    this.firebaseService.getCommentListBroadcast(orgId, broadcastId);
  }

  doLike(item, index, $event) {
    let updates = {};
    let currentLikes = 0;
    const broadcastPath = `/organization/${this.user.organization_ID}/broadcast/${item.key}/likeList/${this.user.uid}`;
    const userLikePath = `/users/${this.user.uid}/likeList/${item.key}`;
    const numOfLikePath = `/organization/${this.user.organization_ID}/broadcast/${item.key}/numOfLikes/`;
    let numOfLikesRef = firebase.database().ref('/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/numOfLikes');
    numOfLikesRef.on('value', function (snapshot) {
      currentLikes = snapshot.val();
    });
    let isLiked = this.userLikeItems.find(bcItem => bcItem === item.key);
    console.log(isLiked);
    if (isLiked) {
      // Do unlike
      updates[broadcastPath] = null;
      updates[userLikePath] = null;
      updates[numOfLikePath] = currentLikes - 1;

      firebase.database().ref().update(updates).then(() => {
        console.log("Did unlike");
        
      }).catch(error => {
        console.log("Error unlike");
        console.log(error.message());
      });
    } else {
      // Do like
      let userLikeObj = { //This is the object stored on the broadcast like list
        name: this.user.name
      };
      let broadcastLikeObj = { //This is the object stored on the user's like list
        name: item.text,
        key: item.key
      };
      updates[broadcastPath] = userLikeObj;
      updates[userLikePath] = broadcastLikeObj;
      updates[numOfLikePath] = currentLikes + 1;

      firebase.database().ref().update(updates).then(() => {
        console.log("Did like");
      }).catch(error => {
        console.log("Error like");
        console.log(error.message());
      });
    }
  }

  itemSelected(item) {
    let bc = JSON.stringify(item);
    const data = {
      orgId: this.user.organization_ID,
      broadcast: bc,
      isBroadcast: true
    };
    this.navCtrl.push(ThreadPage, {
      data: data
    });
  }

  goToComposeBroadcast() {
    const myModal = this.modal.create(ComposeBroadcastPage, { isBroadcast: true });
    myModal.present();
  }

  viewProfile($event) {
    this.navCtrl.push(ProfilePage, {
      uid: $event
    });
  }

  trackByFn(index, item) {
    return index;
  }
}


