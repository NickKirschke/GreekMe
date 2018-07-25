import { Component, Input } from '@angular/core';
import { Post } from '../../models/post';
import * as firebase from 'firebase/app';
import { User } from '../../models/user';
import { UserLike } from '../../models/userLike';
import { NavController } from 'ionic-angular';
import { ProfilePage } from '../../pages/profile/profile';
import { ThreadPage } from '../../pages/thread/thread';

@Component({
  selector: 'post-row',
  templateUrl: 'post-row.html',
})
export class PostRowComponent {
  @Input('post') post: Post;
  @Input('user') user: User;
  @Input('userLikeItems') userLikeItems: Set<string> = new Set<string>();
  @Input('showComments') showComments : boolean = true;
  @Input('showLikes') showLikes : boolean = true;
  avatar = '' as string;
  constructor(public navCtrl: NavController) {
  }

  ngOnInit() {
    this.setupAvatar();
  }

  async setupAvatar() {
    const path = `${this.user.organizationId}/profilePhotos/${this.post.uid}`;
    this.avatar = await firebase.storage().ref(path).getDownloadURL();
  }

  goToProfile() {
    this.navCtrl.push(ProfilePage, {
      uid: this.post.uid,
    });
  }

  doLike() {
    this.post.iconName = this.post.iconName === 'heart-outline' ?
      'heart' : 'heart-outline';
    const updates = {};
    // Paths for the updates regarding data that are push out upon like
    const postLikeListPath = `/organization/${this.user.organizationId}/${
      this.post.contentType}/${this.post.key}/likeList/${this.user.uid}`;
    const userLikeListPath = `/users/${this.user.uid}/likeList/${this.post.key}`;
    const numOfLikePath = `/organization/${
      this.user.organizationId}/${this.post.contentType}/${this.post.key}/numOfLikes/`;
    // TODO Post list acting weird with the liking
    // const ownerPostPath = `/users/${this.post.uid}/postList/${this.post.key}`;

    const isLiked = this.userLikeItems.has(this.post.key);
    if (isLiked) {
      // Do unlike
      this.post.numOfLikes -= 1;
      updates[postLikeListPath] = null;
      updates[userLikeListPath] = null;
      updates[numOfLikePath] = this.post.numOfLikes;

    } else {
      // Do like
      // This is the object stored on the post like list
      this.post.numOfLikes += 1;
      const userLikeObj = {
        name: this.user.name,
        key: this.user.uid,
      } as UserLike;
        // This is the object stored on the user's like list
      const postLikeObj = {
        name: this.post.text,
        key: this.post.key,
      };
      updates[postLikeListPath] = userLikeObj;
      updates[userLikeListPath] = postLikeObj;
      updates[numOfLikePath] = this.post.numOfLikes;
    }
    // TODO updates[ownerPostPath] = this.post;
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
    const aPost = JSON.stringify(this.post);
    const aUser = JSON.stringify(this.user);
    const data = {
      organizationId: this.user.organizationId,
      post: aPost,
      user: aUser,
    };
    this.navCtrl.push(ThreadPage, data);
  }
}
