import { Component } from '@angular/core';
import { NavController, App, PopoverController } from 'ionic-angular';
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
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  App: App;
  user = {} as User;
  postItems: Observable<Broadcast[]>;
  postItemRef: AngularFireList<any>;
  eventItems: Observable<Event[]>;
  eventItemsRef: AngularFireList<any>;
  profileContent: string = 'posts';
  constructor(private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private userService: UserServiceProvider,
    private app: App,
    public popoverCtrl: PopoverController) {
    this.afAuth.authState.subscribe(data => {
      if (!data || !data.email || !data.uid) {
        this.app.getRootNavs()[0].setRoot(LoginPage);
      } else {
        this.dataSetup();
      }
    });
    this.App = app;
  }


  async dataSetup() {
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
    this.postItemRef = await this.firebaseService.getUserPostList(this.user.uid);
    this.eventItemsRef = await this.firebaseService.getUserEventsAttending(this.user.uid);
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

  goToEvent(key: String) {
    let paramObj = {
      eventId: key
    }
    this.navCtrl.push(EventViewPage, paramObj);
  }

  presentPopover(popOverEvent) {
    let popover = this.popoverCtrl.create(PopOverComponent, {
      items: [{name: "Edit Profile"},{name: "Logout"}]
    });
    popover.present( { ev: popOverEvent});
    popover.onWillDismiss(data => {
      if(data !== null && data.name === "Logout") {
        this.logout();
      }
    });
  }

  logout() {
    this.afAuth.auth.signOut();
    this.App.getRootNav().setRoot(LoginPage);
  }

}
