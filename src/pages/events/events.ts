import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { AngularFireList } from "angularfire2/database";
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { AngularFireAuth } from "angularfire2/auth/auth";
import { User } from "../../models/user";
import { UserServiceProvider } from "../../providers/user-service/user-service";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { CreateEventPage } from '../create-event/create-event';
import { EventViewPage } from '../event-view/event-view';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})
export class EventsPage {
  firebaseStorage = firebase.storage();
  user = {} as User;
  eventItems$: Observable<any>;
  eventItemsRef: AngularFireList<any>;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private userService: UserServiceProvider) {
  }

  ionViewWillLoad() {
    this.dataSetup();
  }

  async dataSetup() {
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
    this.eventItemsRef = this.firebaseService.getOrgEventList(this.user.organization_ID);
    this.eventItems$ = this.eventItemsRef.snapshotChanges().map(action => {
      return action.map(c => ({
        key: c.payload.key, ...c.payload.val()
      }));
    });
    this.removeOldEvents();
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  goToCreateEvent() {
    this.navCtrl.push(CreateEventPage);
  }
  goToEvent(key: String) {
    let paramObj = {
      eventId: key
    }
    this.navCtrl.push(EventViewPage, paramObj);
  }
  removeOldEvents() {
    // Removes events that are 1 day old.
    // this.eventItems.subscribe(arr =>
    //   arr.forEach(element => {
    //     var tempDate = moment(element.date);
    //     if (tempDate.diff(moment()) < -86400000) {
    //       this.eventItems.remove(element.$key);
    //     }
    //   }));

    //5.0
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
  // const $key = action.payload.key;
  // const data = { $key, ...action.payload.val() };
  // return data;
  // var datee = moment('2017-08-29T20:59:51-04:00');
  // console.log(datee.diff(moment()));
}
