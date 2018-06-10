import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { User } from "../../models/user";
import { AngularFireAuth } from "angularfire2/auth/auth";
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { TabsControllerPage } from "../tabs-controller/tabs-controller";
import { LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from '@firebase/util';
import { Subscription } from 'rxjs';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  loginForm: FormGroup;
  user = {} as User;
  error = '';
  userCheck: Subscription;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder) {
  }

  ionViewWillLoad() {
    // If user is logged in retrieve uid then access user info from db..
    this.userCheck = this.afAuth.authState.subscribe(data => {
      if(data) {
        this.firebaseService.getUserDetails(data.uid).then(() => this.navCtrl.setRoot(TabsControllerPage));
      }
    });

    this.loginForm = this.formBuilder.group({
      email: [''],
      password: ['']
    });
  }

  ionViewWillLeave() {
    this.userCheck.unsubscribe();
  }

  // Method used to transfer user to signup page
  goToSignup(params) {
    if (!params) params = {};
    this.navCtrl.setRoot(SignupPage, {}, { animate: true, direction: 'forward' });
  }

  // Method used to log in
  async login() {
    try {
      var loader = this.loadingCtrl.create({
        content: "Logging in...",
        dismissOnPageChange: true
      });
      loader.present();
      // Checks to see if user credentials exist
      await this.afAuth.auth.signInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password);
    } catch (e) {
      var trimmedMessage = /^.*:\s*(.*)$/.exec(e.message);
      if (trimmedMessage == null) {
        this.error = e.message;
      } else {
        this.error = trimmedMessage[1];
      }
    } finally {
      loader.dismiss();
    }
  }

}
