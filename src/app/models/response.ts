export interface Response {
    responseId: string;
    /**The Uid of the user who posted this */
    postedByUid: string;
    /**When this was posted */
    postedDate: string;
    /**The contents of the initial post */
    body: string;
    postId?: string;
  }