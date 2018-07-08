import { UserLike } from './userLike';
import { ContentType } from './contentType';
export interface Post {
  avatarUrl: string;
  text: string;
  name: string;
  date: any;
  uid: string;
  key: string;
  commentList: Post[];
  likeList: any;
  numOfComments: number;
  numOfLikes: number;
  liked: boolean;
  iconName: string;
  contentType: ContentType;
}
