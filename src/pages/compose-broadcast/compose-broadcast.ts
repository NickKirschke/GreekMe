import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import {AngularFireList } from "angularfire2/database";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import { GreekMePage } from '../greekme/greekme';
import {User} from "../../models/user";
import { Broadcast } from "../../models/broadcast";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {AngularFireObject} from "angularfire2/database";
import {async} from "rxjs/scheduler/async";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-compose-broadcast',
  templateUrl: 'compose-broadcast.html'
})
export class ComposeBroadcastPage {
  firebaseStorage = firebase.storage();
  userData: AngularFireObject<User>
  user = {} as User;
  tempBroadcast = {} as Broadcast;
  broadcastItems: Observable<any>;
  error ='';
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
           this.broadcastItems = this.firebaseService.getBroadcastList(this.user.organization_ID).snapshotChanges();
         });
        } else {
          this.app.getRootNavs()[0].setRoot(LoginPage);
        }
      });
    }
    composeBroadcast(tempBroadcast: Broadcast) {
      if(tempBroadcast.text == null || tempBroadcast.text == '') {
        this.error = "Message cannot be blank!";
      } else {
        this.error = "";
        tempBroadcast.avatar_url = this.user.avatar_url;
        tempBroadcast.uid = this.user.uid;
        tempBroadcast.name = this.user.name;
        tempBroadcast.numOfComments = 0;
        tempBroadcast.numOfLikes = 0;
        tempBroadcast.date = moment().toISOString();
        this.firebaseService.addToBroadcastList(tempBroadcast,this.user.organization_ID);
        this.navCtrl.setRoot(GreekMePage);
      }
      // this.firebaseService.addToBroadcastList
    }
}
