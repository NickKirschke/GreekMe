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

@Component({
  selector: 'page-event-view',
  templateUrl: 'event-view.html',
})
export class EventViewPage {
  firebaseStorage = firebase.storage();
  user = {} as User;
  event: FirebaseObjectObservable<Event>;
  attendingList: FirebaseListObservable<any[]>;
  eventInfo: string ='details';
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private app: App,
    private userService: UserServiceProvider,
    private storage: Storage,
    public navParams: NavParams) {
    this.afAuth.authState.subscribe(data=> {
      var eventId = navParams.get("eventId");
      if(data && data.email && data.uid) {
         const userGrab =  this.userService.currentUserInfo();
         userGrab.then((result) =>{
           this.user = result as User;           
           this.event = this.firebaseService.getEventInfo(eventId, this.user.organization_ID);
           this.attendingList = this.firebaseService.getEventAttendingList(eventId, this.user.organization_ID);
           this.attendingList.subscribe(console.log);
           console.log(this.attendingList.$ref);
        });        
      } else {
        this.app.getRootNavs()[0].setRoot(LoginPage);
      }
    });
    
  }
  logout() {
    this.afAuth.auth.signOut();
  }
  isCreator() {

  } 

}
