import { AngularFireList } from 'angularfire2/database';
export interface User {
  name: any;
  email: any;
  password: any;
  organizationId: any;
  organizationSchool?: any;
  avatarUrl?: any;
  uid?: any;
  role: any;
  eventsAttending?: AngularFireList<any[]>;
  likeList?: AngularFireList<any>;
  bio?: any;
}
