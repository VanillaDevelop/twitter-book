export interface DataProfileType
{
    uuid: string;
    twitter_handle: string;
    has_tweets: boolean,
    has_contexts: boolean
}

export interface DataProfileContextType
{
    dataProfiles: DataProfileType[];
    setDataProfiles: (profiles: DataProfileType[]) => void;
}

export enum MediaType {
    Photo = "PHOTO",
    Video = "VIDEO",
    Gif = "GIF"
}

export interface TweetMediaType
{
    internal_url: string;
    type: MediaType
}

export interface ReplyElement
{
    original_author_id: string;
    original_author_display_name: string;
    original_tweet_text: string;
    original_tweet_created_at: string;
    reply_media?: TweetMediaType[];
}

export interface TweetType 
{
    id: string;
    text: string;
    created_at: Date;
    context_collected: boolean;
    reply_chain?: ReplyElement[];
    direct_rt_data?: ReplyElement;
    qrt_data?: ReplyElement;
    media?: TweetMediaType[];
}

export interface PopUpType
{
    title: string;
    text: string;
    id: string;
}