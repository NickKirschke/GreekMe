import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { User } from '../../models/user';
/**
 * Created by nicholaskirschke on 8/3/17.
 */
@Injectable()
export class UserServiceProvider {
  constructor(private storage: Storage) {
  }

  currentUserInfo() {
    // Retrieve user information from local storage and return
    return new Promise((resolve) => {
      this.storage.get('user').then(res => resolve(JSON.parse(res)));
    });
  }
}
