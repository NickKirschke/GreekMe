import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AngularFireList } from 'angularfire2/database';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { UserServiceProvider } from '../../providers/userService/userService';
import 'firebase/storage';
import { ComposePostPage } from '../composePost/composePost';
import { Subscription } from 'rxjs';
import { ContentType } from '../../models/contentType';

@Component({
  selector: 'page-greekme',
  templateUrl: 'greekme.html',
})
export class GreekMePage {
  user = {} as User;
  validRole: boolean = false;
  image: string;
  broadcastItemRef: AngularFireList<any>;
  broadcastItems: Map<string, Post> = new Map<string, Post>();
  broadcastItemSubscription: Subscription;
  userLikeListRef: AngularFireList<any>;
  userLikeItems: Set<string> = new Set<string>();
  userLikeSubscription: Subscription;

  constructor(public navCtrl: NavController,
              public firebaseService: FirebaseServiceProvider,
              private userService: UserServiceProvider,
              private modal: ModalController) {
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
  }

  destroySubscriptions() {
    this.userLikeSubscription.unsubscribe();
    this.broadcastItemSubscription.unsubscribe();
  }

  goToComposeBroadcast() {
    const myModal = this.modal.create(ComposePostPage, { contentType: ContentType.Broadcast });
    myModal.present();
  }

  trackByFn(index: number, item: Post) {
    return item.key;
  }

  ionViewWillLoad() {
    this.dataSetup();
  }

  ionViewWillUnload() {
    this.destroySubscriptions();
  }

}
