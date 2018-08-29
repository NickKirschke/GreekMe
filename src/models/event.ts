import { AngularFireList } from 'angularfire2/database';
export interface Event {
  key: string;
  creator: string;
  creatorUid: string;
  name: string;
  date: any;
  location: string;
  info: string;
  attendingList: AngularFireList<any[]>;
  repeat: Repeat;
}
export enum Repeat {
    Never = 'Never',
    Daily = 'Daily',
    Weekly = 'Weekly',
    Biweekly = 'Biweekly',
    Monthly = 'Monthly',
    Yearly = 'Yearly',
}
