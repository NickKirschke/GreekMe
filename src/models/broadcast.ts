import {FirebaseListObservable} from "angularfire2/database/firebase_list_observable";
export interface Broadcast {
    avatar_url: any;
    text: any;
    name: any;
    date: any;
    uid: any;
    key: any;
    commentList: FirebaseListObservable<any>;
    likeList: FirebaseListObservable<any>;
    numOfComments: any;
    numOfLikes: any;
}