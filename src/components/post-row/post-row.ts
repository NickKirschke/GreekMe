import { Component, Input } from '@angular/core';
import { Post } from '../../models/post';
import { User } from '../../models/user';
import { UserLike } from '../../models/userLike';
import { NavController } from 'ionic-angular';
import { ProfilePage } from '../../pages/profile/profile';
import { ThreadPage } from '../../pages/thread/thread';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import app from 'firebase/app';

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
  avatar: string = '';
  firstLoad: boolean = true;
  constructor(public navCtrl: NavController,
              private firebaseService: FirebaseServiceProvider) {
  }

  ngOnInit() {
    this.setupAvatar();
    this.avatarWatch();
  }

  async setupAvatar() {
    // Avatar url === default, use it, otherwise fetch it from storage
    if (this.post.avatarUrl === '../../assets/icon/GMIcon.png') {
      this.avatar = `https://firebasestorage.googleapis.com/v0/b/greekme-7475a.appspot.com/o/GM_Def
      ault.png?alt=media&token=6bc30d40-17a2-40bb-9af7-edff78112780`;
    } else {
      const path = `${this.user.organizationId}/profilePhotos/${this.post.uid}`;
      this.avatar = await app.storage().ref(path).getDownloadURL();
    }
  }

  avatarWatch() {
    // References the avatarUrl of the post's creator, any changes it will refetch the downloadlink
    const postAvatarRef = this.firebaseService.getUserAvatar(this.post.uid);
    postAvatarRef.snapshotChanges().subscribe((action) => {
      if (action.type === 'value' && !this.firstLoad) {
        this.setupAvatar();
      }
    });
    this.firstLoad = false;
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
    app.database().ref().update(updates).then(() => {
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
