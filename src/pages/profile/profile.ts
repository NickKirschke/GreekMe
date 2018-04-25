import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth/auth";
import { FirebaseServiceProvider } from "../../providers/firebase-service/firebase-service";
import { LoginPage } from "../login/login";
import { User } from '../../models/user';
import { UserServiceProvider } from '../../providers/user-service/user-service';
import { Observable } from 'rxjs/Observable';
import { AngularFireList } from 'angularfire2/database';
import { Broadcast } from '../../models/broadcast';
import { Event } from '../../models/event';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  App: App;
  user = {} as User;
  postItems: Observable<Broadcast[]>;
  postItemRef: AngularFireList<any>;
  eventItems: Observable<Event[]>;
  eventItemRef: AngularFireList<any>;
  constructor(private afAuth: AngularFireAuth,
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
    // Get the user's postList
    // Get the user's eventList
  }

  logout() {
    this.afAuth.auth.signOut();
    this.App.getRootNav().setRoot(LoginPage);
  }

}
