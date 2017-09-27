import {Component} from '@angular/core';
import {NavController, App, NavParams} from 'ionic-angular';
import {FirebaseListObservable} from "angularfire2/database/firebase_list_observable";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import {User} from "../../models/user";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {FirebaseObjectObservable} from "angularfire2/database/firebase_object_observable";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { Event } from "../../models/event";
import { ToastController } from 'ionic-angular';

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
  attendingStatus: boolean = false;
  isCreator: boolean = false;
  eventId;
  userAttendingList: FirebaseListObservable<any[]>;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private app: App,
    private userService: UserServiceProvider,
    public navParams: NavParams,
    public toastCtrl: ToastController) {
    this.afAuth.authState.subscribe(data=> {
      this.eventId = navParams.get("eventId");
      if(data && data.email && data.uid) {
         const userGrab =  this.userService.currentUserInfo();
         userGrab.then((result) =>{
           this.user = result as User;           
           this.event = this.firebaseService.getEventInfo(this.eventId, this.user.organization_ID);
           this.attendingList = this.firebaseService.getEventAttendingList(this.eventId, this.user.organization_ID);
           this.userAttendingList = this.firebaseService.getUserEventList(this.user.uid);
          //  this.attendingList.subscribe(console.log);
           this.checkCreator();
           this.checkAttending();
          //  console.log(this.attendingList.$ref);
        });        
      } else {
        this.app.getRootNavs()[0].setRoot(LoginPage);
      }
    });
  }
  logout() {
    this.afAuth.auth.signOut();
  }
  checkCreator() {
    this.event.subscribe(res =>{
       if (res.creatorUid===this.user.uid) {
        this.isCreator = true;
      }
    });
  }
  checkAttending() {
    try {
    var isAttending = false;
    this.attendingList.subscribe(items => {
      const filtered = items.filter(item =>{
        if(item.$key === this.user.uid) {          
          console.log("Attending set to true");
          isAttending = true;
          return true;
        } 
        console.log(item.$key);
        return false;        
    })});
    console.log("Attending: " + isAttending);
    this.attendingStatus = isAttending;
    } catch (e) {
      this.errorToast();
    }
  }
  rsvpYes() {
    var eventName;
    this.event.subscribe(res => eventName = res.name);
    var updates = {};
    var nameObj = {
      name: this.user.name,
      avatar_url: this.user.avatar_url
    };
    var eventObj = {
      name: eventName
    }
    updates['/organization/'+this.user.organization_ID+'/event/'+this.eventId+'/attendingList/'+this.user.uid] =  nameObj;  
    updates['/users/'+this.user.uid+'/eventsAttending/'+this.eventId] = eventObj;
    firebase.database().ref().update(updates).then(function() {
    console.log("Event Added!");
    }).catch( function(error) {
      console.log(error);
    });
    this.attendingStatus = true; 
    this.yesToast();
  }
  rsvpNo() {
    this.noToast();
    this.attendingList.remove(this.user.uid);
    this.userAttendingList.remove(this.eventId);
    this.attendingStatus = false;
  }
  yesToast() {
    let toast = this.toastCtrl.create({
      message: 'You are going to this event!',
      duration: 3000
    });
    toast.present();
  }
  noToast() {
    let toast = this.toastCtrl.create({
      message: 'Removed you from the attending list.',
      duration: 3000
    });
    toast.present();
  }
  errorToast() {
    let toast = this.toastCtrl.create({
      message: 'ERROR',
      duration: 3000
    });
    toast.present();
  }
  checkToast() {
    let toast = this.toastCtrl.create({
      message: 'Checking attending',
      duration: 3000
    });
    toast.present();
  }
}
