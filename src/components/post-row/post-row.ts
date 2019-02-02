import { Component, Input } from '@angular/core';
import { Post } from '../../models/post';
import { User } from '../../models/user';
import { UserLike } from '../../models/userLike';
import { NavController } from 'ionic-angular';
import { ProfilePage } from '../../pages/profile/profile';
import { ThreadPage } from '../../pages/thread/thread';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';

import app from 'firebase/app';
import { GlobalsProvider } from '../../providers/globals/globals';
import { Subscription } from 'rxjs';
import { UserServiceProvider } from '../../providers/userService/userService';

@Component({
  selector: 'post-row',
  templateUrl: 'post-row.html',
})
export class PostRowComponent {
  @Input('post') post: Post;
  @Input('user') user: User;
  @Input('userLikeItems') userLikeItems: Set<string> = new Set<string>();
  @Input('showComments') showComments: boolean = true;
  @Input('showLikes') showLikes: boolean = true;
  @Input('deleteable') deleteable: boolean = false;
  avatar: string;
  avatarSubscription: Subscription;
  firstLoad: boolean = true;

  constructor(
    public navCtrl: NavController,
    private firebaseService: FirebaseServiceProvider,
    globalsProvider: GlobalsProvider,
    private userService: UserServiceProvider,
  ) {
    this.avatar = globalsProvider.DEFAULT_IMAGE_PATH;
  }

  ngOnInit() {
    this.setupAvatar();
    this.avatarWatch();
  }

  ionViewWillUnload() {
    this.destroySubscriptions();
  }

  destroySubscriptions() {
    this.avatarSubscription.unsubscribe();
  }

  listExistsAndValidLength(aList: object) {
    return aList && this.getListLength(aList) > 0;
  }

  getListLength(aList: object) {
    return Object.keys(aList).length;
  }

  async setupAvatar() {
    const path = `${this.user.organizationId}/profilePhotos/${this.post.uid}`;
    this.avatar = await app
      .storage()
      .ref(path)
      .getDownloadURL();
  }

  avatarWatch() {
    // References the avatarUrl of the post's creator, any changes it will refetch the downloadlink
    const postAvatarRef = this.firebaseService.getUserAvatar(this.post.uid);
    this.avatarSubscription = postAvatarRef.valueChanges().subscribe(avatarUrl => {
      if (avatarUrl !== this.avatar) {
        this.setupAvatar();
      }
    });
  }

  goToProfile() {
    this.navCtrl.push(ProfilePage, {
      uid: this.post.uid,
    });
  }

  doLike() {
    const isLiked = this.userLikeItems.has(this.post.key);
    const updates = {};
    const postToSubmit = { ...this.post };
    const postLikeListPath = `/organization/${this.user.organizationId}/${this.post.contentType}/${
      this.post.key
    }/likeList/${this.user.uid}`;
    const userLikeListPath = `/users/${this.user.uid}/likeList/${this.post.key}`;
    const ownerPostPath = `/users/${this.post.uid}/postList/${this.post.key}`;

    this.post.iconName = isLiked ? 'heart-outline' : 'heart';
    postToSubmit.iconName = null;
    if (isLiked) {
      // Do unlike
      updates[postLikeListPath] = null;
      postToSubmit.likeList[this.user.uid] = null;
      app
        .database()
        .ref(userLikeListPath)
        .set(null);
    } else {
      // Do like
      // This is the object stored on the post's like list
      const userLikeObj = {
        name: this.user.name,
        key: this.user.uid,
      } as UserLike;
      // This is the object stored on the user's like list
      const postLikeObj = {
        text: this.post.text,
        key: this.post.key,
      };
      if (postToSubmit.likeList) {
        postToSubmit.likeList[this.user.uid] = userLikeObj;
      } else {
        postToSubmit.likeList = {};
        postToSubmit.likeList[this.user.uid] = userLikeObj;
      }
      updates[postLikeListPath] = userLikeObj;
      app
        .database()
        .ref(userLikeListPath)
        .set(postLikeObj);
    }
    updates[ownerPostPath] = postToSubmit;
    app
      .database()
      .ref()
      .update(updates)
      .catch(error => {
        console.log('Error unlike');
        console.log(error.message());
      });
  }

  itemSelected() {
    const aPost = JSON.stringify(this.post);
    const data = {
      organizationId: this.user.organizationId,
      post: aPost,
    };
    this.navCtrl.push(ThreadPage, data);
  }

  deleteNotification() {
    this.userService.removeNotification(this.post.key);
  }
}
