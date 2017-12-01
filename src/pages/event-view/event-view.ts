import { Component } from '@angular/core';
import { NavController, App, NavParams } from 'ionic-angular';
import { AngularFireList } from "angularfire2/database";
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { AngularFireAuth } from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import { User } from "../../models/user";
import { UserServiceProvider } from "../../providers/user-service/user-service";
import { AngularFireObject } from "angularfire2/database";
import { Storage } from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { Event } from "../../models/event";
import { ToastController } from 'ionic-angular';
import { EventDetailsPage } from '../event-details/event-details';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-event-view',
  templateUrl: 'event-view.html',
})
export class EventViewPage {
  firebaseStorage = firebase.storage();
  user = {} as User;
  event: Observable<Event>;
  attendingList: Observable<any[]>;
  eventInfo: string = 'details';
  attendingStatus: boolean = false;
  isCreator: boolean = false;
  eventId;
  event2: Observable<Event>;
  userAttendingList: Observable<any>;
  eventName: String;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private app: App,
    private userService: UserServiceProvider,
    public navParams: NavParams,
    public toastCtrl: ToastController) {

    this.afAuth.authState.subscribe(data => {
      this.eventId = navParams.get("eventId");
      if (data && data.email && data.uid) {
        const userGrab = this.userService.currentUserInfo();
        userGrab.then((result) => {
          this.user = result as User;
          this.event = this.firebaseService.getEventInfo(this.eventId, this.user.organization_ID).valueChanges();
          this.attendingList = this.firebaseService.getEventAttendingList(this.eventId, this.user.organization_ID).snapshotChanges().map(action => {
            return action.map(c => ({
              key: c.payload.key, ...c.payload.val()
            }));
          });
          // this.checkCreator();
          this.checkAttending();
          this.userAttendingList = this.firebaseService.getUserEventList(this.user.uid).snapshotChanges().map(action => {
            return action.map(c => ({
              key: c.payload.key, ...c.payload.val()
            }));
          })

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

    //5.0
    // console.log("checking creator");
    // try {
    //   this.event.subscribe(item => {
    //     if (item.creatorUid === this.user.uid) {
    //       this.isCreator = true;
    //     }

    //   });
    //   this.event.subscribe(console.log);
    // } catch (e) {
    //   console.log("Error checking creator");
    // }
    var id = this.event.subscribe(console.log);
    // console.log(id);
    // if(id.take === this.user.uid) {
    //   this.isCreator = true;
    // }
  }

  checkAttending() {
    try {
      var isAttending = false;
      var listOfNames;
      this.attendingList.subscribe(items => {
        for (let i of items) {
          if (i.key === this.user.uid) {
            console.log("Attending set to true");
            this.attendingStatus = true;
          }
        }
      });
    } catch (e) {
      this.toast("Error when checking attendance");
    }

    //5.0
    // try {
    //   var isAttending = false;
    //   var theList;
    //   this.attendingList.subscribe(items => {
    //     theList = items;
    //     console.log(theList);
    //     //items.subscribe(item => console.log(item));
    //     const filtered = items.next(item =>{
    //       console.log(item);

    //       console.log(item.key);
    //       return false;        
    //     })
    //   });
    //   this.attendingStatus = isAttending;
    //   } catch (e) {
    //     this.toast("Error when checking attendance");
    //   }
  }

  rsvpYes() {
    if (!this.attendingStatus) {
      // this.firebaseService.getEventInfo2(this.eventId, this.user.organization_ID).snapshotChanges().subscribe(action => {
      //   this.eventName = action.payload.val().name;
      // });
    
      this.event.subscribe(e => { this.eventName = e.name, console.log(e)});
      console.log(this.eventName);
      // var updates = {};
      // var nameObj = {
      //   name: this.user.name,
      //   avatar_url: this.user.avatar_url
      // };
      // var eventObj = {
      //   name: eventName
      // }
      // updates['/organization/' + this.user.organization_ID + '/event/' + this.eventId + '/attendingList/' + this.user.uid] = nameObj;
      // updates['/users/' + this.user.uid + '/eventsAttending/' + this.eventId] = eventObj;
      // firebase.database().ref().update(updates).then(function () {
      // }).catch(function (error) {
      //   console.log(error);
      // });
      // this.attendingStatus = true;
      // this.toast("You are going to this event!");
    }
  }

  rsvpNo() {
    console.log(this.eventName);
    // this.toast("Remove you from the attending list.");
    // this.attendingList.remove(this.user.uid);
    // this.userAttendingList.remove(this.eventId);
    // this.attendingStatus = false;
  }

  toast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 2000,
      position: 'middle'
    });
    toast.present();
  }

  editEvent() {
    this.navCtrl.push(EventDetailsPage);
  }
}