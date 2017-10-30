import { Component } from '@angular/core';
import { NavController, App, NavParams } from 'ionic-angular';
import {AngularFireList} from "angularfire2/database";
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
  selector: 'page-compose-thread',
  templateUrl: 'compose-thread.html',
})
export class ComposeThreadPage {
  firebaseStorage = firebase.storage();
  user = {} as User;
  tempBroadcast = {} as Broadcast;
  broadcastItems: Observable<any>;
  error ='';
  broadcastKey = "";
  constructor(
      private afAuth: AngularFireAuth,
      public navCtrl: NavController,
      public firebaseService: FirebaseServiceProvider,
      private app: App,
      private userService: UserServiceProvider,
      private storage: Storage,
      public navParams: NavParams) {
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
        this.broadcastKey = this.navParams.get("key");
      }
      composeThread(tempBroadcast: Broadcast) {
        if(tempBroadcast.text == null || tempBroadcast.text == '') {
          this.error = "Message cannot be blank!";
        } else {
          var currentNumOfComments = 0;
          var numOfCommentsRef = firebase.database().ref('/organization/'+this.user.organization_ID+'/broadcast/'+this.broadcastKey+'/numOfComments');
          numOfCommentsRef.on('value', function(snapshot) {
            currentNumOfComments = snapshot.val();
            console.log(currentNumOfComments);
          });
          this.error = "";
          tempBroadcast.avatar_url = this.user.avatar_url;
          tempBroadcast.uid = this.user.uid;
          tempBroadcast.name = this.user.name;
          tempBroadcast.date = moment().toISOString();
          this.firebaseService.addCommentToBroadcast(tempBroadcast,this.user.organization_ID, this.broadcastKey);
          var updates = {};
          updates['/organization/'+this.user.organization_ID+'/broadcast/'+this.broadcastKey+'/numOfComments/'] = currentNumOfComments + 1;
          firebase.database().ref().update(updates).then(function() {
            console.log("Comment Added!");
            }).catch( function(error) {
              console.log(error);
            });
          this.navCtrl.pop();
        }
        // this.firebaseService.addToBroadcastList
      }
}

