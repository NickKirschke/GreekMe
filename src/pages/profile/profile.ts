import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, App, PopoverController, NavParams, ModalController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth/auth';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { LoginPage } from '../login/login';
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/userService/userService';
import { Observable } from 'rxjs/Observable';
import { AngularFireList } from 'angularfire2/database';
import { Post } from '../../models/post';
import { EventViewPage } from '../eventView/eventView';
import { PopOverComponent } from '../../components/pop-over/pop-over';
import { EditProfilePage } from '../editProfile/editProfile';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import * as firebase from 'firebase/app';
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  isUser: boolean;
  user = {} as User;
  postItems: Map<string, Post> = new Map<string, Post>();
  postItemRef: AngularFireList<any>;
  postItemSubscription: Subscription;
  eventItems$: Observable<any>;
  eventItemsRef: AngularFireList<any>;
  profileContent: string = 'posts';
  userLikeListRef: AngularFireList<any>;
  userLikeItems: Set<string> = new Set<string>();
  userLikeSubscription: Subscription;
  avatar = '' as string;

  constructor(private afAuth: AngularFireAuth,
              public navCtrl: NavController,
              private firebaseService: FirebaseServiceProvider,
              private userService: UserServiceProvider,
              private popoverCtrl: PopoverController,
              public navParams: NavParams,
              private storage: Storage,
              private modal: ModalController,
              private app: App) {
  }

  ionViewWillLoad() {
    this.dataSetup();
  }

  async ionViewWillEnter() {
    const path = `${this.user.organizationId}/profilePhotos/${this.user.uid}`;
    this.avatar = await firebase.storage().ref(path).getDownloadURL();
  }

  async dataSetup() {
    const guestUser = this.navParams.get('uid');
    // Check to see if it is a user navigating through profile pictures, if so hide the options
    if (guestUser) {
      this.isUser = false;
      const guestProfileUserGrab = await this.firebaseService.getUserDetailsProfilePage(guestUser);
      this.user = guestProfileUserGrab as User;
    } else {
      this.isUser = true;
      const userGrab = await this.userService.currentUserInfo();
      this.user = userGrab as User;
    }
    this.userLikeListRef = this.firebaseService.getUserLikeList(this.user.uid);
    this.postItemRef = this.firebaseService.getUserPostList(this.user.uid);
    this.eventItemsRef = this.firebaseService.getUserEventsAttending(this.user.uid);
    this.buildSubscriptions();
    this.eventItems$ = this.eventItemsRef.snapshotChanges().map((action) => {
      return action.map(c => ({
        key: c.payload.key, ...c.payload.val(),
      }));
    });

    this.buildSubscriptions();
    await this.removeOldEvents();
  }

  buildSubscriptions() {
    let broadcast : Post;
    // Subscriptions for handling the user's posts
    // Broadcast data is stored in a Map

    this.userLikeSubscription = this.userLikeListRef.stateChanges().subscribe((action) => {
      if (action.type === 'value' || action.type === 'child_added') {
        this.userLikeItems.add(action.key);
      } else if (action.type === 'child_removed') {
        this.userLikeItems.delete(action.key);
      }
    });

    this.postItemSubscription = this.postItemRef.stateChanges()
    .subscribe((action) => {
      if (action.type === 'value' || action.type === 'child_added') {
        broadcast = {
          key: action.payload.key,
          ...action.payload.val(),
          iconName: this.userLikeItems.has(action.key) ? 'heart' : 'heart-outline',
        };
        this.postItems.set(broadcast.key, broadcast);
      } else if (action.type === 'child_changed') {
        const expectedIconName = this.userLikeItems.has(action.key) ? 'heart-outline' : 'heart';
        // Construct the replacement broadcast
        broadcast = {
          key: action.payload.key,
          ...action.payload.val(),
          iconName: expectedIconName,
        };
        const previousBroadcast = this.postItems.get(broadcast.key);
        Object.keys(this.postItems.get(broadcast.key)).forEach((aProperty) => {
          // If the value of the new broadcast is different, replace it on the previous one
          if (previousBroadcast[aProperty] !==  broadcast[aProperty]) {
            previousBroadcast[aProperty] = broadcast[aProperty];
          }
        });
      }
    });
  }

  editProfile() {
    const myModal = this.modal.create(EditProfilePage, {
      user: JSON.stringify(this.user),
      avatar: this.avatar,
    });
    myModal.present();
    myModal.onWillDismiss((userData) => {
      if (userData) {
        const updatedUser = JSON.parse(userData.user) as User;
        Object.keys(this.user).forEach((aProperty) => {
          // If the value of the new user is different, replace it on the previous one
          if (this.user[aProperty] !==  updatedUser[aProperty]) {
            this.user[aProperty] = updatedUser[aProperty];
          }
          this.avatar = userData.avatar;
        });
      }
    });
  }

  goToEvent(key: string) {
    const paramObj = {
      eventId: key,
    };
    this.navCtrl.push(EventViewPage, paramObj);
  }

  presentPopover(popOverEvent) {
    const popover = this.popoverCtrl.create(PopOverComponent, {
      items: [{ name: 'Edit Profile' }, { name: 'Settings' }, { name: 'Log Out' }],
    });
    popover.present({ ev: popOverEvent });
    popover.onWillDismiss((data) => {
      if (data) {
        if (data.name === 'Log Out') {
          this.logout();
        } else if (data.name === 'Edit Profile') {
          this.editProfile();
        }
      }
    });
  }

  removeOldEvents() {
    new Promise((resolve, reject) => {
      this.eventItems$.subscribe((items) => {
        for (const i of items) {
          const tempDate = moment(i.date);
          if (tempDate.diff(moment()) < -86400000) {
            this.eventItemsRef.remove(i.key);
          }
        }
        resolve(false);
      });
    });
  }

  destroySubscriptions() {
    this.userLikeSubscription.unsubscribe();
    this.postItemSubscription.unsubscribe();
  }

  ionViewWillUnload() {
    this.destroySubscriptions();
  }

  trackByFn(index: number, item: Post) {
    return item.key;
  }

  logout() {
    this.afAuth.auth.signOut().then(() => {
      this.app.getRootNavs()[0].setRoot(LoginPage);
      this.storage.remove('user');
    }).catch((e) => {
      console.log(e);
      console.log(e.message);
    });
  }
}
