import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { User } from '../../models/user';
import { AngularFireAuth } from 'angularfire2/auth/auth';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { TabsControllerPage } from '../tabs-controller/tabs-controller';
import * as firebase from 'firebase/app';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  signupForm: FormGroup;
  error;
  // this tells the tabs component which Pages
  // should be each tab's root Page
  constructor(private afAuth: AngularFireAuth,
              public navCtrl: NavController,
              public firebaseService: FirebaseServiceProvider,
              public loadingCtrl: LoadingController,
              private formBuilder: FormBuilder) {
  }

  ionViewWillLoad() {
    this.signupForm = this.formBuilder.group({
      name: [''],
      email: [''],
      organizationId: [''],
      role: [''],
      password: [''],
    });
  }

  async register() {
    const user = {
      name: this.signupForm.value.name,
      email: this.signupForm.value.email,
      organizationId: this.signupForm.value.organizationId,
      role: this.signupForm.value.role,
    } as User;
    console.log(user);
    const loader = this.loadingCtrl.create({
      content: 'Registering...',
      dismissOnPageChange: true,
    });
    try {
      loader.present();
      firebase.database().ref('organization/' + user.organizationId)
      .once('value').then((snapshot) => {
        if (snapshot.val()) {
          this.afAuth.auth
          .createUserWithEmailAndPassword(user.email, this.signupForm.value.password)
          .then((res) => {
            user.uid = res.user.uid;
            this.firebaseService.addUserDetails(user).then(() => {
              this.navCtrl.setRoot(TabsControllerPage);
            });
          }).catch((e: Error) => {
            this.errorMessageDigest(e);
          });
        } else {
          throw new Error('Invalid organization code');
        }
      }).catch((e: Error) => {
        this.errorMessageDigest(e);
      });
    } finally {
      loader.dismiss();
    }
  }

  errorMessageDigest(e: Error) {
    const trimmedMessage = /^.*:\s*(.*)$/.exec(e.message);
    if (trimmedMessage == null) {
      this.error = e.message;
    } else {
      this.error = trimmedMessage[1];
    }
  }

  goToLogin() {
    this.navCtrl.setRoot(LoginPage, {}, { animate: true, direction: 'back' });
  }
}
