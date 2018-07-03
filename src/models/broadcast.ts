import { AngularFireList } from 'angularfire2/database';
import { UserLike } from './userLike';
export interface Broadcast {
  avatarUrl: any;
  text: any;
  name: any;
  date: any;
  uid: any;
  key: any;
  commentList: AngularFireList<any>;
  likeList: UserLike[];
  numOfComments: any;
  numOfLikes: any;
  liked: boolean;
  iconName: string;
}
