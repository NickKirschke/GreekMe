import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { AngularFireList } from 'angularfire2/database';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { AngularFireAuth } from 'angularfire2/auth/auth';
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/userService/userService';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { Event } from '../../models/event';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-eventView',
  templateUrl: 'eventView.html',
})
export class EventViewPage {
  userAttendingListRef: AngularFireList<any>;
  firebaseStorage = firebase.storage();
  firebase = firebase.database();
  user = {} as User;
  event$: Observable<Event>;
  anEvent: any;
  attendingList$: Observable<any[]>;
  eventInfo: string = 'details';
  attendingStatus: boolean = false;
  isCreator: boolean = false;
  eventId: string;
  event2$: Observable<Event>;
  userAttendingList$: Observable<any>;
  eventName: string;
  eventAttendingItemsRef: AngularFireList<any>;
  attendingSubscription: Subscription;
  eventAttendingSubscription: Subscription;
  eventAttendingItems: Map<string, any> = new Map<string, any>();

  constructor(private afAuth: AngularFireAuth,
              public navCtrl: NavController,
              public firebaseService: FirebaseServiceProvider,
              private userService: UserServiceProvider,
              public navParams: NavParams,
              public toastCtrl: ToastController) {
  }

  async dataSetup() {
    // An eventReference and manually update the subscription
    // Make an attending component and have it handle the user avatars
    this.eventId = this.navParams.get('eventId');
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
    this.event$ = this.firebaseService
      .getEventInfo(this.eventId, this.user.organizationId).valueChanges();
    this.anEvent = this.event$.map(i => ({ ...i }));
    console.log(this.anEvent);
    this.eventAttendingItemsRef = this.firebaseService
      .getEventAttendingList(this.eventId, this.user.organizationId);
    // this.checkCreator();
    this.userAttendingListRef = this.firebaseService.getUserEventList(this.user.uid);
    this.userAttendingList$ = this.userAttendingListRef.snapshotChanges().map((action) => {
      return action.map(c => ({
        key: c.payload.key, ...c.payload.val(),
      }));
    });
    this.buildSubscriptions();
  }

  async buildSubscriptions() {
    try {
      this.eventAttendingSubscription = this.eventAttendingItemsRef.stateChanges()
        .subscribe(async (action) => {
          if (action.type === 'value' || action.type === 'child_added') {
            const vals = action.payload.val();
            let avatar;
            if (vals.avatarUrl === '../../assets/icon/GMIcon.png') {
              avatar = vals.avatarUrl;
            } else {
              const path = `${this.user.organizationId}/profilePhotos/${action.payload.key}`;
              avatar = await firebase.storage().ref(path).getDownloadURL();
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
    } catch (error) {
      console.log(error);
    }
  }

  checkCreator() {
    // this.event.subscribe(res =>{
    //    if (res.creatorUid===this.user.uid) {
    //     this.isCreator = true;
    //   }
    // });
    // let e = this.event.map(e => e);
    // e.subscribe(res =>{
    //      if (res.creatorUid===this.user.uid) {
    //       this.isCreator = true;
    //     }
    //   });

    // 5.0
    // console.log('checking creator');
    // try {
    //   this.event.subscribe(item => {
    //     if (item.creatorUid === this.user.uid) {
    //       this.isCreator = true;
    //     }

    //   });
    //   this.event.subscribe(console.log);
    // } catch (e) {
    //   console.log('Error checking creator');
    // }
    // var id = this.event$.subscribe(console.log);
    // console.log(id);
    // if(id.take === this.user.uid) {
    //   this.isCreator = true;
    // }
  }

  rsvpYes() {
    if (!this.attendingStatus) { // Check to see if the person is able to rsvp yes
      const updates = {};
      const nameObj = {
        name: this.user.name,
        avatarUrl: this.user.avatarUrl,
      };
      let eventObj = {} as Event;
      this.firebase.ref(`/organization/${this.user.organizationId}/event/${
        this.eventId}`).once('value')
        .then((snapshot) => {
          eventObj = snapshot.val();
          updates[`/organization/${this.user.organizationId}/event/${
            this.eventId}/attendingList/${this.user.uid}`] = nameObj;
          updates[`/users/${this.user.uid}/eventsAttending/${this.eventId}`] = eventObj;
          firebase.database().ref().update(updates).then(() => {
            this.attendingStatus = true;
            this.toast('You are going to this event!');
          }).catch(function (error) {
            this.toast('Error RSVPing.');
          });
        });
    }
  }

  rsvpNo() {
    if (this.attendingStatus) { // Check to see if the person is able to rsvp no
      this.toast('Removed you from the attending list.');
      this.eventAttendingItemsRef.remove(this.user.uid);
      this.userAttendingListRef.remove(this.eventId);
      this.attendingStatus = false;
    }
  }

  toast(text) {
    const toast = this.toastCtrl.create({
      message: text,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }

  ionViewDidLoad() {
    this.dataSetup();
  }

  destroySubscriptions() {
    this.eventAttendingSubscription.unsubscribe();
  }

  ionViewWillLeave() {
    this.destroySubscriptions();
  }
}
