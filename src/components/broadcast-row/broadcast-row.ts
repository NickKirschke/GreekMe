import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Broadcast } from '../../models/broadcast';

/**
 * Generated class for the BroadcastRowComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'broadcast-row',
  templateUrl: 'broadcast-row.html',
})
export class BroadcastRowComponent {
  @Input('broadcast') broadcast : Broadcast;
  @Output() likeEmitter = new EventEmitter();
  @Input('uid') uid: string;
  @Output() commentEmitter = new EventEmitter();
  @Input() showComments : boolean = true;
  @Input() showLikes : boolean = true;
  @Output() profileUidEmitter = new EventEmitter();

  constructor() {
    // console.log('Hello BroadcastRowComponent Component');
  }

  ngAfterViewInit() {
    // console.log(this.broadcast.key);
    if (this.broadcast.likeList) {
      // let res = this.broadcast.likeList;
      // console.log(res);
    }
  }

  goToProfile() {
    this.profileUidEmitter.emit(this.broadcast.uid);
  }

  doLike() {
    this.likeEmitter.emit(this.broadcast);
  }
  itemSelected() {
    this.commentEmitter.emit(this.broadcast);
  }
}
