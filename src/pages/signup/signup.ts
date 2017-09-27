import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import {User} from "../../models/user";
import {AngularFireAuth} from "angularfire2/auth/auth";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {Storage} from "@ionic/storage";
import {GreekMePage} from "../greekme/greekme";
import {TabsControllerPage } from "../tabs-controller/tabs-controller";
import { LoadingController } from 'ionic-angular';


@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  user = {} as User;
  error;
  // this tells the tabs component which Pages
  // should be each tab's root Page
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private storage: Storage,
    public loadingCtrl: LoadingController) {
  }
  async register(user: User) {
    try {
      var loader = this.loadingCtrl.create({
        content: "Registering...",
        dismissOnPageChange: true
      });
      loader.present();
      const result = await this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
      this.user.password='';
      this.user.uid ='';
      this.firebaseService.addUserDetails(user);
      this.navCtrl.setRoot(TabsControllerPage);
    } catch (e) {
      var trimmedMessage = /^.*:\s*(.*)$/.exec(e.message);
      if(trimmedMessage == null) {
        this.error = e.message;
      } else {
        this.error = trimmedMessage[1];
      }
    } finally {
      loader.dismiss();
    }
  }

  goToLogin(params){
    if (!params) params = {};
    this.navCtrl.setRoot(LoginPage,{},{animate: true, direction: 'back'});
  }
}
