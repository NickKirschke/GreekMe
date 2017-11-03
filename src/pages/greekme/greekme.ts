import {Component, ViewChild, ElementRef} from '@angular/core';
import {NavController, App, NavParams} from 'ionic-angular';
import {AngularFireList} from "angularfire2/database";
import {FirebaseServiceProvider} from "../../providers/firebase-service/firebase-service";
import {AngularFireAuth} from "angularfire2/auth/auth";
import { LoginPage } from "../login/login";
import {User} from "../../models/user";
import {Broadcast} from "../../models/broadcast";
import {UserServiceProvider} from "../../providers/user-service/user-service";
import {AngularFireObject} from "angularfire2/database";
import {async} from "rxjs/scheduler/async";
import {Storage} from "@ionic/storage";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { ComposeBroadcastPage } from '../compose-broadcast/compose-broadcast';
import { ThreadPage } from '../thread/thread';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-greekme',
  templateUrl: 'greekme.html'
})
export class GreekMePage {
  @ViewChild('fixed')mapElement: ElementRef;
  fixedHeight: any;
  firebaseStorage = firebase.storage();
  userData: AngularFireObject<User>
  user = {} as User;
  validRole=false;
  // this tells the tabs component which Pages
  // should be each tab's root Page
  broadcastItems: Observable<any>;
  image: any;
  userLikedList: Observable<any>;
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
          this.broadcastItems = this.firebaseService.getBroadcastList(this.user.organization_ID).snapshotChanges().map(action => {
            return action.map(c => ({
              key: c.payload.key, ...c.payload.val()
            }));
          });
          this.userLikedList = this.firebaseService.getUserLikedList(this.user.uid).snapshotChanges().map(action => {
            return action.map(c => ({
              key: c.payload.key, ...c.payload.val()
            }));
          });;
          if (this.user.role == 'President' || this.user.role == ('Vice President') || this.user.role == ('Chair Member')){
            this.validRole = true;
          }
          const imageGrab = this.firebaseService.getGreetingImage(this.user.organization_ID);
          imageGrab.then((result) => {
            this.image = result;
          },(error) => {
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

  doLike(item) {
    var updates = {};
    var userLikeObj = {
      name: this.user.name
    }
    var broadcastLikeObj = {
      name: item.text
    }
    var currentLikes;
    var numOfLikesRef = firebase.database().ref('/organization/'+this.user.organization_ID+'/broadcast/'+item.$key+'/numOfLikes');
    numOfLikesRef.on('value', function(snapshot) {
      currentLikes = snapshot.val();
    });
    updates['/organization/'+this.user.organization_ID+'/broadcast/'+item.$key+'/likeList/'+this.user.uid] =  userLikeObj;  
    updates['/users/'+this.user.uid+'/likeList/'+item.$key] = broadcastLikeObj;
    updates['/organization/'+this.user.organization_ID+'/broadcast/'+item.$key+'/numOfLikes/'] = currentLikes + 1;
    firebase.database().ref().update(updates).then(function() {
    console.log("Like added ");
    //console.log(num)
    }).catch( function(error) {
       console.log(error);
    });
  }

  doUnlike(item) {
    var updates = {};
    var currentLikes;
    var numOfLikesRef = firebase.database().ref('/organization/'+this.user.organization_ID+'/broadcast/'+item.$key+'/numOfLikes');
    numOfLikesRef.on('value', function(snapshot) {
      currentLikes = snapshot.val();
    });
    updates['/organization/'+this.user.organization_ID+'/broadcast/'+item.$key+'/likeList/'+this.user.uid] =  null;  
    updates['/users/'+this.user.uid+'/likeList/'+item.$key] = null;
    updates['/organization/'+this.user.organization_ID+'/broadcast/'+item.$key+'/numOfLikes/'] = currentLikes - 1;
    firebase.database().ref().update(updates).then(function() {
    console.log("Like removed");
    }).catch( function(error) {
       console.log(error);
    });
  }

  // Make a attirbute 

  isLiked(key: String) {
    // var liked = false;
    // this.userLikedList.forEach(like =>{
    //   if(like.$key = key) {
    //     liked = true;
    //     // console.log("user liked this: " + key);
    //     return true;
    //   }
    // return false;})
    // return liked;
  }

  itemSelected(item) {
    console.log(item);
    // console.log(item);
    this.navCtrl.push(ThreadPage, {
      avatar_url: item.avatar_url,
      text: item.text,
      name: item.name,
      date: item.date,
      uid: item.uid,
      key: item.key,
      orgId: this.user.organization_ID
    });                                                                                                                                          
  }
}


