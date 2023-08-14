export interface DataProfileType
{
    uuid: string;
    twitter_handle: string;
    is_setup: boolean;
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
    external_url: string;
    type: MediaType
}

export interface QRTData
{
    original_author_handle: string;
    original_tweet_id: string;
}

export interface URLResolve
{
    shortened_url: string;
    resolved_url: string;
}

export interface TweetType 
{
    id: string;
    text: string;
    created_at: Date;
    parent_tweet_id?: string;
    direct_rt_author_id?: string;
    qrt_tweet_source_id?: string;
    media?: TweetMediaType[];
    urls?: URLResolve[];
}

export interface AuthorData
{
    id: string;
    display_name: string;
    handle: string;
}

export interface PopUpType
{
    title: string;
    text: string;
    id: string;
}