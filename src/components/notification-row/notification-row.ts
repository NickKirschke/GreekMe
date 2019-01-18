import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ThreadPage } from '../../pages/thread/thread';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { UserServiceProvider } from '../../providers/userService/userService';
import app from 'firebase/app';
import { GlobalsProvider } from '../../providers/globals/globals';

@Component({
  selector: 'notification-row',
  templateUrl: 'notification-row.html',
})
export class NotificationRowComponent {
  @Input('user') user: User;
  @Input('notification') notification: Post;
  avatar = '';
  constructor(
    public navCtrl: NavController,
    private userService: UserServiceProvider,
    globalsProvider: GlobalsProvider,
  ) {
    this.avatar = globalsProvider.DEFAULT_IMAGE_PATH;
  }

  ngOnInit() {
    this.setupAvatar();
  }

  async setupAvatar() {
    // Avatar url === default, use it, otherwise fetch it from storage
    if (this.notification.avatarUrl !== this.avatar) {
      const path = `${this.user.organizationId}/profilePhotos/${this.notification.uid}`;
      this.avatar = await app
        .storage()
        .ref(path)
        .getDownloadURL();
    }
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
}
