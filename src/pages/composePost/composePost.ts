import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import * as moment from 'moment';
import { ContentType } from '../../models/contentType';

@Component({
  selector: 'page-composePost',
  templateUrl: 'composePost.html',
})
export class ComposePostPage {
  contentType: ContentType;
  firebaseStorage = firebase.storage();
  user = {} as User;
  tempPost = {} as Post;
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

  updatePostList(tempPost: Post) {
    const updates = {};
    updates[`/users/${this.user.uid}/postList/${tempPost.key}`] = tempPost;
    firebase.database().ref().update(updates).then(() => {
    }).catch((error) => {
      console.log(error);
    });
  }

  composePost(tempPost: Post) {
    if (tempPost.text == null || tempPost.text === '') {
      this.error = 'Message cannot be blank!';
    } else {
      this.error = '';
      tempPost.avatarUrl = this.user.avatarUrl;
      tempPost.uid = this.user.uid;
      tempPost.name = this.user.name;
      tempPost.numOfComments = 0;
      tempPost.numOfLikes = 0;
      tempPost.date = moment().toISOString();
      tempPost.contentType = this.contentType;
      if (this.contentType === ContentType.Broadcast) {
        // Need to still update user commentList, need to get the broadcast ID
        tempPost.key = this.firebaseService
        .addToBroadcastList(tempPost, this.user.organizationId);
      } else if (this.contentType === ContentType.Message) {
        tempPost.key = this.firebaseService
        .addToFeedList(tempPost, this.user.organizationId);
      }
      if (tempPost.key) {
        this.updatePostList(tempPost);
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
