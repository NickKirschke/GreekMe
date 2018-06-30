import { Component } from '@angular/core';
import { App, NavParams, ViewController } from 'ionic-angular';
import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { AngularFireAuth } from 'angularfire2/auth/auth';
import { User } from '../../models/user';
import { Broadcast } from '../../models/broadcast';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import * as moment from 'moment';

@Component({
  selector: 'page-compose-broadcast',
  templateUrl: 'compose-broadcast.html',
})
export class ComposeBroadcastPage {
  isBroadcast: boolean;
  firebaseStorage = firebase.storage();
  user = {} as User;
  tempBroadcast = {} as Broadcast;
  error = '';
  constructor(
    public firebaseService: FirebaseServiceProvider,
    private userService: UserServiceProvider,
    private navParams: NavParams,
    private view: ViewController) {
  }

  ionViewDidLoad() {
    this.dataSetup();
  }

  async dataSetup() {
    this.isBroadcast = this.navParams.get('isBroadcast');
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
  }

  updatePostList(tempBroadcast: Broadcast) {
    const updates = {};
    updates['/users/' + this.user.uid + '/postList/' + tempBroadcast.key] = tempBroadcast;
    firebase.database().ref().update(updates).then(() => {
      console.log('Post added!');
    }).catch((error) => {
      console.log(error);
    });
  }

  composeBroadcast(tempBroadcast: Broadcast) {
    if (tempBroadcast.text == null || tempBroadcast.text === '') {
      this.error = 'Message cannot be blank!';
    } else {
      this.error = '';
      tempBroadcast.avatarUrl = this.user.avatarUrl;
      tempBroadcast.uid = this.user.uid;
      tempBroadcast.name = this.user.name;
      tempBroadcast.numOfComments = 0;
      tempBroadcast.numOfLikes = 0;
      tempBroadcast.date = moment().toISOString();

      if (this.isBroadcast) {
        // Need to still update user commentList, need to get the broadcast ID
        tempBroadcast.key = this.firebaseService
        .addToBroadcastList(tempBroadcast, this.user.organizationId);
      } else {
        tempBroadcast.key = this.firebaseService
        .addToFeedList(tempBroadcast, this.user.organizationId);
      }
      this.updatePostList(tempBroadcast);
      this.view.dismiss();
    }
  }

  closeModal() {
    this.view.dismiss();
  }
}
