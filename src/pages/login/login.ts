import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import {User} from "../../models/user";
import {AngularFireAuth} from "angularfire2/auth/auth";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {TabsControllerPage } from "../tabs-controller/tabs-controller";
import { LoadingController } from 'ionic-angular';
import { UserServiceProvider } from '../../providers/user-service/user-service';


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
    public firebaseService: FirebaseServiceProvider,
    public loadingCtrl: LoadingController,
    private userService: UserServiceProvider) {
  }
  // Method used to transfer user to signup page
  goToSignup(params){
    if (!params) params = {};
    this.navCtrl.setRoot(SignupPage,{},{animate: true, direction: 'forward'});
  }
  // Method used to log in
  async login(user) {
    try { // Checks to see if user credentials exist
        var loader = this.loadingCtrl.create({
        content: "Logging in...",
        dismissOnPageChange: true
      });
      loader.present();
      const result =  await this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password);
      // If successful login, retrieve uid then access user info from db.
       this.afAuth.authState.subscribe(data => {
          this.firebaseService.getUserDetails(data.uid).then(res => this.navCtrl.setRoot(TabsControllerPage));
       });    
    } catch(e) {
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

}
