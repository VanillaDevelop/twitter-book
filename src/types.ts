export interface DataProfileType
{
    uuid: string;
    twitter_handle: string;
    is_setup: boolean;
    profile_image_internal?: string;
    banner_internal?: string;
}

export interface DataProfileContextType
{
    dataProfiles: DataProfileType[];
    setDataProfiles: (profiles: DataProfileType[]) => void;
}

export enum MediaType {
    Photo = "photo",
    Video = "video",
    Gif = "animated_gif"
}

export interface TweetMediaType
{
    external_url: string;
    type: MediaType;
    internal_name?: string;
}

export interface ArchiveTweetType
{
    tweet: {
        created_at: string;
        id_str: string;
        entities: {
            urls: [
                {
                    url: string;
                    expanded_url: string;
                }
            ],
            user_mentions: [
                {
                    name: string,
                    screen_name: string
                    id_str: string;
                }
            ]
        },
        extended_entities?: {
            media: [
                {
                    media_url_https: string;
                    type: string;
                }
            ]
        },
        full_text: string,
        in_reply_to_status_id_str?: string,
        in_reply_to_user_id_str?: string,
        in_reply_to_screen_name?: string
    }
}

export enum TweetRelation
{
    None,
    Reply,
    Quote,
    Retweet,
}

export interface TweetRenderType
{
    id: string;
    height: number;
    rendered_item: JSX.Element;
}


export interface TweetItemType
{
    id: string;
    item: TweetType | null
}

export interface TweetType 
{
    text: string;
    created_at: Date;
    author_handle: string;
    parent_tweet_id?: string;
    direct_rt_author_handle?: string;
    qrt_tweet_source_id?: string;
    urls: string[];
    media: TweetMediaType[];
}

export interface AuthorData
{
    id: string;
    display_name: string;
    handle: string;
    profile_image?: TweetMediaType;
    banner?: TweetMediaType;
}

export interface PopUpType
{
    title: string;
    text: string;
    id: string;
}

export enum ModalFooterType
{
    None,
    Confirm
}