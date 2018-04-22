import { Injectable } from '@angular/core';
import {User} from "../../models/user";
import {Storage} from "@ionic/storage";
/**
 * Created by nicholaskirschke on 8/3/17.
 */
@Injectable()
export class UserServiceProvider {
  user = {} as User;
  constructor(private storage: Storage) {

}

  currentUserInfo() {
    // Retrieve user information from local storage and return
    return new Promise((resolve) =>
    {
      let temp = {} as User;
      this.storage.get("user").then(res => resolve(JSON.parse(res)));
    });
  }
}
