import { NgModule } from '@angular/core';
import { BroadcastRowComponent } from './broadcast-row/broadcast-row';
import { PopOverComponent } from './pop-over/pop-over';
@NgModule({
  declarations: [BroadcastRowComponent,
    PopOverComponent],
  imports: [],
  exports: [BroadcastRowComponent,
    PopOverComponent],
})
export class ComponentsModule {}
