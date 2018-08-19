import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFireList } from 'angularfire2/database';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { AngularFireAuth } from 'angularfire2/auth/auth';
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/userService/userService';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { CreateEventPage } from '../createEvent/createEvent';
import { EventViewPage } from '../eventView/eventView';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';
import  { Event } from '../../models/event';

@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})
export class EventsPage {
  firebaseStorage = firebase.storage();
  user = {} as User;
  eventItems$: Observable<any>;
  eventItemsRef: AngularFireList<any>;
  eventItemsSubscription: Subscription;
  eventItems: Map<string, Event> = new Map<string, Event>();
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
    this.eventItemsRef = this.firebaseService.getOrgEventList(this.user.organizationId);
    this.eventItems$ = this.eventItemsRef.snapshotChanges().map((action) => {
      return action.map(c => ({
        key: c.payload.key, ...c.payload.val(),
      }));
    });
    this.buildSubscription();
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  goToCreateEvent() {
    this.navCtrl.push(CreateEventPage);
  }
  goToEvent(key: string) {
    const data = {
      eventId: key,
    };
    this.navCtrl.push(EventViewPage, data);
  }

  buildSubscription() {
    let anEvent: Event;
    this.eventItemsSubscription = this.eventItemsRef.stateChanges()
    .subscribe((action) => {
      if (action.type === 'value' || action.type === 'child_added') {
        anEvent = {
          key: action.payload.key,
          ...action.payload.val(),
        };
        const eventDate = moment(anEvent.date);
        if (eventDate.diff(moment()) < -86400000) {
          this.eventItemsRef.remove(anEvent.key);
        } else {
          this.eventItems.set(anEvent.key, anEvent);
        }
      } else if (action.type === 'child_changed') {
        // Construct the replacement event
        anEvent = {
          key: action.payload.key,
          ...action.payload.val(),
        };
        const previousEvent = this.eventItems.get(anEvent.key);
        Object.keys(this.eventItems.get(anEvent.key)).forEach((aProperty) => {
          // If the value of the new broadcast is different, replace it on the previous one
          if (previousEvent[aProperty] !==  anEvent[aProperty]) {
            previousEvent[aProperty] = anEvent[aProperty];
          }
        });
      }
    });
  }

  destroySubscriptions() {
    this.eventItemsSubscription.unsubscribe();
  }

  ionViewWillUnload() {
    this.destroySubscriptions();
  }
}
