import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AngularFireList } from 'angularfire2/database';
import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { User } from '../../models/user';
import { Broadcast } from '../../models/broadcast';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import 'firebase/storage';
import { ComposeBroadcastPage } from '../compose-broadcast/compose-broadcast';
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
  broadcastItems: Map<string, Broadcast> = new Map<string, Broadcast>();
  broadcastItemSubscription: Subscription;
  userLikeListRef: AngularFireList<any>;
  userLikeItems: Set<string> = new Set<string>();
  userLikeSubscription: Subscription;
  contentType: ContentType = ContentType.Broadcast;

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
    let broadcast : Broadcast;
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
        const expectedIconName = this.userLikeItems.has(action.key) ? 'heart-outline' : 'heart';
        // Construct the replacement broadcast
        broadcast = {
          key: action.payload.key,
          ...action.payload.val(),
          iconName: expectedIconName,
        };
        this.broadcastItems.set(broadcast.key, broadcast);
      }
    });
  }

  destroySubscriptions() {
    this.userLikeSubscription.unsubscribe();
    this.broadcastItemSubscription.unsubscribe();
  }

  goToComposeBroadcast() {
    const myModal = this.modal.create(ComposeBroadcastPage, { contentType: this.contentType });
    myModal.present();
  }

  trackByFn(index: number, item: Broadcast) {
    return item.key;
  }

  ionViewWillLoad() {
    this.dataSetup();
  }

  ionViewWillUnload() {
    this.destroySubscriptions();
  }

}
