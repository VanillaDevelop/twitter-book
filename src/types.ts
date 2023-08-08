export interface DataProfileType
{
    uuid: string;
    twitter_handle: string;
    has_tweets: boolean,
    tweets: TweetType[],
    has_contexts: boolean
}

export interface DataProfileContextType
{
    dataProfiles: DataProfileType[];
    setDataProfiles: (profiles: DataProfileType[]) => void;
}

export interface TweetType 
{
    id: string;
    text: string;
    created_at: string;
}

export interface PopUpType
{
    title: string;
    text: string;
    id: string;
}