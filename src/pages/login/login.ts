import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import {User} from "../../models/user";
import {AngularFireAuth} from "angularfire2/auth/auth";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {TabsControllerPage } from "../tabs-controller/tabs-controller"


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  user = {} as User;
  error = '';
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider) {
  }
  // Method used to transfer user to signup page
  goToSignup(params){
    if (!params) params = {};
    this.navCtrl.setRoot(SignupPage,{},{animate: true, direction: 'forward'});
  }
  // Method used to log in
  async login(user: User) {
    try { // Checks to see if user credentials exist
      const result = this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password);
      // If successful login, retrieve uid then access user info from db.
      this.afAuth.authState.subscribe(data=> {
        if (data) {
          this.firebaseService.getUserDetails(data.uid);
          // Then transfer to main page
          this.navCtrl.setRoot(TabsControllerPage);
        }
      });
    } catch(error) {
      var trimmedMessage = /^.*:\s*(.*)$/.exec(error.message);
      this.error = trimmedMessage[1];
    }
  }
}
