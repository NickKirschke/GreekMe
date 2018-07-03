import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, Content } from 'ionic-angular';
import { Broadcast } from '../../models/broadcast';
import { FirebaseServiceProvider } from '../../providers/firebase-service/firebase-service';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeThreadPage } from '../compose-thread/compose-thread';
import { Observable } from 'rxjs/Observable';
import { ProfilePage } from '../profile/profile';
import { ContentType } from '../../models/contentType';
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
  broadcastItems$: Observable<any>;
  broadcast = {} as Broadcast;
  organizationId = '';
  contentType: ContentType;
  constructor(public navCtrl: NavController,
              private navParams: NavParams,
              private firebaseService: FirebaseServiceProvider,
              private modal: ModalController) {
  }

  ionViewDidLoad() {
    this.dataSetup();
  }

  async dataSetup() {
    const data = this.navParams.data;
    this.broadcast = JSON.parse(data.broadcast);
    this.organizationId = data.organizationId;
    this.contentType = data.contentType;

    if (this.contentType === ContentType.Broadcast) {
      this.broadcastItems$ = this.firebaseService
        .getCommentListBroadcast(this.organizationId, this.broadcast.key).valueChanges();
    } else if (this.contentType === ContentType.Message) {
      this.broadcastItems$ = this.firebaseService
        .getCommentListMessage(this.organizationId, this.broadcast.key).valueChanges();
    }
  }

  goToComposeThread() {
    const myModal = this.modal.create(ComposeThreadPage, {
      key: this.broadcast.key,
      contentType: this.contentType,
    });
    myModal.present();
  }
}
