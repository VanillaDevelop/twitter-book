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
    original_author_handle: string;
    original_author_name: string;
    original_tweet: TweetType;
}

export interface RetweetData
{
    original_author_handle: string;
    original_author_name: string;
}

export interface TweetType 
{
    id: string;
    text: string;
    created_at: Date;
    parent_tweet_id?: string;
    direct_rt_data?: RetweetData;
    qrt_data?: RetweetData;
    media?: TweetMediaType[];
}

export interface PopUpType
{
    title: string;
    text: string;
    id: string;
}