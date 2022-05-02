import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { CarProject } from 'app/models/car-projects';
import { firstValueFrom, Observable} from 'rxjs';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-gallery-images',
  templateUrl: './gallery-images.component.html',
  styleUrls: ['./gallery-images.component.scss']
})
export class GalleryImagesComponent implements OnInit, OnChanges {

  @Input() projectGallery;

  foundImageUrls: string[] = [];

  constructor(private storage: AngularFireStorage) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
      
    if (changes['projectGallery']) {
      this.getGalleryImages(this.projectGallery).then(() => {
        console.log(this.foundImageUrls);
      });
    }
  }

  async getGalleryImages(gallery: CarProject['galleryImages']) {

    this.foundImageUrls = await Promise.all(
      gallery.map(async (obj) => {
        const imageURL = firstValueFrom(this.storage.ref(obj.storagePath).getDownloadURL() as Observable<string | unknown>);
  
        return (await imageURL) as string;
      })
    );
  }

}
