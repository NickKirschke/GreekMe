import {AngularFireList } from "angularfire2/database";
export interface Broadcast {
    avatar_url: any;
    text: any;
    name: any;
    date: any;
    uid: any;
    key: any;
    commentList: AngularFireList<any>;
    likeList: string[];
    numOfComments: any;
    numOfLikes: any;
    liked: boolean;
    iconName: string;
}