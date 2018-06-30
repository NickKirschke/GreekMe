import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GreekMePage } from '../greekme/greekme';
import { FeedPage } from '../feed/feed';
import { EventsPage } from '../events/events';
import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-tabs-controller',
  templateUrl: 'tabs-controller.html',
})
export class TabsControllerPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = GreekMePage;
  tab2Root: any = FeedPage;
  tab3Root: any = EventsPage;
  tab4Root: any = ProfilePage;
  constructor(public navCtrl: NavController) {
  }

}
