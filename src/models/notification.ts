import { ContentType } from './contentType';

export interface Notification {
  name: string;
  text: string;
  contentType: ContentType;
}
