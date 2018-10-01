import { NgModule } from '@angular/core';
import { PostRowComponent } from './post-row/post-row';
import { PopOverComponent } from './pop-over/pop-over';
import { NotificationRowComponent } from './notification-row/notification-row';

@NgModule({
  declarations: [PostRowComponent,
    PopOverComponent,
    NotificationRowComponent],
  imports: [],
  exports: [PostRowComponent,
    PopOverComponent,
    NotificationRowComponent],
})
export class ComponentsModule {}
