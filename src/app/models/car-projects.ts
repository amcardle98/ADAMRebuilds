export interface CarProject {
  title: string;
  ownerName: string;
  description: string;
  updates: any[];
  completed: any[];
  galleryImages: GalleryData[];
}

export interface GalleryData {
  storagePath: string;
  postId: string;
  /**Firebase turns this into ISO string?? */
  dateUploaded?: string;
  caption?: string;
}
