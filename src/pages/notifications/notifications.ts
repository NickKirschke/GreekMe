import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Post } from '../../models/post';
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/userService/userService';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {
  notifications = new Map<string, Post>();
  user = {} as User;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private view: ViewController,
    private userService: UserServiceProvider,
  ) {}

  ionViewWillEnter() {
    this.dataSetup();
  }

  ionViewWillLoad() {
    this.notifications = this.userService.notifications;
    console.log(this.notifications);
  }

  async dataSetup() {
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
  }

  trackByFn(index: number, item: any) {
    return item.key;
  }

  closeModal() {
    this.view.dismiss();
  }
}
