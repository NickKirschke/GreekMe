import { ContentType } from './contentType';
import { UserLike } from './userLike';

export interface Post {
  avatarUrl: string;
  text: string;
  name: string;
  date: any;
  uid?: string;
  key: string;
  commentList?: Post[];
  likeList?: object;
  liked?: boolean;
  iconName?: string;
  contentType: ContentType;
}
