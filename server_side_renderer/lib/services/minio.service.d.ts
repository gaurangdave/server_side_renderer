export declare const getFile: (params: GetFileParams) => any;
export declare const getConfigFile: (bucketName: string) => Promise<any>;
export declare const putContent: (params: PutContentParams) => any;
export declare type GetFileParams = {
    bucketName: string;
    fileName: string;
    dirName?: string;
};
export declare type PutContentParams = {
    bucketName: string;
    fileName: string;
    dirName?: string;
    data: string;
};
