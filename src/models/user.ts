import {AngularFireList} from "angularfire2/database";
export interface User {
  name: any;
  email: any;
  password: any;
  organization_ID: any;
  organization_school: any;
  avatar_url: any;
  uid: any;
  role: any;
  eventsAttending: AngularFireList<any[]>;
  likeList: AngularFireList<any>;

}
