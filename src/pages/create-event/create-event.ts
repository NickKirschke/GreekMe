import {Component} from '@angular/core';
import {NavController, App} from 'ionic-angular';
import {AngularFireList} from "angularfire2/database";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import { EventsPage } from "../events/events";
import {User} from "../../models/user";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import * as moment from 'moment';
import { Event } from "../../models/event";
import { Observable } from 'rxjs/Observable';



@Component({
  selector: 'page-create-event',
  templateUrl: 'create-event.html'
})
export class CreateEventPage {
  firebaseStorage = firebase.storage();
  user = {} as User;
  eventItems$: Observable<any>;
  attendingItems$: Observable<any[]>;
  event = {} as Event;
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
           this.eventItems$ = this.firebaseService.getOrgEventList(this.user.organization_ID).valueChanges();
           this.attendingItems$ = this.firebaseService.getUserEventList(this.user.uid).valueChanges();  
          //  this.event.attendingList = this.firebaseService.getEventAttendingList(this.)         
        });        
      } else {
        this.app.getRootNavs()[0].setRoot(LoginPage);
      }
    });
    this.event.date = moment().format();
  }
  logout() {
    this.afAuth.auth.signOut();
  }
  createEvent() {
    this.event.creator = this.user.name;
    this.event.creatorUid = this.user.uid;
    var newEventKey = this.firebaseService.getOrgEventList(this.user.organization_ID).push(this.event).key;
    // this.eventItems.push(this.event);
    console.log(newEventKey);
    var updates = {};
     var nameObj = {
       name: this.user.name,
       avatar_url: this.user.avatar_url
     };
     
    updates['/organization/'+this.user.organization_ID+'/event/'+newEventKey+'/attendingList/'+this.user.uid] =  nameObj;
    updates['/users/'+this.user.uid+'/eventsAttending/'+newEventKey] = this.event;
    firebase.database().ref().update(updates).then(function() {
      console.log("Event Added!");
    }).catch( function(error) {
      console.log(error);
    });
    this.navCtrl.setRoot(EventsPage);
  }
}
