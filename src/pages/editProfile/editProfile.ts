import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { User } from '../../models/user';

@Component({
  selector: 'page-editProfile',
  templateUrl: 'editProfile.html',
})
export class EditProfilePage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  user = {} as User;
  constructor(public navCtrl: NavController,
              private navParams: NavParams,
              private view: ViewController) {
  }

  ionViewWillEnter() {
    this.user = JSON.parse(this.navParams.get('user'));
  }
  closeModal() {
    this.view.dismiss();
  }
}
