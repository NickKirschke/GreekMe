import { Component, Injectable, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { FcmProvider } from '../providers/fcm/fcm';
import { tap } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseServiceProvider } from '../providers/firebaseService/firebaseService';
import { TabsControllerPage } from '../pages/tabs-controller/tabs-controller';
import { UserServiceProvider } from '../providers/userService/userService';
import { Post } from '../models/post';
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
              firebaseService: FirebaseServiceProvider,
              userService: UserServiceProvider) {
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
                  tap((notification) => {
                    console.log(notification);
                    const match = /(?<=from ).+/.exec(notification.title);
                    console.log(match);
                    const aNotification = {
                      name: match[0],
                      key: notification.key,
                      contentType: notification.contentType,
                      date: notification.date,
                      text: notification.body,
                      avatarUrl: notification.avatarUrl,
                      uid: notification.uid,
                    } as Post;
                    userService.notifications.set(notification.key, aNotification);
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
