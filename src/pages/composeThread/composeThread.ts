import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { UserServiceProvider } from '../../providers/userService/userService';
import 'firebase/storage';
import * as moment from 'moment';
import { ContentType } from '../../models/contentType';
import app from 'firebase/app';

@Component({
  selector: 'page-composeThread',
  templateUrl: 'composeThread.html',
})
export class ComposeThreadPage {
  @ViewChild('comment') comment: ElementRef;
  contentType: ContentType;
  user = {} as User;
  tempPost = {} as Post;
  error: string = '';
  postKey: string = '';
  constructor(
    private firebaseService: FirebaseServiceProvider,
    private userService: UserServiceProvider,
    private navParams: NavParams,
    private view: ViewController,
  ) {}

  ionViewWillEnter() {
    this.dataSetup();
  }

  async dataSetup() {
    const data = this.navParams.data;
    this.postKey = data.key;
    this.contentType = data.contentType;
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
  }

  composeThread(tempPost: Post) {
    if (tempPost.text == null || tempPost.text === '') {
      this.error = 'Message cannot be blank!';
    } else {
      this.error = '';
      tempPost.avatarUrl = this.user.avatarUrl;
      tempPost.uid = this.user.uid;
      tempPost.name = this.user.name;
      tempPost.date = moment().toISOString();
      tempPost.contentType = ContentType.Thread;
      if (this.contentType === ContentType.Broadcast) {
        tempPost.key = this.firebaseService.addCommentToBroadcast(
          tempPost,
          this.user.organizationId,
          this.postKey,
        );
      } else if (this.contentType === ContentType.Message) {
        tempPost.key = this.firebaseService.addCommentToMessage(
          tempPost,
          this.user.organizationId,
          this.postKey,
        );
      }
      if (tempPost.key) {
        this.view.dismiss();
      } else {
        // Add logging here
        this.error = 'Key not initialized error with ContentType';
      }
    }
  }

  resize() {
    this.comment.nativeElement.style.height = 'auto';
    this.comment.nativeElement.style.height = `${this.comment.nativeElement.scrollHeight}px`;
  }

  closeModal() {
    this.view.dismiss();
  }
}
