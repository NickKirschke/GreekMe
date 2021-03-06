import { NgModule, ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { GreekMePage } from '../pages/greekme/greekme';
import { FeedPage } from '../pages/feed/feed';
import { EventsPage } from '../pages/events/events';
import { TabsControllerPage } from '../pages/tabs-controller/tabs-controller';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { ProfilePage } from '../pages/profile/profile';
import { ComposePostPage } from '../pages/composePost/composePost';
import { CreateEventPage } from '../pages/createEvent/createEvent';
import { EditProfilePage } from '../pages/editProfile/editProfile';
import { ThreadPage } from '../pages/thread/thread';
import { ComposeThreadPage } from '../pages/composeThread/composeThread';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseServiceProvider } from '../providers/firebaseService/firebaseService';
import { HttpModule } from '@angular/http';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { FIREBASE_CONST } from './app.firebase.config';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { IonicStorageModule } from '@ionic/storage';
import { UserServiceProvider } from '../providers/userService/userService';
import { MomentModule } from 'angular2-moment';
import { EventViewPage } from '../pages/eventView/eventView';
import { NgPipesModule } from 'ngx-pipes';
import { PostRowComponent } from '../components/post-row/post-row';
import { PopOverComponent } from '../components/pop-over/pop-over';
import { PipesModule } from '../pipes/pipes.module';
import { Camera } from '@ionic-native/camera';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { FcmProvider } from '../providers/fcm/fcm';
import { Firebase } from '@ionic-native/firebase';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { SettingsPage } from '../pages/settings/settings';
import { NotificationsPage } from '../pages/notifications/notifications';
import { NotificationRowComponent } from '../components/notification-row/notification-row';
import { GlobalsProvider } from '../providers/globals/globals';
@NgModule({
  declarations: [
    MyApp,
    GreekMePage,
    FeedPage,
    EventsPage,
    TabsControllerPage,
    LoginPage,
    SignupPage,
    ProfilePage,
    ComposePostPage,
    CreateEventPage,
    EditProfilePage,
    ThreadPage,
    EventViewPage,
    ComposeThreadPage,
    PostRowComponent,
    PopOverComponent,
    SettingsPage,
    NotificationsPage,
    NotificationRowComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(FIREBASE_CONST),
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    MomentModule,
    NgPipesModule,
    PipesModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    GreekMePage,
    FeedPage,
    EventsPage,
    TabsControllerPage,
    LoginPage,
    SignupPage,
    ProfilePage,
    ComposePostPage,
    CreateEventPage,
    EditProfilePage,
    ThreadPage,
    EventViewPage,
    ComposeThreadPage,
    PostRowComponent,
    PopOverComponent,
    SettingsPage,
    NotificationsPage,
    NotificationRowComponent,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    PhotoLibrary,
    Firebase,
    FcmProvider,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    FirebaseServiceProvider,
    UserServiceProvider,
    GlobalsProvider,
  ],
})
export class AppModule {}
