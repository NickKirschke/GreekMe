import { AngularFireList } from 'angularfire2/database';
export interface Event {
  creator: string;
  creatorUid: string;
  name: string;
  date: any;
  location: string;
  info: string;
  attendingList: AngularFireList<any[]>;
  key: string;
}
