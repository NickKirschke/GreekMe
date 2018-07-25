import { NgModule } from '@angular/core';
import { PostRowComponent } from './post-row/post-row';
import { PopOverComponent } from './pop-over/pop-over';

@NgModule({
  declarations: [PostRowComponent,
    PopOverComponent],
  imports: [],
  exports: [PostRowComponent,
    PopOverComponent],
})
export class ComponentsModule {}
