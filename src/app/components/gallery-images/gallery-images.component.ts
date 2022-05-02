import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { CarProject, GalleryData } from 'app/models/car-projects';
import { firstValueFrom, Observable } from 'rxjs';

@Component({
  selector: 'app-gallery-images',
  templateUrl: './gallery-images.component.html',
  styleUrls: ['./gallery-images.component.scss'],
})
export class GalleryImagesComponent implements OnInit, OnChanges {
  @Input() projectGallery: GalleryData[];

  foundImageUrls: string[] = [];

  constructor(private storage: AngularFireStorage) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectGallery']) {
      this.getGalleryImages(this.projectGallery);
    }
  }

  async getGalleryImages(gallery: CarProject['galleryImages']) {
    this.foundImageUrls = await Promise.all(
      gallery.map(async (obj) => {
        const imageURL = firstValueFrom(
          this.storage
            .ref(obj.storagePath)
            .getDownloadURL() as Observable<string>
        );

        return imageURL;
      })
    );
  }
}
