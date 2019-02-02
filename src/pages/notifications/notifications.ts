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

  async dataSetup() {
    const userGrab = await this.userService.currentUserInfo();
    this.user = userGrab as User;
    this.notifications = this.userService.notifications;
  }

  trackByFn(index: number, item: any) {
    return item.key;
  }

  closeModal() {
    this.view.dismiss();
  }
}
