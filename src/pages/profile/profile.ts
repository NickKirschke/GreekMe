import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth/auth";
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { LoginPage } from "../login/login";
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/user-service/user-service';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  App: App;
  user = {} as User;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private userService: UserServiceProvider,
    private app: App) {
    this.afAuth.authState.subscribe(data => {
      if (!data || !data.email || !data.uid) {
        this.app.getRootNavs()[0].setRoot(LoginPage);
      } else {
        this.dataSetup();
      }
    });
    this.App = app;
  }

  async dataSetup() {
      const userGrab = await this.userService.currentUserInfo();
      this.user = userGrab as User;
      console.log(this.user);
    // this.broadcastItemRef = await this.firebaseService.getBroadcastList(this.user.organization_ID);
    // this.userLikedListRef = await this.firebaseService.getUserLikeList(this.user.uid);
    // this.userLikedList = this.userLikedListRef.snapshotChanges().map(action => {
    //   return action.map(c => ({
    //     key: c.payload.key, ...c.payload.val()
    //   }));
    // });
    // this.broadcastItems = this.broadcastItemRef.snapshotChanges().map(action => {
    //   return action.map(c => ({
    //     key: c.payload.key, ...c.payload.val(), iconName: this.checkIcons(c.payload.key)
    //   })).reverse();
    // });
    // if (this.user.role == 'President' || this.user.role == ('Vice President') || this.user.role == ('Chair Member')) {
    //   this.validRole = true;
    // }
    // const imageGrab = this.firebaseService.getGreetingImage(this.user.organization_ID);
    // imageGrab.then((result) => {
    //   this.image = result;
    // }, (error) => {
    //   this.image = 'https://firebasestorage.googleapis.com/v0/b/greekme-7475a.appspot.com/o/GM_Default.png?alt=media&token=6bc30d40-17a2-40bb-9af7-edff78112780';
    // });
    console.log("End of data setup");
  }

  logout() {
    this.afAuth.auth.signOut();
    this.App.getRootNav().setRoot(LoginPage);
  }

}
