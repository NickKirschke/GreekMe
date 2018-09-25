import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { AngularFireAuth } from 'angularfire2/auth/auth';
import { EventsPage } from '../events/events';
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/userService/userService';
import * as moment from 'moment';
import { Event, Repeat } from '../../models/event';
import { Observable } from 'rxjs/Observable';
import { AngularFireList } from '../../../node_modules/angularfire2/database';
import app from 'firebase/app';

@Component({
  selector: 'page-createEvent',
  templateUrl: 'createEvent.html',
})
export class CreateEventPage {
  user = {} as User;
  attendingItems$: Observable<any[]>;
  event = {} as Event;
  editMode: boolean = false;
  eventItemsRef: AngularFireList<any>;
  repeatOptions = [
    Repeat.Never,
    Repeat.Daily,
    Repeat.Weekly,
    Repeat.Monthly,
    Repeat.Yearly,
  ];
  constructor(private afAuth: AngularFireAuth,
              public navCtrl: NavController,
              public firebaseService: FirebaseServiceProvider,
              private userService: UserServiceProvider,
              public navParams: NavParams,
              private view: ViewController) {
  }

  ionViewDidLoad() {
    this.dataSetup();
  }

  async dataSetup() {
    this.event.repeat = Repeat.Never;
    this.event.date = moment().format();
    const userGrab = await this.userService.currentUserInfo();
    if (this.navParams.get('editMode')) {
      this.editMode = true;
      this.event = JSON.parse(this.navParams.get('event'));
      console.log('editmode');
    }
    this.user = userGrab as User;
    this.eventItemsRef = this.firebaseService.getOrgEventList(this.user.organizationId);
    this.attendingItems$ = this.firebaseService.getUserEventList(this.user.uid).valueChanges();
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  createEvent() {
    this.event.creator = this.user.name;
    this.event.creatorUid = this.user.uid;
    const newEventKey = this.eventItemsRef.push(this.event).key;
    const updates = {};
    const nameObj = {
      name: this.user.name,
      avatarUrl: this.user.avatarUrl,
    };
    updates[`/organization/${this.user.organizationId}/event/${
      newEventKey}/attendingList/${this.user.uid}`] = nameObj;
    updates[`/users/${this.user.uid}/eventsAttending/${newEventKey}`] = this.event;
    app.database().ref().update(updates).then(() => {
      console.log('Event Added!');
    }).catch((error) => {
      console.log(error);
    });
    this.navCtrl.setRoot(EventsPage);
  }

  // Edit Event view methods
  closeModal() {
    this.view.dismiss();
  }

  async updateEvent() {
    try {
      this.eventItemsRef.update(this.event.key, this.event);
      this.view.dismiss();
    } catch (error) {
      console.log('ERROR', error);
    }
  }
}
