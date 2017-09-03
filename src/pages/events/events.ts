import {Component, ViewChild, ElementRef} from '@angular/core';
import {NavController, App, NavParams} from 'ionic-angular';
import {FirebaseListObservable} from "angularfire2/database/firebase_list_observable";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import {User} from "../../models/user";
import {Broadcast} from "../../models/broadcast";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {FirebaseObjectObservable} from "angularfire2/database/firebase_object_observable";
import {async} from "rxjs/scheduler/async";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { CreateEventPage } from '../create-event/create-event';
import { Event } from "../../models/event";
import { EventViewPage } from '../event-view/event-view';

@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})
export class EventsPage {
  firebaseStorage = firebase.storage();
  user = {} as User;
  eventItems: FirebaseListObservable<Event>;
  attendingItems: FirebaseListObservable<Event>;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private app: App,
    private userService: UserServiceProvider,
    private storage: Storage) {
    this.afAuth.authState.subscribe(data=> {
      if(data && data.email && data.uid) {
         const userGrab =  this.userService.currentUserInfo();
         userGrab.then((result) =>{
           this.user = result as User;           
           this.eventItems = this.firebaseService.getOrgEventList(this.user.organization_ID);
           this.attendingItems = this.firebaseService.getUserEventList(this.user.uid);           
        });        
      } else {
        this.app.getRootNavs()[0].setRoot(LoginPage);
      }
    });
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
    this.navCtrl.push(EventViewPage,paramObj);
  }
}
