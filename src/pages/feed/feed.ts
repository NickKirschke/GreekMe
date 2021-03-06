import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AngularFireList } from 'angularfire2/database';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { UserServiceProvider } from '../../providers/userService/userService';
import 'firebase/storage';
import { ComposePostPage } from '../composePost/composePost';
import { ContentType } from '../../models/contentType';
import { Subscription } from 'rxjs';
import { NotificationsPage } from '../notifications/notifications';

@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {
  user = {} as User;
  messageItemRef: AngularFireList<any>;
  messageItems: Map<string, Post> = new Map<string, Post>();
  messageItemSubscription: Subscription;
  userLikeListRef: AngularFireList<any>;
  userLikeItems: Set<string> = new Set<string>();
  userLikeSubscription: Subscription;
  notificationsSubscription: Subscription;
  notificationsIcon = 'notifications-outline';

  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private userService: UserServiceProvider,
    private modalController: ModalController,
  ) {}

  goToComposeFeed() {
    const myModal = this.modalController.create(ComposePostPage, {
      contentType: ContentType.Message,
    });
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
    let message: Post;
    // Subscriptions for handling the user's likes and the broadcasts on the page
    // Data is passed into a Set
    this.userLikeSubscription = this.userLikeListRef.stateChanges().subscribe(action => {
      if (action.type === 'value' || action.type === 'child_added') {
        this.userLikeItems.add(action.key);
      } else if (action.type === 'child_removed') {
        this.userLikeItems.delete(action.key);
      }
    });

    // Message data is stored in a Map
    this.messageItemSubscription = this.messageItemRef.stateChanges().subscribe(action => {
      if (action.type === 'value' || action.type === 'child_added') {
        message = {
          key: action.payload.key,
          ...action.payload.val(),
          iconName: this.userLikeItems.has(action.key) ? 'heart' : 'heart-outline',
        };
        this.messageItems.set(message.key, message);
      } else if (action.type === 'child_changed') {
        const previousMessage = this.messageItems.get(action.key);
        const iconName = this.userLikeItems.has(action.key) ? 'heart' : 'heart-outline';
        // Construct the replacement message
        message = {
          key: action.payload.key,
          ...action.payload.val(),
          iconName,
        };
        Object.keys(previousMessage).forEach(aProperty => {
          if (!message[aProperty]) {
            previousMessage[aProperty] = null;
          } else if (previousMessage[aProperty] !== message[aProperty]) {
            previousMessage[aProperty] = message[aProperty];
          }
        });
        Object.keys(message).forEach(aProperty => {
          if (!previousMessage[aProperty]) {
            previousMessage[aProperty] = message[aProperty];
          }
        });
      }
    });
    this.notificationsSubscription = this.userService.notificationSizeSubject.subscribe({
      next: size => {
        if (size > 0) {
          this.notificationsIcon = 'notifications';
        } else {
          this.notificationsIcon = 'notifications-outline';
        }
      },
    });
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  trackByFn(index: number, item: Post) {
    return item.key;
  }

  destroySubscriptions() {
    this.userLikeSubscription.unsubscribe();
    this.messageItemSubscription.unsubscribe();
    this.notificationsSubscription.unsubscribe();
  }

  ionViewWillUnload() {
    this.destroySubscriptions();
  }

  goToNotifications() {
    const myModal = this.modalController.create(NotificationsPage);
    myModal.present();
  }

  ionViewWillLoad() {
    this.dataSetup();
  }
}
