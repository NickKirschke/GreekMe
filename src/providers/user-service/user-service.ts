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
      this.storage.get("avatar_url").then(res => temp.avatar_url = res);
      this.storage.get("uid").then(res => temp.uid = res);
      this.storage.get("name").then(res => temp.name = res);
      this.storage.get("email").then(res => temp.email = res);
      this.storage.get("organization_school").then(res => temp.organization_school = res);
      this.storage.get("role").then(res => temp.role = res);
      this.storage.get("eventAttendingList").then(res => temp.eventsAttending = res);
      this.storage.get("organization_ID").then(res => {temp.organization_ID = res, resolve(temp)});
      // console.log(temp);
    });
  }
}
