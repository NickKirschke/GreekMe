import {FirebaseListObservable} from "angularfire2/database/firebase_list_observable";
export interface User {
  name: any;
  email: any;
  password: any;
  organization_ID: any;
  organization_school: any;
  avatar_url: any;
  uid: any;
  role: any;
  eventsAttending: FirebaseListObservable<any[]>;

}
