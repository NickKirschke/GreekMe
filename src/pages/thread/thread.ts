import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Post } from '../../models/post';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeThreadPage } from '../composeThread/composeThread';
import { Observable } from 'rxjs/Observable';
import { ContentType } from '../../models/contentType';
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/userService/userService';
/**
 * Generated class for the ThreadPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-thread',
  templateUrl: 'thread.html',
})
export class ThreadPage {
  firebaseStorage = firebase.storage();
  postItems$: Observable<any>;
  post = {} as Post;
  organizationId = '';
  user = {} as User;
  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    private firebaseService: FirebaseServiceProvider,
    private modal: ModalController,
    private userService: UserServiceProvider,
  ) {}

  ionViewWillLoad() {
    this.dataSetup();
  }

  async dataSetup() {
    const data = this.navParams.data;
    this.post = JSON.parse(data.post);
    this.organizationId = data.organizationId;
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;

    if (this.post.contentType === ContentType.Broadcast) {
      this.postItems$ = this.firebaseService
        .getCommentListBroadcast(this.organizationId, this.post.key)
        .valueChanges();
    } else if (this.post.contentType === ContentType.Message) {
      this.postItems$ = this.firebaseService
        .getCommentListMessage(this.organizationId, this.post.key)
        .valueChanges();
    }
  }

  goToComposeThread() {
    const data = {
      key: this.post.key,
      contentType: this.post.contentType,
    };
    const myModal = this.modal.create(ComposeThreadPage, data);
    myModal.present();
  }
}
