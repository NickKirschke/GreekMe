import {AngularFireList} from "angularfire2/database";
export interface Event {
    creator: any;
    creatorUid: any;
    name: any;
    date: any;
    location: any;
    info: any;
    attendingList: AngularFireList<any[]>;
}