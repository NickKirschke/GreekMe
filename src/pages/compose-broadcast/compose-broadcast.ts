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
  selector: 'page-compose-broadcast',
  templateUrl: 'compose-broadcast.html',
})
export class ComposeBroadcastPage {
  contentType: ContentType;
  firebaseStorage = firebase.storage();
  user = {} as User;
  tempBroadcast = {} as Broadcast;
  error = '';
  constructor(public firebaseService: FirebaseServiceProvider,
              private userService: UserServiceProvider,
              private navParams: NavParams,
              private view: ViewController) {
  }

  ionViewDidLoad() {
    this.dataSetup();
  }

  async dataSetup() {
    this.contentType = this.navParams.get('contentType');
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

      if (this.contentType === ContentType.Broadcast) {
        // Need to still update user commentList, need to get the broadcast ID
        tempBroadcast.key = this.firebaseService
        .addToBroadcastList(tempBroadcast, this.user.organizationId);
      } else if (this.contentType === ContentType.Message) {
        tempBroadcast.key = this.firebaseService
        .addToFeedList(tempBroadcast, this.user.organizationId);
      }
      if (tempBroadcast.key) {
        this.updatePostList(tempBroadcast);
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
