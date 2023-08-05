export interface DataProfileType
{
    uuid: string;
    twitter_handle: string;
}

export interface DataProfileContextType
{
    dataProfiles: DataProfileType[];
    setDataProfiles: (dataProfiles: DataProfileType[]) => void;
}