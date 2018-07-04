import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { User } from '../../models/user';
import { Broadcast } from '../../models/broadcast';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import * as moment from 'moment';
import { ContentType } from '../../models/contentType';

@Component({
  selector: 'page-compose-thread',
  templateUrl: 'compose-thread.html',
})
export class ComposeThreadPage {
  contentType: ContentType;
  firebaseStorage = firebase.storage();
  user = {} as User;
  tempBroadcast = {} as Broadcast;
  error: string = '';
  broadcastKey: string = '';
  constructor(private firebaseService: FirebaseServiceProvider,
              private userService: UserServiceProvider,
              private navParams: NavParams,
              private view: ViewController) {
  }

  ionViewDidLoad() {
    this.dataSetup();
  }

  async dataSetup() {
    this.broadcastKey = this.navParams.get('key');
    this.contentType = this.navParams.get('contentType');
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
  }

  getNumOfComments() {
    return new Promise((resolve) => {
      const numOfCommentsRef = firebase.database().ref(`/organization/${
        this.user.organizationId}/${this.contentType}/${this.broadcastKey}/numOfComments/`);
      numOfCommentsRef.on('value', (snapshot) => {
        resolve(snapshot.val());
      });
    });
  }

  async updateUserPostListAndCommentNumber(tempBroadcast: Broadcast) {
    let numOfComments;
    numOfComments = await this.getNumOfComments();
    const updates = {};
    updates[`/users/${this.user.uid}/postList/${tempBroadcast.key}`] = tempBroadcast;
    updates[`/organization/${this.user.organizationId}/${this.contentType}/${
      this.broadcastKey}/numOfComments/`] = numOfComments + 1;
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
      console.log(tempBroadcast.key);
      if (this.contentType === ContentType.Broadcast) {
        tempBroadcast.key = this.firebaseService
        .addCommentToBroadcast(tempBroadcast, this.user.organizationId, this.broadcastKey);
      } else if (this.contentType === ContentType.Message) {
        tempBroadcast.key = this.firebaseService
        .addCommentToMessage(tempBroadcast, this.user.organizationId, this.broadcastKey);
      }
      if (tempBroadcast.key) {
        this.updateUserPostListAndCommentNumber(tempBroadcast);
        this.view.dismiss();
      } else {
        // Add logging here
        this.error = 'Key not initialized error with ContentType';
      }
    }
  }

  closeModal() {
    this.view.dismiss();
  }
}
