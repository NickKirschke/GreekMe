import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { User } from '../../models/user';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { storage } from 'firebase';
import * as firebase from 'firebase/app';
import { FirebaseServiceProvider } from '../../providers/firebaseService/firebaseService';
import { Storage } from '@ionic/storage';

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
              private camera: Camera,
              private storage: Storage) {
  }

  ionViewWillEnter() {
    this.user = JSON.parse(this.navParams.get('user'));
  }

  ionViewDidEnter() {
    this.resize();
  }

  async changePhoto() {
    try {
      console.log('click');
      const options: CameraOptions = {
        quality: 50,
        targetHeight: 136,
        targetWidth: 99,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true,
      };

      const result = await this.camera.getPicture(options);

      const image = `data:image/jpeg;base64,${result}`;

      const pictures = storage().ref(`${this.user.organizationId}/profilePhotos/${this.user.uid}`);
      const uploadResult = await pictures.putString(image, 'data_url');
      this.user.avatarUrl = await uploadResult.ref.getDownloadURL();
    } catch (error) {
      console.log('ERROR', error.code);
    }
  }
  resize() {
    this.bio.nativeElement.style.height = 'auto';
    this.bio.nativeElement.style.height = this.bio.nativeElement.scrollHeight + 'px';
  }

  async updateProfile() {
    try {
      const updates = [];
      const jsonUser = JSON.stringify(this.user);
      updates[`users/${this.user.uid}/`] = jsonUser;
      await firebase.database().ref().update(updates);
      await this.storage.set('user', jsonUser);
      this.view.dismiss(jsonUser);
    } catch (error) {
      console.log('ERROR', error.code);
    }
  }

  closeModal() {
    this.view.dismiss();
  }
}
