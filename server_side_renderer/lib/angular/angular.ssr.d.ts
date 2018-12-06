export declare const generateHTML: (params: GenerateHtmlParams) => Promise<any>;
export declare type GenerateHtmlParams = {
    bucketName: string;
    url: string;
    configuration?: Configuration | any;
};
export declare type Configuration = {
    isCached: boolean;
    app: string;
    currentVersion: string;
    previousVersion: string;
    versionHistory: string[];
};
