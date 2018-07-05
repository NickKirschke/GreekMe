import { Component, Input } from '@angular/core';
import { Broadcast } from '../../models/broadcast';
import * as firebase from 'firebase/app';
import { User } from '../../models/user';
import { UserLike } from '../../models/userLike';
import { NavController } from 'ionic-angular';
import { ProfilePage } from '../../pages/profile/profile';
import { ThreadPage } from '../../pages/thread/thread';

/**
 * Generated class for the BroadcastRowComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'broadcast-row',
  templateUrl: 'broadcast-row.html',
})
export class BroadcastRowComponent {
  @Input('broadcast') broadcast : Broadcast;
  @Input('user') user: User;
  @Input('userLikeItems') userLikeItems: Set<string> = new Set<string>();
  @Input('showComments') showComments : boolean = true;
  @Input('showLikes') showLikes : boolean = true;
  constructor(public navCtrl: NavController) {
  }

  goToProfile() {
    this.navCtrl.push(ProfilePage, {
      uid: this.broadcast.uid,
    });
  }

  doLike() {
    this.broadcast.iconName = this.broadcast.iconName === 'heart-outline' ?
      'heart' : 'heart-outline';
    const updates = {};
    let currentLikes = 0;
    // Paths for the updates regarding data that are push out upon like
    const broadcastLikePath = `/organization/${this.user.organizationId}/${
      this.broadcast.contentType}/${this.broadcast.key}/likeList/${this.user.uid}`;
    const userLikePath = `/users/${this.user.uid}/likeList/${this.broadcast.key}`;
    const numOfLikePath = `/organization/${
      this.user.organizationId}/${this.broadcast.contentType}/${this.broadcast.key}/numOfLikes/`;
    // TODO only update the num of likes and likeList on the post List?
    const userPostPath = `/users/${this.broadcast.uid}/postList/${this.broadcast.key}`;
    const numOfLikesRef = firebase.database().ref(`/organization/${
      this.user.organizationId}/${this.broadcast.contentType}/${this.broadcast.key}/numOfLikes`);
    numOfLikesRef.on('value', (snapshot) => {
      currentLikes = snapshot.val();
    });

    const isLiked = this.userLikeItems.has(this.broadcast.key);
    if (isLiked) {
        // Do unlike
      updates[broadcastLikePath] = null;
      updates[userLikePath] = null;
      updates[numOfLikePath] = currentLikes - 1;
    } else {
        // Do like
        // This is the object stored on the broadcast like list
      const userLikeObj = {
        name: this.user.name,
        key: this.user.uid,
      } as UserLike;
        // This is the object stored on the user's like list
      const broadcastLikeObj = {
        name: this.broadcast.text,
        key: this.broadcast.key,
      };
      updates[broadcastLikePath] = userLikeObj;
      updates[userLikePath] = broadcastLikeObj;
      updates[numOfLikePath] = currentLikes + 1;
    }
    updates[userPostPath] = this.broadcast;
    firebase.database().ref().update(updates).then(() => {
      if (isLiked) {
        console.log('Did unlike');
      } else {
        console.log('Did like');
      }
    }).catch((error) => {
      console.log('Error unlike');
      console.log(error.message());
    });
  }

  itemSelected() {
    const bc = JSON.stringify(this.broadcast);
    const data = {
      organizationId: this.user.organizationId,
      broadcast: bc,
    };
    this.navCtrl.push(ThreadPage, data);
  }
}
