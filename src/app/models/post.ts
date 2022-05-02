export interface Post {
  /**The Uid of the user who posted this */
  postedByUid: string;
  /**When this was posted */
  postedDate: string;
  /**The subject/title of the post */
  title: string;
  /**The contents of the initial post */
  body: string;
}
