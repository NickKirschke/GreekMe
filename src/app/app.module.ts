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
import { ComposeBroadcastPage } from '../pages/compose-broadcast/compose-broadcast';
import { ComposeFeedPage } from '../pages/compose-feed/compose-feed';
import { EventDetailsPage } from '../pages/event-details/event-details';
import { CreateEventPage } from '../pages/create-event/create-event';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { ThreadPage } from '../pages/thread/thread';
import { ComposeThreadPage } from '../pages/compose-thread/compose-thread';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FirebaseServiceProvider } from '../providers/firebase-service/firebase-service';
import { HttpModule } from '@angular/http';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import { FIREBASE_CONST } from "./app.firebase.config";
import { AngularFireAuthModule } from "angularfire2/auth/auth.module";
import { IonicStorageModule } from "@ionic/storage";
import { UserServiceProvider } from "../providers/user-service/user-service";
import { MomentModule } from 'angular2-moment';
import { EventViewPage } from '../pages/event-view/event-view';
import { NgPipesModule } from 'ngx-pipes';
import { MessageThreadPage } from '../pages/message-thread/message-thread';
import { ComposeThreadMessagePage } from '../pages/compose-thread-message/compose-thread-message';
import { BroadcastRowComponent } from '../components/broadcast-row/broadcast-row';
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
    ComposeBroadcastPage,
    ComposeFeedPage,
    EventDetailsPage,
    CreateEventPage,
    EditProfilePage,
    ThreadPage,
    EventViewPage,
    ComposeThreadPage,
    MessageThreadPage,
    ComposeThreadMessagePage,
    BroadcastRowComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(FIREBASE_CONST),
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    MomentModule,
    NgPipesModule
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
    ComposeBroadcastPage,
    ComposeFeedPage,
    EventDetailsPage,
    CreateEventPage,
    EditProfilePage,
    ThreadPage,
    EventViewPage,
    ComposeThreadPage,
    MessageThreadPage,
    ComposeThreadMessagePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseServiceProvider,
    UserServiceProvider
  ]
})
export class AppModule {}
