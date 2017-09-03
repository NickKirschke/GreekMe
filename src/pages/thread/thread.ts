import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Broadcast } from '../../models/broadcast';
/**
 * Generated class for the ThreadPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-thread',
  templateUrl: 'thread.html',
})
export class ThreadPage {
  broadcast = {} as Broadcast;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.broadcast.avatar_url = navParams.get("avatar_url");
    this.broadcast.text = navParams.get("text");
    this.broadcast.name= navParams.get("name");
    this.broadcast.date = navParams.get("date");
    this.broadcast.uid = navParams.get("uid");
    this.broadcast.key = navParams.get("key");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ThreadPage');
  }

}
