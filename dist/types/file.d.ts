import { Canceler } from 'axios';
import { Subject, Observable } from 'rxjs';
export interface metadata {
    name: string;
    value: string | Blob;
    fileName?: string;
}
/**
 * FileUpload Options
 */
export interface FileUploadOptions {
    /**
     * Allowed types to upload. Format types MIME. If not set, all type allowed.
     */
    allowedTypes?: Array<string>;
    /**
     * Callback to build headers to send with the request
     */
    headers?: Function;
    /**
     * Max File Size
     * @default 20971520
     */
    maxSize?: number;
    /**
     * File name
     * @default 'file'
     */
    name?: string;
    /**
     * Destination url
     */
    url: string;
}
/**
 * Class upload file, to send a file to a server with an axios request
 * Documentation : Le live
 */
export declare class FileUpload {
    protected fileSize: number | null;
    protected timeUpload: number | null;
    protected progress: Subject<number>;
    protected complete: Subject<boolean>;
    protected success: Subject<any>;
    protected error: Subject<any>;
    protected options: FileUploadOptions;
    protected cancelRequest: Canceler;
    protected started: boolean;
    protected initialProgress: number;
    protected lastFormData: FormData;
    /**
     * @param {FileUploadOptions} options
     */
    constructor(options: FileUploadOptions);
    /**
     * @returns {number | null}
     */
    getFileSize(): number | null;
    /**
     * @returns {number | null}
     */
    getTimeUpload(): number | null;
    /**
     * Observable request progress
     * @returns {Observable<number>}
     */
    onProgress(): Observable<number>;
    /**
     * Observable error
     * @returns {Observable<any>}
     */
    onError(): Observable<any>;
    /**
     * Request completed
     * @returns {Observable<boolean>}
     */
    onComplete(): Observable<boolean>;
    /**
     * Request Succeeded
     * @returns {Observable<any>}
     */
    onSuccess(): Observable<any>;
    /**
     * Check if file is valid & call buildFormData()
     * @param {File} file
     * @param {Array<{ name: string, value: string | Blob, fileName?: string }>} data default empty array
     */
    upload(file: File, data?: Array<{
        name: string;
        value: string | Blob;
        fileName?: string;
    }>): void;
    /**
     * Retry to upload last FormData
     */
    reupload(): void;
    /**
     * Reset FileUpload
     */
    protected reset(): void;
    /**
     * Build FormData & call execRequest()
     * @param {File} file
     * @param {metadata} data default empty array
     */
    protected buildFormData(file: File, data?: Array<metadata>): void;
    /**
     * Determines if file type is valid
     * @param {File} file
     * @returns {boolean} true if file type valid, false otherwise
     */
    protected isFileTypeValid(file: File): boolean;
    /**
     * Determines if file size is valid
     * @param {File} file
     * @returns {boolean} true if file size valid, false otherwise
     */
    protected isFileSizeValid(file: File): boolean;
    /**
     * Determines if file is valid
     * @param {File} file
     * @returns {boolean} true if file is valid, false otherwise
     */
    protected isFileValid(file: File): boolean;
    /**
     * Prepare & send request to provided url
     * @param {FormData} formData
     */
    private execRequest;
}
