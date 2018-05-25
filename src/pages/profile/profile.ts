import { Component } from '@angular/core';
import { Storage } from "@ionic/storage";
import { NavController, App, PopoverController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth/auth";
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { LoginPage } from "../login/login";
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { Observable } from 'rxjs/Observable';
import { AngularFireList } from 'angularfire2/database';
import { Broadcast } from '../../models/broadcast';
import { Event } from '../../models/event';
import { ThreadPage } from '../thread/thread';
import { EventViewPage } from '../event-view/event-view';
import { PopOverComponent } from '../../components/pop-over/pop-over';
import { populateNodeData } from 'ionic-angular/components/virtual-scroll/virtual-util';
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
  postItems: Observable<Broadcast[]>;
  postItemRef: AngularFireList<any>;
  eventItems: Observable<any>;
  eventItemsRef: AngularFireList<any>;
  profileContent: string = 'posts';
  constructor(private afAuth: AngularFireAuth, public navCtrl: NavController, public firebaseService: FirebaseServiceProvider, private userService: UserServiceProvider, private app: App,
    public popoverCtrl: PopoverController, public navParams: NavParams, private storage: Storage) {
    // this.afAuth.authState.subscribe(data => {
    //   if (!data) {
    //     this.app.getRootNavs()[0].setRoot(LoginPage);
    //   } else {
    this.dataSetup();
    //   }
    // });
  }

  async dataSetup() {
    let count = 0;
    let profileUser = this.navParams.get("uid");
    if (profileUser == null) {
      this.isUser = true;
      const userGrab = await this.userService.currentUserInfo();
      this.user = userGrab as User;
    } else {
      this.isUser = false;
      const guestProfileUserGrab = await this.firebaseService.getUserDetailsProfilePage(profileUser);
      this.user = guestProfileUserGrab as User;
    }
    this.postItemRef = this.firebaseService.getUserPostList(this.user.uid);
    this.eventItemsRef = this.firebaseService.getUserEventsAttending(this.user.uid);
    this.eventItems = this.eventItemsRef.snapshotChanges().map(action => {
      return action.map(c => ({
        key: c.payload.key, ...c.payload.val()
      }));
    });

    this.postItems = this.postItemRef.snapshotChanges().map(action => {
      return action.map(c => ({
        key: c.payload.key, ...c.payload.val(), iconName: "heart-outline"
      })).reverse();
    });
    await this.removeOldEvents();
    // this.checkIsUser();
  }

  checkIsUser() {

  }


  // Currently unable to navigate to user posts due to the isBroadcast issue
  // itemSelected(item) {
  //   let bc = JSON.stringify(item);
  //   this.navCtrl.push(ThreadPage, {
  //     orgId: this.user.organization_ID,
  //     broadcast: bc,
  //     isBroadcast: true
  //   });
  // }

  editProfile() {
    this.navCtrl.push(EditProfilePage,
      { user: JSON.stringify(this.user) });
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
      if (data !== null && data.name === "Log Out") {
        this.logout();
      } else if (data !== null && data.name === "Edit Profile") {
        this.editProfile();
      }
    });
  }

  removeOldEvents() {
    const promise = new Promise((resolve, reject) => {
      this.eventItems.subscribe(items => {
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
