import {Component, ViewChild, ElementRef} from '@angular/core';
import {NavController, App, NavParams} from 'ionic-angular';
import {FirebaseListObservable} from "angularfire2/database/firebase_list_observable";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import {User} from "../../models/user";
import {Broadcast} from "../../models/broadcast";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {FirebaseObjectObservable} from "angularfire2/database/firebase_object_observable";
import {async} from "rxjs/scheduler/async";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeBroadcastPage } from '../compose-broadcast/compose-broadcast';
import { ThreadPage } from '../thread/thread';

@Component({
  selector: 'page-greekme',
  templateUrl: 'greekme.html'
})
export class GreekMePage {
  @ViewChild('fixed')mapElement: ElementRef;
  fixedHeight: any;
  firebaseStorage = firebase.storage();
  userData: FirebaseObjectObservable<User>
  user = {} as User;
  validRole=false;
  // this tells the tabs component which Pages
  // should be each tab's root Page
  broadcastItems: FirebaseListObservable<Broadcast>;
  image: any;
  constructor(
    private afAuth: AngularFireAuth,
    public navCtrl: NavController,
    public firebaseService: FirebaseServiceProvider,
    private app: App,
    private userService: UserServiceProvider,
    private storage: Storage) {
    this.afAuth.authState.subscribe(data=> {
      if(data && data.email && data.uid) {
         const userGrab =  this.userService.currentUserInfo();
         userGrab.then((result) =>{
          this.user = result as User;           
          this.broadcastItems = this.firebaseService.getBroadcastList(this.user.organization_ID);
          if (this.user.role == 'President' || this.user.role == ('Vice President') || this.user.role == ('Chair Member'))
          {
            this.validRole = true;
          }
          const imageGrab = this.firebaseService.getGreetingImage(this.user.organization_ID);
          imageGrab.then((result) =>
          {
            this.image = result;
          },(error) => 
          {
            this.image ='https://firebasestorage.googleapis.com/v0/b/greekme-7475a.appspot.com/o/GM_Default.png?alt=media&token=6bc30d40-17a2-40bb-9af7-edff78112780';
          });
        });        
      } else {
        this.app.getRootNavs()[0].setRoot(LoginPage);
      }
    });
  }
  logout() {
    this.afAuth.auth.signOut();
  }
  
  goToComposeBroadcast() {
    this.navCtrl.push(ComposeBroadcastPage);
  }

  ionViewDidEnter() {
    this.fixedHeight =this.mapElement.nativeElement.offsetHeight;
    
  }

  calculateCommentLength(orgId: String, broadcastId: String) {
    this.firebaseService.getCommentListBroadcast(orgId, broadcastId);
  }

  itemSelected(key: String, item: Broadcast) {
    item.key = key;
    // console.log(item);
    this.navCtrl.push(ThreadPage, {
      avatar_url: item.avatar_url,
      text: item.text,
      name: item.name,
      date: item.date,
      uid: item.uid,
      key: item.key
    });
  }
}


