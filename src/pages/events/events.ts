import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { AngularFireList } from 'angularfire2/database';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/userService/userService';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { CreateEventPage } from '../createEvent/createEvent';
import { EventViewPage } from '../eventView/eventView';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';
import { Event, Repeat } from '../../models/event';
import { NotificationsPage } from '../notifications/notifications';

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
  notificationsIcon = 'notifications-outline';
  notificationsSubscription: Subscription;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private userService: UserServiceProvider,
    private modalController: ModalController,
  ) {}

  ionViewWillLoad() {
    this.dataSetup();
  }

  async dataSetup() {
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
    this.eventItemsRef = this.firebaseService.getOrgEventList(this.user.organizationId);
    this.eventItems$ = this.eventItemsRef.snapshotChanges().map(action => {
      // tslint:disable-next-line:ter-arrow-parens
      return action.map(c => ({
        key: c.payload.key,
        ...c.payload.val(),
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

  goToNotifications() {
    const myModal = this.modalController.create(NotificationsPage);
    myModal.present();
  }

  buildSubscription() {
    let anEvent: Event;
    this.eventItemsSubscription = this.eventItemsRef.stateChanges().subscribe(action => {
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
              this.updateEventItems(anEvent, 1, 'd');
              break;
            case Repeat.Weekly:
              this.updateEventItems(anEvent, 7, 'd');
              break;
            case Repeat.Biweekly:
              this.updateEventItems(anEvent, 14, 'd');
              break;
            case Repeat.Monthly:
              this.updateEventItems(anEvent, 1, 'M');
              break;
            case Repeat.Yearly:
              this.updateEventItems(anEvent, 1, 'y');
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
        Object.keys(this.eventItems.get(anEvent.key)).forEach(aProperty => {
          // If the value of the new broadcast is different, replace it on the previous one
          if (previousEvent[aProperty] !== anEvent[aProperty]) {
            if (aProperty === 'date') {
              previousEvent[aProperty] = moment(anEvent[aProperty]).format(
                'dddd, MMMM Do YYYY [at] h:mm a',
              );
            } else {
              previousEvent[aProperty] = anEvent[aProperty];
            }
          }
        });
      } else if (action.type === 'child_removed') {
        this.eventItems.delete(action.payload.key);
      }
    });
    this.notificationsSubscription = this.userService.notificationSizeSubject.subscribe({
      next: size => {
        if (size > 0) {
          this.notificationsIcon = 'notifications';
        } else {
          this.notificationsIcon = 'notifications-outline';
        }
        console.log(size);
      },
    });
  }
  updateEventItems(anEvent: Event, timeAddition: any, timeType: string) {
    anEvent.date = moment(anEvent.date).add(timeAddition, timeType);
    this.eventItems.set(anEvent.key, anEvent);
    this.eventItemsRef.update(anEvent.key, anEvent);
  }

  destroySubscriptions() {
    this.eventItemsSubscription.unsubscribe();
    this.notificationsSubscription.unsubscribe();
  }

  ionViewWillUnload() {
    this.destroySubscriptions();
  }
}
