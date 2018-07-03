import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Broadcast } from '../../models/broadcast';
import * as firebase from 'firebase/app';
import { User } from '../../models/user';
import { UserLike } from '../../models/userLike';

/**
 * Generated class for the BroadcastRowComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'broadcast-row',
  templateUrl: 'broadcast-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BroadcastRowComponent {
  @Input('broadcast') broadcast : Broadcast;
  @Output() likeEmitter = new EventEmitter();
  @Input('user') user: User;
  @Input('userLikeItems') userLikeItems: Set<string>;
  @Output() commentEmitter = new EventEmitter();
  @Input() showComments : boolean = true;
  @Input() showLikes : boolean = true;
  @Output() profileUidEmitter = new EventEmitter();
  likeList: UserLike[];
  constructor() {
  }

  ngAfterViewInit() {
  }

  goToProfile() {
    this.profileUidEmitter.emit(this.broadcast.uid);
  }

  doLike() {
    this.broadcast.iconName = this.broadcast.iconName === 'heart-outline' ?
      'heart' : 'heart-outline';
    const updates = {};
    let currentLikes = 0;
    const broadcastPath = `/organization/${
        this.user.organizationId}/broadcast/${this.broadcast.key}/likeList/${this.user.uid}`;
    const userLikePath = `/users/${this.user.uid}/likeList/${this.broadcast.key}`;
    const numOfLikePath = `/organization/${
        this.user.organizationId}/broadcast/${this.broadcast.key}/numOfLikes/`;
    const numOfLikesRef = firebase.database().ref(`/organization/${
        this.user.organizationId}/broadcast/${this.broadcast.key}/numOfLikes`);
    numOfLikesRef.on('value', (snapshot) => {
      currentLikes = snapshot.val();
    });

    const isLiked = this.userLikeItems.has(this.broadcast.key);
    if (isLiked) {
        // Do unlike
      updates[broadcastPath] = null;
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
      updates[broadcastPath] = userLikeObj;
      updates[userLikePath] = broadcastLikeObj;
      updates[numOfLikePath] = currentLikes + 1;
    }
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
    this.commentEmitter.emit(this.broadcast);
  }
}
