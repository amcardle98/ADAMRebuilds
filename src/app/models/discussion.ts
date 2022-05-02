 export interface Discussion {

    /**The ID of the discussion in the database */
    id: string;
    /**The title of the discussion to display to the user */
    title: string;
    /**A short description to display to the user */
    description: string;

    /**Icon to use for this discussion in list view */
    iconClass?: string;
    
}