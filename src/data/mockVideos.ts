export interface VideoItem {
    id: string;
    videoUrl: string;
    authorName: string;
    description: string;
    likesCount: number;
}

export const mockVideo: VideoItem[] = [
    { id: "1", videoUrl:"https://www.w3schools.com/html/mov_bbb.mp4", authorName: "@bunny", description: "Em tho", likesCount: 1200},
    { id: "2", videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",authorName: "@Cv", description: "dorothy",likesCount:3400},
    { id: "3", videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",authorName: "@frozen", description: "Elsa", likesCount: 4000},
]