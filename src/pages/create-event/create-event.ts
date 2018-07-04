import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { AngularFireAuth } from 'angularfire2/auth/auth';
import { EventsPage } from '../events/events';
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import * as moment from 'moment';
import { Event } from '../../models/event';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-create-event',
  templateUrl: 'create-event.html',
})
export class CreateEventPage {
  firebaseStorage = firebase.storage();
  user = {} as User;
  eventItems$: Observable<any>;
  attendingItems$: Observable<any[]>;
  event = {} as Event;
  constructor(private afAuth: AngularFireAuth,
              public navCtrl: NavController,
              public firebaseService: FirebaseServiceProvider,
              private userService: UserServiceProvider) {
  }

  ionViewDidLoad() {
    this.dataSetup();
  }

  async dataSetup() {
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
    this.eventItems$ = this.firebaseService
    .getOrgEventList(this.user.organizationId).valueChanges();
    this.attendingItems$ = this.firebaseService.getUserEventList(this.user.uid).valueChanges();
    this.event.date = moment().format();
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  createEvent() {
    this.event.creator = this.user.name;
    this.event.creatorUid = this.user.uid;
    const newEventKey = this.firebaseService
    .getOrgEventList(this.user.organizationId).push(this.event).key;
    console.log(newEventKey);
    const updates = {};
    const nameObj = {
      name: this.user.name,
      avatarUrl: this.user.avatarUrl,
    };

    updates[`/organization/${this.user.organizationId}/event/${
      newEventKey}/attendingList/${this.user.uid}`] = nameObj;
    updates[`/users/${this.user.uid}/eventsAttending/${newEventKey}`] = this.event;
    firebase.database().ref().update(updates).then(() => {
      console.log('Event Added!');
    }).catch((error) => {
      console.log(error);
    });
    this.navCtrl.setRoot(EventsPage);
  }
}
