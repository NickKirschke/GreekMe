import { AngularFireList } from 'angularfire2/database';
import { UserLike } from './userLike';
export interface User {
  name: string;
  email: string;
  organizationId: string;
  organizationSchool?: string;
  avatarUrl?: string;
  uid?: string;
  role: string;
  eventsAttending?: AngularFireList<any[]>;
  likeList?: UserLike[];
  bio?: any;
  broadcastNotifications: boolean;
  feedNotifications: boolean;
}
