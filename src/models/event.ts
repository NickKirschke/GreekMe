import {FirebaseListObservable} from "angularfire2/database/firebase_list_observable";
export interface Event {
    creator: any;
    creatorUid: any;
    name: any;
    date: any;
    location: any;
    info: any;
    attendingList: FirebaseListObservable<any[]>;
    
}