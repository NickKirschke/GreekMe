import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ThreadPage } from '../../pages/thread/thread';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { UserServiceProvider } from '../../providers/userService/userService';
import app from 'firebase/app';

@Component({
  selector: 'notification-row',
  templateUrl: 'notification-row.html',
})
export class NotificationRowComponent {
  @Input('user') user: User;
  @Input('notification') notification: Post;
  avatar = '';
  constructor(public navCtrl: NavController,
              private userService: UserServiceProvider) {

  }

  ngOnInit() {
    this.setupAvatar();
  }

  async setupAvatar() {
    // Avatar url === default, use it, otherwise fetch it from storage
    console.log(this.notification.avatarUrl);
    if (this.notification.avatarUrl === '../../assets/icon/GMIcon.png') {
      this.avatar = 'https://firebasestorage.googleapis.com/v0/b/greekme-7475a.appspot.com/o/' +
        'GM_Default.png?alt=media&token=6bc30d40-17a2-40bb-9af7-edff78112780';
    } else {
      const path = `${this.user.organizationId}/profilePhotos/${this.notification.uid}`;
      this.avatar = await app.storage().ref(path).getDownloadURL();
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
    this.userService.notifications.delete(this.notification.key);
  }
}
