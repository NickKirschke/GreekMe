import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { User } from '../../models/user';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html'
})
export class EditProfilePage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  user = {} as User;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.user = JSON.parse(navParams.get("user"));
    console.log(this.user.bio);
  }
  
}
