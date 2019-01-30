import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ThreadPage } from '../../pages/thread/thread';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { UserServiceProvider } from '../../providers/userService/userService';
import app from 'firebase/app';
import { GlobalsProvider } from '../../providers/globals/globals';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'notification-row',
  templateUrl: 'notification-row.html',
})
export class NotificationRowComponent {
  @Input('user') user: User;
  @Input('notification') notification: Post;
  avatar = '';
  avatarSubscription: Subscription;
  constructor(
    public navCtrl: NavController,
    private userService: UserServiceProvider,
    globalsProvider: GlobalsProvider,
    private firebaseService: FirebaseServiceProvider,
  ) {
    this.avatar = globalsProvider.DEFAULT_IMAGE_PATH;
  }

  ngOnInit() {
    this.setupAvatar();
  }

  async setupAvatar() {
    const path = `${this.user.organizationId}/profilePhotos/${this.notification.uid}`;
    this.avatar = await app
      .storage()
      .ref(path)
      .getDownloadURL();
  }

  avatarWatch() {
    // References the avatarUrl of the post's creator, any changes it will refetch the downloadlink
    const postAvatarRef = this.firebaseService.getUserAvatar(this.notification.uid);
    this.avatarSubscription = postAvatarRef.valueChanges().subscribe(avatarUrl => {
      if (avatarUrl !== this.avatar) {
        this.setupAvatar();
      }
    });
  }

  itemSelected() {
    const aNotification = JSON.stringify(this.notification);
    const data = {
      organizationId: this.user.organizationId,
      post: aNotification,
    };
    this.navCtrl.push(ThreadPage, data);
  }

  deleteNotification() {
    this.userService.removeNotification(this.notification.key);
  }

  destroySubscriptions() {
    this.avatarSubscription.unsubscribe();
  }

  ionViewWillUnload() {
    this.destroySubscriptions();
  }
}
