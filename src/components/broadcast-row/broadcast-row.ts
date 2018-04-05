import { Component } from '@angular/core';

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

  text: string;

  constructor() {
    console.log('Hello BroadcastRowComponent Component');
    this.text = 'Hello World';
  }

}
