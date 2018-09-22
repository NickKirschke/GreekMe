import { Component, Injectable } from '@angular/core';
import { Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { FcmProvider } from '../providers/fcm/fcm';
import { tap } from 'rxjs/operators';
@Component({
  templateUrl: 'app.html',
})
@Injectable()
export class MyApp {
  rootPage:any = LoginPage;

  constructor(private platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              private fcm: FcmProvider,
              private toastCtrl: ToastController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      if (this.platform.is('cordova')) {
        this.fcm.getToken();
        this.fcm.listenToNotifications().pipe(
        tap((msg) => {
          // show a toast
          const toast = this.toastCtrl.create({
            message: msg.body,
            duration: 3000,
            position: 'top',
            showCloseButton: true,
          });
          toast.present();
        }),
        )
        .subscribe();
      }
    });
  }
}
