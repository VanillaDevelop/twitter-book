export interface DataProfileType
{
    uuid: string;
    twitter_handle: string;
    has_tweets: boolean,
    tweets: Tweet[],
    has_contexts: boolean
}

export interface DataProfileContextType
{
    dataProfiles: DataProfileType[];
    setDataProfiles: (dataProfiles: DataProfileType[]) => void;
}

export interface Tweet 
{
    id: string;
    text: string;
    created_at: string;
}