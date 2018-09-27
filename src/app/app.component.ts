import { Component, Injectable, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { FcmProvider } from '../providers/fcm/fcm';
import { tap } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth/auth';
import { FirebaseServiceProvider } from '../providers/firebaseService/firebaseService';
import { TabsControllerPage } from '../pages/tabs-controller/tabs-controller';
@Injectable()
@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  rootPage:any = LoginPage;
  @ViewChild(Nav) nav: Nav;
  constructor(private platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              private fcm: FcmProvider,
              afAuth: AngularFireAuth,
              firebaseService: FirebaseServiceProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
          // If user is logged in retrieve uid then access user info from db..
      afAuth.authState.subscribe((data) => {
        if (data) {
          firebaseService.getUserDetails(data.uid)
            .then(async () => {
              try {
                if (this.platform.is('cordova')) {
                  await this.fcm.getToken();
                  this.fcm.listenToNotifications().pipe(
                  tap((msg) => {
                    // show a toast
                    console.log(msg);
                  }),
                  )
                  .subscribe();
                }
              } catch (e) {
                console.log(e);
              }
              this.nav.setRoot(TabsControllerPage);
            });
        }
      });
    });
  }
}
