import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AngularFireList } from 'angularfire2/database';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { UserServiceProvider } from '../../providers/userService/userService';
import { ComposePostPage } from '../composePost/composePost';
import { Subscription, Observable } from 'rxjs';
import { ContentType } from '../../models/contentType';
import { FcmProvider } from '../../providers/fcm/fcm';
import { NotificationsPage } from '../notifications/notifications';
import * as Rx from 'rxjs/Rx';

@Component({
  selector: 'page-greekme',
  templateUrl: 'greekme.html',
})
export class GreekMePage {
  user = {} as User;
  validRole = false;
  image = '../../assets/img/8d9YHCdTlOXCBqO65zNP_GM_Master01.png';
  loadCap = 10;
  reserveBroadcasts =  [];
  broadcastItemRef: AngularFireList<any>;
  broadcastItems = new Map<string, Post>();
  broadcastItemSubscription: Subscription;
  userLikeListRef: AngularFireList<any>;
  userLikeItems = new Set<string>();
  userLikeSubscription: Subscription;
  notificationsSubscription: Subscription;
  notificationsIcon = 'notifications-outline';
  notificationCount = 0;
  constructor(public navCtrl: NavController,
              public firebaseService: FirebaseServiceProvider,
              private userService: UserServiceProvider,
              private modalController: ModalController,
              private fcm: FcmProvider) {
  }

  async dataSetup() {
    try {
      // Setup the user's details and aqcuire the references to the data in firebase
      const userGrab = await this.userService.currentUserInfo();
      this.user = userGrab as User;
      this.userLikeListRef = this.firebaseService.getUserLikeList(this.user.uid);
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
    } catch (e) {
      console.log(e);
    }
  }

  isValidBroadcastRole() {
    return this.user.role === 'President' ||
    this.user.role === 'Vice President' ||
    this.user.role === 'Chair Member';
  }

  buildSubscriptions() {
    let broadcast : Post;
    let broadcastCounter = 0;
    // Subscriptions for handling the user's likes and the broadcasts on the page
    // Data is passed into a Set
    this.userLikeSubscription = this.userLikeListRef.stateChanges().subscribe((action) => {
      if (action.type === 'value' || action.type === 'child_added') {
        this.userLikeItems.add(action.key);
      } else if (action.type === 'child_removed') {
        this.userLikeItems.delete(action.key);
      }
    });

    // Broadcast data is stored in a Map
    this.broadcastItemSubscription = this.broadcastItemRef.stateChanges()
    .subscribe((action) => {
      if (action.type === 'value' || action.type === 'child_added') {
        broadcast = {
          key: action.payload.key,
          ...action.payload.val(),
          iconName: this.userLikeItems.has(action.key) ? 'heart' : 'heart-outline',
        };
        this.broadcastItems.set(broadcast.key, broadcast);
        broadcastCounter += 1;
      } else if (action.type === 'child_changed') {
        const previousBroadcast = this.broadcastItems.get(action.key);
        const expectedIconName = previousBroadcast.iconName;
        // Construct the replacement broadcast
        broadcast = {
          key: action.payload.key,
          ...action.payload.val(),
          iconName: expectedIconName,
        };
        Object.keys(this.broadcastItems.get(broadcast.key)).forEach((aProperty) => {
          // If the value of the new broadcast is different, replace it on the previous one
          if (previousBroadcast[aProperty] !==  broadcast[aProperty]) {
            previousBroadcast[aProperty] = broadcast[aProperty];
          }
        });
      }
    });
    this.notificationsSubscription = this.userService.notificationSizeSubject.subscribe({
      next: (size) => {
        if (size > 0) {
          this.notificationsIcon = 'notifications';
        } else {
          this.notificationsIcon = 'notifications-outline';
        }
      },
    });
  }

  destroySubscriptions() {
    this.userLikeSubscription.unsubscribe();
    this.broadcastItemSubscription.unsubscribe();
    this.notificationsSubscription.unsubscribe();
  }

  goToComposeBroadcast() {
    const myModal = this.modalController
      .create(ComposePostPage, { contentType: ContentType.Broadcast });
    myModal.present();
  }

  goToNotifications() {
    const myModal = this.modalController
      .create(NotificationsPage);
    myModal.present();
  }

  trackByFn(index: number, item: Post) {
    return item.key;
  }

  doInfinite(infiniteScroll) {
    console.log('Begin async operation');
    setTimeout(() => {
      while (this.reserveBroadcasts.length > 0) {
        const tempBroadcast = this.reserveBroadcasts.shift();
        console.log(tempBroadcast);
        this.broadcastItems.set(tempBroadcast.key, tempBroadcast);
      }
      console.log('Async operation has ended');
      infiniteScroll.complete();
    },         500);
  }

  ionViewWillLoad() {
    this.dataSetup();
  }

  ionViewWillUnload() {
    this.destroySubscriptions();
  }

}
