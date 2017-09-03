import {Component, ViewChild, ElementRef} from '@angular/core';
import {NavController, App, NavParams} from 'ionic-angular';
import {FirebaseListObservable} from "angularfire2/database/firebase_list_observable";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import { EventsPage } from "../events/events";
import {User} from "../../models/user";
import {Broadcast} from "../../models/broadcast";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {FirebaseObjectObservable} from "angularfire2/database/firebase_object_observable";
import {async} from "rxjs/scheduler/async";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import * as moment from 'moment';
import { Event } from "../../models/event";




@Component({
  selector: 'page-create-event',
  templateUrl: 'create-event.html'
})
export class CreateEventPage {
  firebaseStorage = firebase.storage();
  user = {} as User;
  eventItems: FirebaseListObservable<Event>;
  attendingItems: FirebaseListObservable<Event>;
  event = {} as Event;
  
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
          //  this.event.attendingList = this.firebaseService.getEventAttendingList(this.)         
        });        
      } else {
        this.app.getRootNavs()[0].setRoot(LoginPage);
      }
    });
    this.event.date = moment().format();
    console.log(this.event.date);
  }
  logout() {
    this.afAuth.auth.signOut();
  }
  createEvent() {
    this.event.creator = this.user.name;
    this.event.creatorUid = this.user.uid;
    var newEventKey = this.eventItems.push(this.event).key;
    // this.eventItems.push(this.event);
    console.log(newEventKey);
    var updates = {};
     var nameObj = {
       name: this.user.name
     };
     var eventObj = {
       name: this.event.name
     }
    updates['/organization/'+this.user.organization_ID+'/event/'+newEventKey+'/attendingList/'+this.user.uid] =  nameObj;
    updates['/users/'+this.user.uid+'/eventsAttending/'+newEventKey] = eventObj;
    firebase.database().ref().update(updates).then(function() {
      console.log("Event Added!");
    }).catch( function(error) {
      console.log(error);
    });
    this.navCtrl.setRoot(EventsPage);
  }
}
