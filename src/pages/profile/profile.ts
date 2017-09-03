import { Component } from '@angular/core';
import {NavController, App} from 'ionic-angular';
import {AngularFireAuth} from "angularfire2/auth/auth";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {LoginPage} from "../login/login";

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  constructor(private afAuth: AngularFireAuth, public navCtrl: NavController, public firebaseService: FirebaseServiceProvider, private app: App) {

    // var o = this.broadcastItems.forEach(item => {
    //   console.log('Item:', item);
    // });
    // console.log("check login");
    // this.logout();
    this.logout(app);
  }

  logout(appLocal: App) {
    this.afAuth.auth.signOut();
    appLocal.getRootNav().setRoot(LoginPage);
  }

}
