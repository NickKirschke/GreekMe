import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
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
import  { Event, Repeat } from '../../models/event';

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
              private userService: UserServiceProvider,
              private modalController: ModalController) {
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
    const myModal = this.modalController.create(CreateEventPage);
    myModal.present();
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
        // Checks to see if the event is a day old, if so remove or update it.
        if (eventDate.diff(moment()) < -86400000) {
          switch (anEvent.repeat) {
            case Repeat.Never:
              this.eventItemsRef.remove(anEvent.key);
              break;
            case Repeat.Daily:
              anEvent.date = moment(anEvent.date).add(1, 'd');
              this.eventItems.set(anEvent.key, anEvent);
              this.eventItemsRef.update(anEvent.key, anEvent);
              break;
            case Repeat.Weekly:
              anEvent.date = moment(anEvent.date).add(7, 'd');
              this.eventItems.set(anEvent.key, anEvent);
              this.eventItemsRef.update(anEvent.key, anEvent);
              break;
            case Repeat.Biweekly:
              anEvent.date = moment(anEvent.date).add(14, 'd');
              this.eventItems.set(anEvent.key, anEvent);
              this.eventItemsRef.update(anEvent.key, anEvent);
              break;
            case Repeat.Monthly:
              anEvent.date = moment(anEvent.date).add(1, 'M');
              this.eventItems.set(anEvent.key, anEvent);
              this.eventItemsRef.update(anEvent.key, anEvent);
              break;
            case Repeat.Yearly:
              anEvent.date = moment(anEvent.date).add(1, 'y');
              this.eventItems.set(anEvent.key, anEvent);
              this.eventItemsRef.update(anEvent.key, anEvent);
              break;
          }
          anEvent.date = moment(anEvent.date).format('dddd, MMMM Do YYYY [at] h:mm a');
        } else {
          anEvent.date = moment(anEvent.date).format('dddd, MMMM Do YYYY [at] h:mm a');
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
            if (aProperty === 'date') {
              previousEvent[aProperty] = moment(anEvent[aProperty])
                .format('dddd, MMMM Do YYYY [at] h:mm a');
            } else {
              previousEvent[aProperty] = anEvent[aProperty];
            }
          }
        });
      } else if (action.type === 'child_removed') {
        this.eventItems.delete(action.payload.key);
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
