import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Broadcast } from '../../models/broadcast'

/**
 * Generated class for the BroadcastRowComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'broadcast-row',
  templateUrl: 'broadcast-row.html'
})
export class BroadcastRowComponent {
  @Input('broadcast') broadcast : Broadcast;
  @Output() likeEmitter = new EventEmitter();
  @Input('uid') uid: string;

  constructor() {
    console.log('Hello BroadcastRowComponent Component');
    
  }

  ngAfterViewInit() {
    console.log(this.broadcast.key);
    if(this.broadcast.likeList) {
      let res = this.broadcast.likeList;
      console.log(res);
    }
  }

  doLike() {
    this.likeEmitter.emit(this.broadcast);
  }
}
