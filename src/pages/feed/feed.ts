import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AngularFireList } from 'angularfire2/database';
import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { AngularFireAuth } from 'angularfire2/auth/auth';
import { User } from '../../models/user';
import { Broadcast } from '../../models/broadcast';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import 'firebase/storage';
import { ComposeBroadcastPage } from '../compose-broadcast/compose-broadcast';
import { ContentType } from '../../models/contentType';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {
  user = {} as User;
  messageItemRef: AngularFireList<any>;
  messageItems: Map<string, Broadcast> = new Map<string, Broadcast>();
  messageItemSubscription: Subscription;
  userLikeListRef: AngularFireList<any>;
  userLikeItems: Set<string> = new Set<string>();
  userLikeSubscription: Subscription;

  constructor(private afAuth: AngularFireAuth,
              public navCtrl: NavController,
              public firebaseService: FirebaseServiceProvider,
              private userService: UserServiceProvider,
              private modal: ModalController) {
  }

  goToComposeFeed() {
    const myModal = this.modal.create(ComposeBroadcastPage, { contentType: ContentType.Message });
    myModal.present();
  }

  async dataSetup() {
    // Setup the user's data and retrieve the data references in firebase
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
    this.userLikeListRef = this.firebaseService.getUserLikeList(this.user.uid);
    this.messageItemRef = this.firebaseService.getFeedList(this.user.organizationId);
    this.buildSubscriptions();
  }

  buildSubscriptions() {
    let message : Broadcast;
    // Subscriptions for handling the user's likes and the broadcasts on the page
    // Data is passed into a Set
    this.userLikeSubscription = this.userLikeListRef.stateChanges().subscribe((action) => {
      if (action.type === 'value' || action.type === 'child_added') {
        this.userLikeItems.add(action.key);
      } else if (action.type === 'child_removed') {
        this.userLikeItems.delete(action.key);
      }
    });

    // Message data is stored in a Map
    this.messageItemSubscription = this.messageItemRef.stateChanges()
    .subscribe((action) => {
      if (action.type === 'value' || action.type === 'child_added') {
        message = {
          key: action.payload.key,
          ...action.payload.val(),
          iconName: this.userLikeItems.has(action.key) ? 'heart' : 'heart-outline',
        };
        this.messageItems.set(message.key, message);
      } else if (action.type === 'child_changed') {
        const expectedIconName = this.userLikeItems.has(action.key) ? 'heart-outline' : 'heart';
        // Construct the replacement message
        message = {
          key: action.payload.key,
          ...action.payload.val(),
          iconName: expectedIconName,
        };
        this.messageItems.set(message.key, message);
      }
    });
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  trackByFn(index: number, item: Broadcast) {
    return item.key;
  }

  destroySubscriptions() {
    this.userLikeSubscription.unsubscribe();
    this.messageItemSubscription.unsubscribe();
  }

  ionViewWillUnload() {
    this.destroySubscriptions();
  }

  ionViewDidLoad() {
    this.dataSetup();
  }
}
