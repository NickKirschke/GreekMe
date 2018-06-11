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
  @ViewChild('fixed') mapElement: ElementRef;
  fixedHeight: any;
  firebaseStorage = firebase.storage();
  userData: AngularFireObject<User>
  user = {} as User;
  validRole = false;
  broadcastItems$: Observable<Broadcast[]>;
  broadcastItemRef: AngularFireList<any>;
  image: any;
  userLikedListRef: AngularFireList<any>;
  userLikedList$: Observable<UserLike[]>;
  broadcastItems = [] as Broadcast[];
  userLikeItems = [] as UserLike[];
  userLikeSubscription: Subscription;
  broadcastSubscription: Subscription;
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
      if(this.firstLoadComplete) {
        this.buildSubscriptions();
      }
  }

  buildSubscriptions() {
    // Need to handle updates and deletes, deletes might get a little weird with unliking stuff.
    this.userLikeSubscription = this.userLikedListRef.snapshotChanges().subscribe(actions => {
      actions.forEach(c => {
        if(c.type === 'value'|| c.type === 'child_added') {
          let userLike = { key: c.key, ...c.payload.val() }
          this.userLikeItems.push(userLike);
        }
      });
    });
    this.broadcastSubscription = this.broadcastItemRef.snapshotChanges().subscribe(actions => {
      actions.forEach(c => {
        if(c.type === 'value' || c.type === 'child_added') {
          let broadcast = { key: c.key, ...c.payload.val(), iconName: this.userLikeItems.find(item => item.key === c.key) ? 'heart': 'heart-outline' }
          this.broadcastItems.push(broadcast);
          this.broadcastItems.reverse();
        }
      });
    });
  }

  ionViewWillLeave() {
    this.userLikeSubscription.unsubscribe();
    this.broadcastSubscription.unsubscribe();
  }

  calculateCommentLength(orgId: String, broadcastId: String) {
    this.firebaseService.getCommentListBroadcast(orgId, broadcastId);
  }

  doLike(item, index, $event) {
      let updates = {};
      let currentLikes = 0;
      let numOfLikesRef = firebase.database().ref('/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/numOfLikes');
        numOfLikesRef.on('value', function (snapshot) {
          currentLikes = snapshot.val();
        });
      if (item.iconName === 'heart') {
        // Do unlike
        updates['/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/likeList/' + this.user.uid] = null;
        updates['/users/' + this.user.uid + '/likeList/' + item.key] = null;
        updates['/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/numOfLikes/'] = currentLikes - 1;

        firebase.database().ref().update(updates).then(() => {
          item.iconName = 'heart-outline';
        }).catch(error => {
          console.log("Error unlike");
          console.log(error.message());
        });
      } else {
        // Do like
        var userLikeObj = { //This is the object stored on the broadcast like list
          name: this.user.name
        };
        var broadcastLikeObj = { //This is the object stored on the user's like list
          name: item.text,
          key: item.key
        };
        updates['/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/likeList/' + this.user.uid] = userLikeObj;
        updates['/users/' + this.user.uid + '/likeList/' + item.key] = broadcastLikeObj;
        updates['/organization/' + this.user.organization_ID + '/broadcast/' + item.key + '/numOfLikes/'] = currentLikes + 1;
        firebase.database().ref().update(updates).then(() => {
          item.iconName = 'heart';
        }).catch(error => {
          console.log("Error like");
          console.log(error.message());
        });
      }
  }

  async isLiked(key: String) {
    const a = this.userLikedList$.forEach(likes => likes.find(like => like.key === key));
    a.then(res => { return res });
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
}


