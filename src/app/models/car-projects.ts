export interface CarProject {
    ownerName: string;
    description: string;
    updates: any[];
    completed: any[];
    galleryImages: Array<{
        imageUrl: string;
        postId: string;
    }>
}