import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AngularFireList } from 'angularfire2/database';
import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { AngularFireAuth } from 'angularfire2/auth/auth';
import { User } from '../../models/user';
import { UserLike } from '../../models/userLike';
import { Broadcast } from '../../models/broadcast';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeBroadcastPage } from '../compose-broadcast/compose-broadcast';
import { ThreadPage } from '../thread/thread';
import { Observable } from 'rxjs/Observable';
import { ProfilePage } from '../profile/profile';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-greekme',
  templateUrl: 'greekme.html',
})
export class GreekMePage {
  user = {} as User;
  validRole: boolean = false;
  broadcastItems$: Observable<Broadcast[]>;
  broadcastItemRef: AngularFireList<any>;
  broadcastItems: Map<string, Broadcast> = new Map<string, Broadcast>();
  broadcastItemSubscription: Subscription;
  image: string;
  userLikedListRef: AngularFireList<any>;
  userLikedList$: Observable<UserLike[]>;
  userLikeItems: Set<string> = new Set<string>();
  userLikeSubscription: Subscription;
  firstLoadComplete: boolean = false;

  constructor(private afAuth: AngularFireAuth,
              public navCtrl: NavController,
              public firebaseService: FirebaseServiceProvider,
              private userService: UserServiceProvider,
              private modal: ModalController,
              private cd: ChangeDetectorRef) {
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  async dataSetup() {
    try {
      const userGrab = await this.userService.currentUserInfo();
      this.user = userGrab as User;
      this.userLikedListRef = this.firebaseService.getUserLikeList(this.user.uid);
      this.broadcastItemRef = this.firebaseService.getBroadcastList(this.user.organizationId);
      // Validates whether or not the user can make broadcasts
      if (this.isValidBroadcastRole()) {
        this.validRole = true;
      }
      const imageGrab = this.firebaseService.getGreetingImage(this.user.organizationId);
      imageGrab.then(
        (result) => {
          this.image = result;
        },
        () => {
          this.image = 'assets/img/8d9YHCdTlOXCBqO65zNP_GM_Master01.png';
        });
      this.buildSubscriptions();
      // this.firstLoadComplete = true;
    } catch (e) {
      console.log(e);
    }
  }

  isValidBroadcastRole() {
    return this.user.role === 'President' ||
    this.user.role === 'Vice President' ||
    this.user.role === 'Chair Member';
  }

  destroySubscriptions() {
    this.userLikeSubscription.unsubscribe();
    this.broadcastItemSubscription.unsubscribe();
  }

  buildSubscriptions() {
    // TODO Set up the pipe to reverse the list
    let broadcast : Broadcast;
    this.userLikeSubscription = this.userLikedListRef.stateChanges().subscribe((action) => {
      const likeType = action.type;
      if (likeType === 'value' || likeType === 'child_added') {
        // console.log(likeType);
        this.userLikeItems.add(action.key);
      } else if (likeType === 'child_removed') {
        this.userLikeItems.delete(action.key);
      }
    });

    this.broadcastItemSubscription = this.broadcastItemRef.stateChanges()
    .subscribe((action) => {
      const broadcastType = action.type;
      if (broadcastType === 'value' || broadcastType === 'child_added') {
        broadcast = {
          key: action.payload.key,
          ...action.payload.val(),
          iconName: this.userLikeItems.has(action.key) ? 'heart' : 'heart-outline',
        };
        this.broadcastItems.set(broadcast.key, broadcast);
      } else if (broadcastType === 'child_changed') {
        const expectedIconName = this.userLikeItems.has(action.key) ? 'heart-outline' : 'heart';
        broadcast = {
          key: action.payload.key,
          ...action.payload.val(),
          iconName: expectedIconName,
        };
        this.broadcastItems.set(broadcast.key, broadcast);
        console.log('child changed');
      }
    });

  }

  calculateCommentLength(organizationId: string, broadcastId: string) {
    this.firebaseService.getCommentListBroadcast(organizationId, broadcastId);
  }

  itemSelected(item: Broadcast) {
    const bc = JSON.stringify(item);
    const data = {
      organizationId: this.user.organizationId,
      broadcast: bc,
      isBroadcast: true,
    };
    this.navCtrl.push(ThreadPage, data);
  }

  goToComposeBroadcast() {
    const myModal = this.modal.create(ComposeBroadcastPage, { isBroadcast: true });
    myModal.present();
  }

  viewProfile($event) {
    this.navCtrl.push(ProfilePage, {
      uid: $event,
    });
  }

  trackByFn(index: number, item: Broadcast) {
    return item.key;
  }

  ionViewWillLoad() {
    this.dataSetup();
  }

  ionViewWillEnter() {
    // The idea is to subscribe to the observables and then populate a data structure,
    // then reference that datastructure in the html, clean up the subscriptions in the
    // ionViewWillLeave and resetup the ionViewWillLoad
    // Running into race issue between the data setup and initializing the subscriptions
    // If this is the intialization, do the subscription setup in the dataSetup
    // if (this.firstLoadComplete) {
    //   this.buildSubscriptions();

    // }
  }

  ionViewWillLeave() {
    // this.destroySubscriptions();
  }

  ionViewWillUnload() {
    this.destroySubscriptions();
  }

}
