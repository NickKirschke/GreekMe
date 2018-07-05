import { UserLike } from './userLike';
import { ContentType } from './contentType';
export interface Broadcast {
  avatarUrl: string;
  text: string;
  name: string;
  date: any;
  uid: string;
  key: string;
  commentList: Broadcast[];
  likeList: UserLike[];
  numOfComments: number;
  numOfLikes: number;
  liked: boolean;
  iconName: string;
  contentType: ContentType;
}
