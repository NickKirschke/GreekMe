import { Component } from '@angular/core';
import { App, NavParams, ViewController } from 'ionic-angular';
import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { User } from '../../models/user';
import { Broadcast } from '../../models/broadcast';
import { UserServiceProvider } from '../../providers/user-service/user-service';
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
  broadcastKey = '';
  typeOfRef = '';
  constructor(
    private firebaseService: FirebaseServiceProvider,
    private userService: UserServiceProvider,
    private navParams: NavParams,
    private view: ViewController) {
  }

  ionViewDidLoad() {
    this.dataSetup();
  }

  async dataSetup() {
    this.broadcastKey = this.navParams.get('key');
    this.isBroadcast = this.navParams.get('isBroadcast');
    this.typeOfRef = this.isBroadcast ? '/broadcast/' : '/message/';
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
  }

  getNumOfComments() {
    return new Promise((resolve) => {
      const numOfCommentsRef = firebase.database().ref('/organization/' +
        this.user.organizationId + this.typeOfRef + this.broadcastKey + '/numOfComments/');
      numOfCommentsRef.on('value', (snapshot) => {
        resolve(snapshot.val());
      });
    });
  }

  async updateUserPostListAndCommentNumber(tempBroadcast: Broadcast) {
    let numOfComments;
    numOfComments = await this.getNumOfComments();
    const updates = {};
    updates['/users/' + this.user.uid + '/postList/' + tempBroadcast.key] = tempBroadcast;
    updates['/organization/' + this.user.organizationId + this.typeOfRef
      + this.broadcastKey + '/numOfComments/'] = numOfComments + 1;
    firebase.database().ref().update(updates).then(() => {
    }).catch((error) => {
      console.log(error);
    });
  }

  composeThread(tempBroadcast: Broadcast) {
    if (tempBroadcast.text == null || tempBroadcast.text === '') {
      this.error = 'Message cannot be blank!';
    } else {
      this.error = '';
      tempBroadcast.avatarUrl = this.user.avatarUrl;
      tempBroadcast.uid = this.user.uid;
      tempBroadcast.name = this.user.name;
      tempBroadcast.date = moment().toISOString();
      tempBroadcast.numOfComments = 0;
      tempBroadcast.numOfLikes = 0;
      if (this.isBroadcast) {
        tempBroadcast.key = this.firebaseService
        .addCommentToBroadcast(tempBroadcast, this.user.organizationId, this.broadcastKey);
      } else {
        tempBroadcast.key = this.firebaseService
        .addCommentToMessage(tempBroadcast, this.user.organizationId, this.broadcastKey);
      }
      this.updateUserPostListAndCommentNumber(tempBroadcast);
      this.view.dismiss();
    }
  }
  closeModal() {
    this.view.dismiss();
  }
}
