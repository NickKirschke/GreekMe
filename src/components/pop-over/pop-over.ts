import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

/**
 * Generated class for the PopOverComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'pop-over',
  templateUrl: 'pop-over.html'
})
export class PopOverComponent {
  items: any;
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.items = this.navParams.get("items");
  }

  itemClick(item) {
    this.viewCtrl.dismiss(item);
  }
}
