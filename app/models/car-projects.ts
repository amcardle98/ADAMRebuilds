export interface CarProject {
  title: string;
  ownerName: string;
  description: string;
  updates: any[];
  completed: any[];
}

export interface GalleryComment {
  userUid: string;
  timePosted: string;
  content: string;
}

export interface GalleryData {
  id: string;
  projectId: string;
  storagePath: string;
  /**Firebase turns this into ISO string?? */
  dateUploaded: string;
  caption?: string;
  comments?: GalleryComment[];
}
