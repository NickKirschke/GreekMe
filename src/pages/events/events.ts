import {Component} from '@angular/core';
import {NavController, App} from 'ionic-angular';
import {FirebaseListObservable} from "angularfire2/database/firebase_list_observable";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import {User} from "../../models/user";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { CreateEventPage } from '../create-event/create-event';
import { EventViewPage } from '../event-view/event-view';
import * as moment from 'moment';

@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})
export class EventsPage {
  firebaseStorage = firebase.storage();
  user = {} as User;
  eventItems: FirebaseListObservable<any>;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private app: App,
    private userService: UserServiceProvider) {
    this.afAuth.authState.subscribe(data=> {
      if(data && data.email && data.uid) {
         const userGrab =  this.userService.currentUserInfo();
         userGrab.then((result) =>{
           this.user = result as User;           
           this.eventItems = this.firebaseService.getOrgEventList(this.user.organization_ID);
           this.removeOldEvents();
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
  removeOldEvents() {
    // Removes events that are 1 day old.
    this.eventItems.subscribe(arr =>
      arr.forEach(element => {
        var tempDate = moment(element.date);
        if (tempDate.diff(moment()) < -86400000) {
          this.eventItems.remove(element.$key);
        }
      }));
    // var datee = moment('2017-08-29T20:59:51-04:00');
    // console.log(datee.diff(moment()));
  }
}
