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
  selector: 'page-compose-broadcast',
  templateUrl: 'compose-broadcast.html'
})
export class ComposeBroadcastPage {
  isBroadcast: boolean;
  firebaseStorage = firebase.storage();
  user = {} as User;
  tempBroadcast = {} as Broadcast;
  error = '';
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private app: App,
    private userService: UserServiceProvider,
    private navParams: NavParams) {

    this.afAuth.authState.subscribe(data => {
      if (!data || !data.email || !data.uid) {
        this.app.getRootNavs()[0].setRoot(LoginPage);
      } else {
        this.dataSetup();
      }
    });
  }

  async dataSetup() {
    this.isBroadcast = this.navParams.get("isBroadcast");
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
  }

  updatePostList(tempBroadcast: Broadcast) {
    let updates = {};
    updates['/users/' + this.user.uid + '/postList/' + tempBroadcast.key] = tempBroadcast;
    firebase.database().ref().update(updates).then(function () {
      console.log("Post added!");
    }).catch(function (error) {
      console.log(error);
    });
  }

  composeBroadcast(tempBroadcast: Broadcast) {
    if (tempBroadcast.text == null || tempBroadcast.text == '') {
      this.error = "Message cannot be blank!";
    } else {
      this.error = "";
      tempBroadcast.avatar_url = this.user.avatar_url;
      tempBroadcast.uid = this.user.uid;
      tempBroadcast.name = this.user.name;
      tempBroadcast.numOfComments = 0;
      tempBroadcast.numOfLikes = 0;
      tempBroadcast.date = moment().toISOString();

      if (this.isBroadcast) {
        // Need to still update user commentList, need to get the broadcast ID
        tempBroadcast.key = this.firebaseService.addToBroadcastList(tempBroadcast, this.user.organization_ID);
      } else {
        tempBroadcast.key = this.firebaseService.addToFeedList(tempBroadcast, this.user.organization_ID);
      }
      this.updatePostList(tempBroadcast);
      this.navCtrl.pop();
    }
  }
}
