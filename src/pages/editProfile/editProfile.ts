import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ViewController, ActionSheetController,
  LoadingController } from 'ionic-angular';
import { User } from '../../models/user';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { storage } from 'firebase';
import * as firebase from 'firebase/app';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-editProfile',
  templateUrl: 'editProfile.html',
})
export class EditProfilePage {
  @ViewChild('bio') bio: ElementRef;
  user = {} as User;
  avatar = '' as string;
  constructor(public navCtrl: NavController,
              private navParams: NavParams,
              private view: ViewController,
              private camera: Camera,
              private storage: Storage,
              public actionSheetCtrl: ActionSheetController,
              public loadingCtrl: LoadingController) {
  }

  async ionViewWillEnter() {
    this.user = JSON.parse(this.navParams.data.user);
    this.avatar = this.navParams.data.avatar;
  }

  ionViewDidEnter() {
    this.resize();
  }

  async photoMenu() {
    const actionSheet = this.actionSheetCtrl.create({
      enableBackdropDismiss: true,
      buttons: [
        {
          text: 'Take a Photo',
          handler: () => {
            this.choosePhoto(1);
          },
        }, {
          text: 'Camera Roll',
          handler: () => {
            this.choosePhoto(0);
          },
        }, {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    actionSheet.present();
  }

  async choosePhoto(aSourceType: number) {
    const loader = this.loadingCtrl.create({
      content: 'Loading photo...',
    });
    try {
      const options: CameraOptions = {
        quality: 50,
        targetHeight: 1000,
        targetWidth: 1000,
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: aSourceType,
        encodingType: this.camera.EncodingType.JPEG,
        correctOrientation: true,
      };

      const result = await this.camera.getPicture(options);
      loader.present();
      const image = `data:image/jpeg;base64,${result}`;
      this.avatar = image;
      // this.user.avatarUrl = await uploadResult.ref.getDownloadURL();
      // this.avatar = await uploadResult.ref.getDownloadURL();
      loader.dismiss();
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
      const data = {
        user: JSON.stringify(this.user),
        avatar: this.avatar,
      };
      await firebase.database().ref(`users/${this.user.uid}/`).set(this.user);
      const pictures = storage().ref(`${this.user.organizationId}/profilePhotos/${this.user.uid}`);
      await pictures.putString(this.avatar, 'data_url');
      await this.storage.set('user', JSON.stringify(this.user));
      this.view.dismiss(data);
    } catch (error) {
      console.log('ERROR', error.code);
    }
  }

  closeModal() {
    this.view.dismiss();
  }
}
