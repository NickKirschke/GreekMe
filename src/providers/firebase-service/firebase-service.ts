import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AngularFireDatabase } from "angularfire2/database/database";
import {AngularFireAuth} from "angularfire2/auth/auth";
import {Storage} from "@ionic/storage";
import {User} from "../../models/user";
import {FirebaseObjectObservable} from "angularfire2/database/firebase_object_observable";
import * as firebase from 'firebase/app';
import 'firebase/storage';
import {FirebaseListObservable} from "angularfire2/database/firebase_list_observable";
import { Broadcast } from "../../models/broadcast";
import { Event } from "../../models/event"
/*
  Generated class for the FirebaseServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class FirebaseServiceProvider {
  user: FirebaseObjectObservable<any[]>
  userData: FirebaseObjectObservable<User>
  firebaseStorage = firebase.storage();
  constructor(public afDB: AngularFireDatabase,
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
    this.afDB.list('/organization/'+organization_ID+'/broadcast/').push(event);
  }
  
  // Accesses the event information by key
  getEventInfo(key: String,organization_ID: String) {
    const temp = this.afDB.object('/organization/'+organization_ID+'/event/'+key);
    return temp;
  }

// Accesses the event attendingList by key
  getEventAttendingList(key: String,organization_ID: String) {
    return this.afDB.list('/organization/'+organization_ID+'/event/'+key+'/attendingList/').map(array=> array) as FirebaseListObservable<any[]>;
  }

  // Returns the event list for the organization
  getOrgEventList(organization_ID: String) {
    return this.afDB.list('/organization/'+organization_ID+'/event/').map(array => array) as FirebaseListObservable<Event>;
  }

  // Adds an event to a user's list of events that they are "going" to
  getUserEventList(uid: String) {
    return this.afDB.list('/users/'+uid+'/eventAttendingList/').map(array=> array) as FirebaseListObservable<any[]>;
  }

  // Returns the broadcast list for the greekme page
  getBroadcastList(organization_ID: String) {
    return this.afDB.list('/organization/'+organization_ID+'/broadcast/').map(array=> array) as FirebaseListObservable<Broadcast>;
  }

  addToBroadcastList(broadcast: Broadcast, organization_ID: String) {
    // console.log(broadcast);
    this.afDB.list('/organization/'+organization_ID+'/broadcast/').push(broadcast);
  }

  //Adds a comment to a broadcast commentList
  addCommentToBroadcast(broadcast: Broadcast, organization_ID: String, key: String) {
    // console.log(broadcast);
    this.afDB.list('/organization/'+organization_ID+'/broadcast/'+key+'/commentList/').push(broadcast);
  }

  // Returns the feed list for the organization 
  getFeedList(organization_ID: String) {
    return this.afDB.list('/organization/'+organization_ID+'/message/').map(array=> array) as FirebaseListObservable<Broadcast>;
  }

  // Adds a feed to the feed list for the organization (Feed uses same structure as broadcast)
  addToFeedList(broadcast: Broadcast, organization_ID: String) {
    // console.log(broadcast);
    this.afDB.list('/organization/'+organization_ID+'/message/').push(broadcast);
  }

  // Returns the comments for the broadcast
  getCommentListBroadcast(organization_ID: String, broadcast_ID: String) {
    return this.afDB.list('/organization/'+organization_ID+'/broadcast/'+broadcast_ID+'/thread').map(array=> array) as FirebaseListObservable<Broadcast>;
  }

  // Return a user's Liked list
  getUserLikedList(uid: String) {
    return this.afDB.list('users/'+uid+'/likedList').map(array => array) as FirebaseListObservable<any>;
  }

  // Retrieves and stores the user data locally
  getUserDetails(uid) {
    this.user = this.afDB.object('/users/'+uid,{preserveSnapshot: true});
    if (this.user){
      // Retrieves user details from the DB and stores locally
      this.user.subscribe(snapshots => {
          snapshots.forEach(snapshot => {
            this.storage.set(snapshot.key, snapshot.val());
          });
        })
    } else {
      console.log("User is undefined");
    }
  }

  testGetUserData(uid: String) {
    return this.afDB.object('users/'+ uid);
  }

  // Add new user details to firebase storage
  addUserDetails(userDetails: User) {
    this.afAuth.authState.take(1).subscribe(auth => {
      // Set the uid and the avatar for the new user
      userDetails.uid = auth.uid;
      userDetails.avatar_url ='https://firebasestorage.googleapis.com/v0/b/greekme-7475a.appspot.com/o/GM_Default.png?alt=media&token=6bc30d40-17a2-40bb-9af7-edff78112780';
      this.afDB.object('/users/'+auth.uid).set(userDetails);
      // Store the variables locally
      this.storage.set("name",userDetails.name);
      this.storage.set("email",userDetails.email);
      this.storage.set("organization_school",userDetails.organization_school);
      this.storage.set("organization_ID",userDetails.organization_ID);
      this.storage.set("avatar_url", userDetails.avatar_url);
      this.storage.set("uid",auth.uid);
      this.storage.set("role",userDetails.role);
    });
  }
}

