import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController } from 'ionic-angular';
import { AngularFireList, AngularFireObject } from 'angularfire2/database';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/userService/userService';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { Event } from '../../models/event';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';
import { CreateEventPage } from '../createEvent/createEvent';
import * as moment from 'moment';

@Component({
  selector: 'page-eventView',
  templateUrl: 'eventView.html',
})
export class EventViewPage {
  firebase = firebase.database();
  user = {} as User;
  eventRef: AngularFireObject<any>;
  eventSubscription: Subscription;
  anEvent: Event;
  attendingList$: Observable<any[]>;
  eventInfo: string = 'details';
  attendingStatus: boolean = false;
  isCreator: boolean = false;
  eventId: string;
  userAttendingListRef: AngularFireList<any>;
  userAttendingList$: Observable<any>;
  eventName: string;
  eventAttendingItemsRef: AngularFireList<any>;
  attendingSubscription: Subscription;
  eventAttendingSubscription: Subscription;
  eventAttendingItems: Map<string, any> = new Map<string, any>();
  repeatLines = {
    Never: 'An event',
    Daily: 'A daily event',
    Weekly: 'A weekly event',
    Monthly: 'A monthly event',
    Yearly: 'A yearly event',
  };
  constructor(
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private userService: UserServiceProvider,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private modalController: ModalController,
  ) {}

  async dataSetup() {
    this.eventId = this.navParams.get('eventId');
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
    this.eventRef = this.firebaseService.getEventInfo(this.eventId, this.user.organizationId);
    this.eventAttendingItemsRef = this.firebaseService.getEventAttendingList(
      this.eventId,
      this.user.organizationId,
    );
    // this.checkCreator();
    this.userAttendingListRef = this.firebaseService.getUserEventList(this.user.uid);
    this.userAttendingList$ = this.userAttendingListRef.snapshotChanges().map(action => {
      return action.map(c => {
        return {
          key: c.payload.key,
          ...c.payload.val(),
        };
      });
    });
    this.buildSubscriptions();
  }

  async buildSubscriptions() {
    try {
      this.eventAttendingSubscription = this.eventAttendingItemsRef
        .stateChanges()
        .subscribe(async action => {
          if (action.type === 'value' || action.type === 'child_added') {
            const vals = action.payload.val();
            let avatar;
            if (vals.avatarUrl === '../../assets/icon/GMIcon.png') {
              avatar = `https://firebasestorage.googleapis.com/v0/b/greekme-7475a.appspot.com/o/GM_
              Default.png?alt=media&token=6bc30d40-17a2-40bb-9af7-edff78112780`;
            } else {
              const path = `${this.user.organizationId}/profilePhotos/${action.payload.key}`;
              avatar = await firebase
                .storage()
                .ref(path)
                .getDownloadURL();
            }
            const attendingUser = {
              name: action.payload.val().name,
              avatarUrl: avatar,
            };

            // Check if it is the User
            if (action.key === this.user.uid) {
              this.attendingStatus = true;
            }
            this.eventAttendingItems.set(action.key, attendingUser);
          } else if (action.type === 'child_removed') {
            this.eventAttendingItems.delete(action.key);
          }
        });

      this.eventSubscription = this.eventRef.snapshotChanges().subscribe(action => {
        if (action.type === 'value' || action.type === 'child_added') {
          this.anEvent = {
            key: action.payload.key,
            ...action.payload.val(),
          };
          if (this.anEvent.creatorUid === this.user.uid) {
            this.isCreator = true;
          }
        } else if (action.type === 'child_changed') {
          const tempEvent = action.payload.val();
          Object.keys(this.anEvent).forEach(aProperty => {
            // Updates event values only if changed
            if (this.anEvent[aProperty] !== tempEvent[aProperty]) {
              this.anEvent[aProperty] = tempEvent[aProperty];
            }
          });
        }
        this.anEvent.date = moment(this.anEvent.date).format('dddd, MMMM Do YYYY [at] h:mm a');
      });
    } catch (error) {
      console.log(error);
    }
  }

  rsvpYes() {
    if (!this.attendingStatus) {
      // Check to see if the person is able to rsvp yes
      const updates = {};
      const nameObj = {
        name: this.user.name,
        avatarUrl: this.user.avatarUrl,
      };
      let eventObj = {} as Event;
      this.firebase
        .ref(`/organization/${this.user.organizationId}/event/${this.eventId}`)
        .once('value')
        .then(snapshot => {
          eventObj = snapshot.val();
          const eventAttendingPath = `/organization/${this.user.organizationId}/event/${
            this.eventId
          }/attendingList/${this.user.uid}`;
          const userAttendingPath = `/users/${this.user.uid}/eventsAttending/${this.eventId}`;
          updates[eventAttendingPath] = nameObj;
          updates[`/users/${this.user.uid}/eventsAttending/${this.eventId}`] = eventObj;
          firebase
            .database()
            .ref()
            .update(updates)
            .then(() => {
              this.attendingStatus = true;
              this.toast('You are going to this event!');
            })
            .catch(error => {
              this.toast('Error RSVPing.');
            });
        });
    }
  }

  rsvpNo() {
    if (this.attendingStatus) {
      // Check to see if the person is able to rsvp no
      this.toast('Removed you from the attending list.');
      this.eventAttendingItemsRef.remove(this.user.uid);
      this.userAttendingListRef.remove(this.eventId);
      this.attendingStatus = false;
    }
  }

  editEvent() {
    const myModal = this.modalController.create(CreateEventPage, {
      event: JSON.stringify(this.anEvent),
      editMode: true,
    });
    myModal.present();
  }

  toast(text) {
    const toast = this.toastCtrl.create({
      message: text,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }

  ionViewWillLoad() {
    this.dataSetup();
  }

  destroySubscriptions() {
    this.eventAttendingSubscription.unsubscribe();
    this.eventSubscription.unsubscribe();
  }

  ionViewWillLeave() {
    this.destroySubscriptions();
  }
}
