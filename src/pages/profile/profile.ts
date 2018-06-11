import { Component } from '@angular/core';
import { Storage } from "@ionic/storage";
import { NavController, App, PopoverController, NavParams, ModalController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth/auth";
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { LoginPage } from "../login/login";
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { Observable } from 'rxjs/Observable';
import { AngularFireList } from 'angularfire2/database';
import { Broadcast } from '../../models/broadcast';
import { EventViewPage } from '../event-view/event-view';
import { PopOverComponent } from '../../components/pop-over/pop-over';
import { EditProfilePage } from '../edit-profile/edit-profile';
import * as moment from 'moment';
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  isUser: boolean;
  App: App;
  user = {} as User;
  postItems$: Observable<Broadcast[]>;
  postItemRef: AngularFireList<any>;
  eventItems$: Observable<any>;
  eventItemsRef: AngularFireList<any>;
  profileContent: string = 'posts';
  constructor(private afAuth: AngularFireAuth, public navCtrl: NavController, private firebaseService: FirebaseServiceProvider, private userService: UserServiceProvider, private app: App,
    private popoverCtrl: PopoverController, public navParams: NavParams, private storage: Storage, private modal: ModalController) {
  }

  ionViewDidLoad() {
    this.dataSetup();
  }
  
  async dataSetup() {
    let guestUser = this.navParams.get("uid");
    if (guestUser) { // Check to see if it is a user navigating through profile pictures, if so hide the options
      this.isUser = false;
      const guestProfileUserGrab = await this.firebaseService.getUserDetailsProfilePage(guestUser);
      this.user = guestProfileUserGrab as User;
    } else {
      this.isUser = true;
      const userGrab = await this.userService.currentUserInfo();
      this.user = userGrab as User;
    }
    this.postItemRef = this.firebaseService.getUserPostList(this.user.uid);
    this.eventItemsRef = this.firebaseService.getUserEventsAttending(this.user.uid);
    this.eventItems$ = this.eventItemsRef.snapshotChanges().map(action => {
      return action.map(c => ({
        key: c.payload.key, ...c.payload.val()
      }));
    });
    this.postItems$ = this.postItemRef.snapshotChanges().map(action => {
      return action.map(c => ({
        key: c.payload.key, ...c.payload.val(), iconName: "heart-outline"
      })).reverse();
    });
    await this.removeOldEvents();
  }

  editProfile() {
    const myModal = this.modal.create(EditProfilePage, { user: JSON.stringify(this.user) });
    myModal.present();
  }

  goToEvent(key: String) {
    let paramObj = {
      eventId: key
    }
    this.navCtrl.push(EventViewPage, paramObj);
  }

  presentPopover(popOverEvent) {
    let popover = this.popoverCtrl.create(PopOverComponent, {
      items: [{ name: "Edit Profile" }, { name: "Settings" }, { name: "Log Out" }]
    });
    popover.present({ ev: popOverEvent });
    popover.onWillDismiss(data => {
      if (data) {
        if (data.name === "Log Out") {
          this.logout();
        } else if (data.name === "Edit Profile") {
          this.editProfile();
        }
      }
    });
  }

  removeOldEvents() {
    new Promise((resolve, reject) => {
      this.eventItems$.subscribe(items => {
        for (let i of items) {
          var tempDate = moment(i.date);
          if (tempDate.diff(moment()) < -86400000) {
            this.eventItemsRef.remove(i.key);
          }
        }
        resolve(false);
      });
    });
  }

  logout() {
    this.afAuth.auth.signOut().then(() => {
      this.app.getRootNavs()[0].setRoot(LoginPage);
      this.storage.remove("user");
    }).catch(e => {
      console.log(e);
      console.log(e.message);
    });
  }
}
