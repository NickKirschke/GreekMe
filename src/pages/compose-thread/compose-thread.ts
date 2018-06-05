import { Component } from '@angular/core';
import { NavController, App, NavParams } from 'ionic-angular';
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { AngularFireAuth } from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import { User } from "../../models/user";
import { Broadcast } from "../../models/broadcast";
import { UserServiceProvider } from "../../providers/user-service/user-service";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import * as moment from 'moment';

@Component({
  selector: 'page-compose-thread',
  templateUrl: 'compose-thread.html',
})
export class ComposeThreadPage {
  isBroadcast: boolean;
  firebaseStorage = firebase.storage();
  user = {} as User;
  tempBroadcast = {} as Broadcast;
  error = '';
  broadcastKey = "";
  typeOfRef = "";
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private app: App,
    private userService: UserServiceProvider,
    public navParams: NavParams) {
    this.afAuth.authState.subscribe(data => {
      if (!data || !data.email || !data.uid) {
        this.app.getRootNavs()[0].setRoot(LoginPage);
      } else {
        this.dataSetup();
      }
    });
  }

  async dataSetup() {
    this.broadcastKey = this.navParams.get("key");
    this.isBroadcast = this.navParams.get("isBroadcast");
    this.typeOfRef = this.isBroadcast ? "/broadcast/" : "/message/";
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
  }

  getNumOfComments() {
    return new Promise(resolve => {
      const numOfCommentsRef = firebase.database().ref('/organization/' + this.user.organization_ID + this.typeOfRef + this.broadcastKey + '/numOfComments/');
          numOfCommentsRef.on('value', function (snapshot) {
            resolve(snapshot.val());
          });
    });
  }

  async updateUserPostListAndCommentNumber(tempBroadcast: Broadcast) {
    let numOfComments;
    numOfComments = await this.getNumOfComments();
    let updates = {};
    updates['/users/' + this.user.uid + '/postList/' + tempBroadcast.key] = tempBroadcast;
    updates['/organization/' + this.user.organization_ID + this.typeOfRef + this.broadcastKey + '/numOfComments/'] = numOfComments + 1;
    firebase.database().ref().update(updates).then(function () {
      console.log("Post added and numOfComments updated!");
    }).catch(function (error) {
      console.log(error);
    });
  }

  composeThread(tempBroadcast: Broadcast) {
    if (tempBroadcast.text == null || tempBroadcast.text == '') {
      this.error = "Message cannot be blank!";
    } else {  
      this.error = "";
      tempBroadcast.avatar_url = this.user.avatar_url;
      tempBroadcast.uid = this.user.uid;
      tempBroadcast.name = this.user.name;
      tempBroadcast.date = moment().toISOString();
      tempBroadcast.numOfComments = 0;
      tempBroadcast.numOfLikes = 0;
      if (this.isBroadcast) { 
        tempBroadcast.key = this.firebaseService.addCommentToBroadcast(tempBroadcast, this.user.organization_ID, this.broadcastKey);
      } else { 
        tempBroadcast.key = this.firebaseService.addCommentToMessage(tempBroadcast, this.user.organization_ID, this.broadcastKey);
      }
      this.updateUserPostListAndCommentNumber(tempBroadcast);
      this.navCtrl.pop();
    }
  }
}

