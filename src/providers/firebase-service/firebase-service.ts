import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { AngularFireDatabase } from "angularfire2/database/database";
import { AngularFireAuth } from "angularfire2/auth/auth";
import { Storage } from "@ionic/storage";
import { User } from "../../models/user";
import { AngularFireObject } from "angularfire2/database";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { Broadcast } from "../../models/broadcast";
import { Event } from "../../models/event"
import { UserLike } from '../../models/userLike';
import { Observable } from '@firebase/util';
import { database } from 'firebase/app';
/*
  Generated class for the FirebaseServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class FirebaseServiceProvider {
  user: Observable<any>
  userData: AngularFireObject<User>
  firebaseStorage = firebase.storage();
  firebaseDb = firebase.database();
  constructor(private afDB: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private storage: Storage) {

  }
  // Get organization's image
  getGreetingImage(organization_ID) {
    return this.firebaseStorage.ref().child(organization_ID + '/logo.png').getDownloadURL();
    // .then(function (url) {
    //     console.log(url);
    //     resolve(url);
    //   }).catch(function (error) {
    //     // Handle any errors
    //     console.log(error);
    //     return 'https://firebasestorage.googleapis.com/v0/b/greekme-7475a.appspot.com/o/123456%2Ftest.jpeg?alt=media&token=20193ddb-5a82-4b6a-95d4-94c3ccd2c870';
    //   })
    // });
  }

  // Adds an event to the event list for the organization
  // Need to add return handling
  addToOrgEventList(event: Event, organization_ID: String) {
    // console.log(broadcast);
    this.afDB.list('/organization/' + organization_ID + '/broadcast/').push(event);
  }

  // Accesses the event information by key
  getEventInfo(key: String, organization_ID: String) {
    return this.afDB.object<Event>('/organization/' + organization_ID + '/event/' + key);
  }

  // Accesses the event information by key
  getEventInfo2(key: String, organization_ID: String) {
    return this.afDB.object<Event>('/organization/' + organization_ID + '/event/' + key);
  }

  // Accesses the event attendingList by key
  getEventAttendingList(key, organization_ID) {
    return this.afDB.list('/organization/' + organization_ID + '/event/' + key + '/attendingList/');
  }

  // Returns the event list for the organization
  getOrgEventList(organization_ID: String) {
    return this.afDB.list('/organization/' + organization_ID + '/event/');
  }

  // Adds an event to a user's list of events that they are "going" to
  getUserEventList(uid: String) {
    return this.afDB.list('/users/' + uid + '/eventsAttending/');
  }

  // Returns the broadcast list for the greekme page
  getBroadcastList(organization_ID: String) {
    return this.afDB.list('/organization/' + organization_ID + '/broadcast/');
  }

  addToBroadcastList(broadcast: Broadcast, organization_ID: String) {
    // console.log(broadcast);
    return this.afDB.list('/organization/' + organization_ID + '/broadcast/').push(broadcast).key;
  }

  //Adds a comment to a broadcast commentList
  addCommentToBroadcast(broadcast: Broadcast, organization_ID: String, key: String) {
    // console.log(broadcast);
    return this.afDB.list('/organization/' + organization_ID + '/broadcast/' + key + '/commentList/').push(broadcast).key;
  }

  //Adds a comment to a message commentList
  addCommentToMessage(broadcast: Broadcast, organization_ID: String, key: String) {
    // console.log(broadcast);
    return this.afDB.list('/organization/' + organization_ID + '/message/' + key + '/commentList/').push(broadcast).key;
  }

  // Returns the feed list for the organization 
  getFeedList(organization_ID: String) {
    return this.afDB.list('/organization/' + organization_ID + '/message/');
  }

  // Adds a feed to the feed list for the organization (Feed uses same structure as broadcast)
  addToFeedList(broadcast: Broadcast, organization_ID: String) {
    // console.log(broadcast);
    return this.afDB.list('/organization/' + organization_ID + '/message/').push(broadcast).key;
  }

  // Returns the comments for the broadcast
  getCommentListBroadcast(organization_ID: String, broadcast_ID: String) {
    return this.afDB.list('/organization/' + organization_ID + '/broadcast/' + broadcast_ID + '/commentList/');
  }

  // Returns the comments for the message
  getCommentListMessage(organization_ID: String, message_ID: String) {
    return this.afDB.list('/organization/' + organization_ID + '/message/' + message_ID + '/commentList/');
  }

  // Return a user's Liked list
  getUserLikeList(uid: string) {
    return this.afDB.list<UserLike>('users/' + uid + '/likeList/');
  }

  // Return a user's post list
  getUserPostList(uid: string) {
    return this.afDB.list<Broadcast>('users/' + uid + '/postList/');
  }

  // Return a user's post list
  getUserEventsAttending(uid: string) {
    return this.afDB.list('users/' + uid + '/eventsAttending/');
  }

  getUserDetailsProfilePage(uid: string) {
    return new Promise((resolve) => {
      this.firebaseDb.ref('/users/' + uid).once('value').then(snapshot => {
        resolve(snapshot.val());
      });
    });
  }


  //5.0
  getUserDetails(uid: string) {
    return new Promise((resolve) => {
      this.firebaseDb.ref('/users/' + uid).once('value').then(snapshot => {
        let user = JSON.stringify(snapshot.val());
        // Store user details locally
        this.storage.set("user", user).then(() => {
          resolve(true);
        });
      });
    });
  }

  // Add new user details to firebase storage
  addUserDetails(userDetails: User) {
    return new Promise((resolve) => {
        userDetails.bio = "A sample bio: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed placerat nulla sit amet tempor viverra. Cras egestas facilisis metus in consequat. Vivamus scelerisque eros non imperdiet scelerisque. Aliquam at ante ante. Phasellus commodo, mauris sit amet hendrerit molestie, massa ligula iaculis lorem, sed posuere risus nibh varius ligula. Mauris ut turpis blandit leo imperdiet egestas. Curabitur tincidunt neque non orci varius, sed egestas risus faucibus. ";
        userDetails.avatar_url = 'https://firebasestorage.googleapis.com/v0/b/greekme-7475a.appspot.com/o/GM_Default.png?alt=media&token=6bc30d40-17a2-40bb-9af7-edff78112780';
        // userDetails.avatar_url ="https://firebasestorage.googleapis.com/v0/b/greekme-7475a.appspot.com/o/123456%2Fn3KA2xjGAaNbr8xymrHAyc4StJM2.jpeg?alt=media&token=e74020a0-3323-4e83-a1f9-8ea53e91ab91";
        this.afDB.object('/users/' + userDetails.uid).set(userDetails);
        this.storage.set("user", JSON.stringify(userDetails)).then(() => resolve(true));
      });
  }
}

