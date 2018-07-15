import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { User } from '../../models/user';
import { Camera, CameraOptions } from '@ionic-native/camera';

@Component({
  selector: 'page-editProfile',
  templateUrl: 'editProfile.html',
})
export class EditProfilePage {
  @ViewChild('bio') bio: ElementRef;
  user = {} as User;

  constructor(public navCtrl: NavController,
              private navParams: NavParams,
              private view: ViewController,
              private camera: Camera) {
  }

  ionViewWillEnter() {
    this.user = JSON.parse(this.navParams.get('user'));
  }

  ionViewDidEnter() {
    this.resize();
  }

  changePhoto() {
    console.log('click');
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };

    this.camera.getPicture(options).then(
    (imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.user.avatarUrl = 'data:image/jpeg;base64,' + imageData;
    },
    (err) => {
     // Handle error
    });
  }
  resize() {
    this.bio.nativeElement.style.height = 'auto';
    this.bio.nativeElement.style.height = this.bio.nativeElement.scrollHeight + 'px';
  }

  closeModal() {
    this.view.dismiss();
  }
}
