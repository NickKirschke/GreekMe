import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { User } from '../../models/user';
import app from 'firebase/app';
import 'firebase/storage';
import { Post } from '../../models/post';
import { Event } from '../../models/event';
import { UserLike } from '../../models/userLike';
import { Observable } from '@firebase/util';
import { GlobalsProvider } from '../globals/globals';

@Injectable()
export class FirebaseServiceProvider {
  user: Observable<any>;
  firebaseStorage = app.storage();
  firebaseDb = app.database();
  constructor(
    private afDB: AngularFireDatabase,
    private storage: Storage,
    private globalsProvider: GlobalsProvider,
  ) {}
  // Get organization's image
  getGreetingImage(organizationId: string) {
    return this.firebaseStorage
      .ref()
      .child(`${organizationId}/logo.png`)
      .getDownloadURL();
  }

  // Adds an event to the event list for the organization
  // Need to add return handling
  addToOrgEventList(event: Event, organizationId: string) {
    // console.log(broadcast);
    this.afDB.list(`/organization/${organizationId}/broadcast/`).push(event);
  }

  // Accesses the event information by key
  getEventInfo(key: string, organizationId: string) {
    return this.afDB.object<Event>(`/organization/${organizationId}/event/${key}`);
  }

  // Accesses the event information by key
  getEventInfo2(key: string, organizationId: string) {
    return this.afDB.object<Event>(`/organization/${organizationId}/event/${key}`);
  }

  // Accesses the event attendingList by key
  getEventAttendingList(key, organizationId) {
    return this.afDB.list(`/organization/${organizationId}/event/${key}/attendingList/`);
  }

  // Returns the event list for the organization
  getOrgEventList(organizationId: string) {
    return this.afDB.list(`/organization/${organizationId}/event/`);
  }

  // Adds an event to a user's list of events that they are 'going' to
  getUserEventList(uid: string) {
    return this.afDB.list(`/users/${uid}/eventsAttending/`);
  }

  // Returns the broadcast list for the greekme page
  getBroadcastList(organizationId: string) {
    return this.afDB.list(`/organization/${organizationId}/broadcast/`);
  }

  // Allows watching of a user's avatar to update when appropriate
  getUserAvatar(uid: string) {
    return this.afDB.object(`/users/${uid}/avatarUrl`);
  }

  addToBroadcastList(broadcast: Post, organizationId: string) {
    // console.log(broadcast);
    return this.afDB.list(`/organization/${organizationId}/broadcast/`).push(broadcast).key;
  }

  // Adds a comment to a broadcast commentList
  addCommentToBroadcast(broadcast: Post, organizationId: string, key: string) {
    // console.log(broadcast);
    return this.afDB
      .list(`/organization/${organizationId}/broadcast/${key}/commentList/`)
      .push(broadcast).key;
  }

  // Adds a comment to a message commentList
  addCommentToMessage(broadcast: Post, organizationId: string, key: string) {
    // console.log(broadcast);
    return this.afDB
      .list(`/organization/${organizationId}/message/${key}/commentList/`)
      .push(broadcast).key;
  }

  // Returns the feed list for the organization
  getFeedList(organizationId: string) {
    return this.afDB.list(`/organization/${organizationId}/message/`);
  }

  // Adds a feed to the feed list for the organization (Feed uses same structure as broadcast)
  addToFeedList(broadcast: Post, organizationId: string) {
    // console.log(broadcast);
    return this.afDB.list(`/organization/${organizationId}/message/`).push(broadcast).key;
  }

  // Returns the comments for the broadcast
  getCommentListBroadcast(organizationId: string, broadcastId: string) {
    return this.afDB.list(`/organization/${organizationId}/broadcast/${broadcastId}/commentList/`);
  }

  // Returns the comments for the message
  getCommentListMessage(organizationId: string, messageId: string) {
    return this.afDB.list(`/organization/${organizationId}/message/${messageId}/commentList/`);
  }

  // Return a user's Liked list
  getUserLikeList(uid: string) {
    return this.afDB.list<UserLike>(`/users/${uid}/likeList/`);
  }

  // Return a user's post list
  getUserPostList(uid: string) {
    return this.afDB.list<Post>(`users/${uid}/postList/`);
  }

  // Return a user's post list
  getUserEventsAttending(uid: string) {
    return this.afDB.list(`/users/${uid}/eventsAttending/`);
  }

  getUserDetailsProfilePage(uid: string) {
    return new Promise(resolve => {
      this.firebaseDb
        .ref(`/users/${uid}`)
        .once('value')
        .then(snapshot => {
          resolve(snapshot.val());
        });
    });
  }

  // 5.0
  getUserDetails(uid: string) {
    return new Promise(async resolve => {
      this.firebaseDb
        .ref(`/users/${uid}`)
        .once('value')
        .then(async snapshot => {
          // Store user details locally
          const user = snapshot.val();
          await this.storage.set('user', JSON.stringify(snapshot.val()));
          resolve(true);
        });
    });
  }

  // Add new user details to firebase storage
  addUserDetails(userDetails: User) {
    return new Promise(async resolve => {
      userDetails.bio =
        'A sample bio: Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
        'Sed placerat nulla sit amet tempor viverra.';
      userDetails.avatarUrl = this.globalsProvider.DEFAULT_IMAGE_PATH;
      this.afDB.object(`/users/${userDetails.uid}`).set(userDetails);
      await this.storage.set('user', JSON.stringify(userDetails));
      resolve(true);
    });
  }
}
