import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Post } from '../../models/post';
import * as Rx from 'rxjs/Rx';
/**
 * Created by nicholaskirschke on 8/3/17.
 */
@Injectable()
export class UserServiceProvider {
  notifications = new Map<string, Post>();
  notificationSizeSubject = new Rx.Subject();
  notificationsIcon = 'notifications-outline';
  constructor(private storage: Storage) {}

  updateNotifications(key, notification) {
    this.notifications.set(key, notification);
    this.notificationSizeSubject.next(this.notifications.size);
  }

  removeNotification(key) {
    this.notifications.delete(key);
    this.notificationSizeSubject.next(this.notifications.size);
  }

  currentUserInfo() {
    // Retrieve user information from local storage and return
    return new Promise(resolve => {
      this.storage.get('user').then(res => resolve(JSON.parse(res)));
    });
  }
}
