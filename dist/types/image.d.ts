import { FileUpload, FileUploadOptions } from "./file";
export interface Window {
    URL?: any;
    webkitURL?: any;
}
/**
 * ImageUpload options
 * @extends FileUploadOptions
 */
export interface ImageUploadOptions extends FileUploadOptions {
    /** Max width of the image. If to big, image is resized */
    maxWidth?: number;
    /** Max height of the image. If to big, image is resized */
    maxHeight?: number;
    /** Min width of the image. If to small, throw an error */
    minWidth?: number;
    /** Min height of the image. If to small, throw an error */
    minHeight?: number;
    /**
     * If true, the max/min Width & Height are interchangeables for validation & resize.
     * @default true
     */
    orientationAllowed?: boolean;
    /**
     * Image AllowedTypes Format types MIME
     * @default ['image/jpeg', 'image/png']
     */
    allowedTypes?: Array<string>;
    /**
     * Image AllowedTypes Format types MIME
     * @default 'image/jpeg' | 'image/webp'
     */
    outputType?: "image/jpeg" | "image/webp";
    /**
     * Compression quality of the jpeg conversion
     * @default 0.75
     */
    quality?: number;
    /**
     * Resize strategy when the picture is too big (keep the ratio)
     * False => Biggest pictures possible, max resolution but can crop a huge part of the picture
     * True => Keep the most of the picture, min crop but can drop the quality of the picture
     * @default true
     */
    lessCrop?: boolean;
}
/**
 * Class upload image, to send an image to a server with an axios request
 * @extends FileUpload
 * Documentation : Le live
 */
export declare class ImageUpload extends FileUpload {
    imageOptions: ImageUploadOptions;
    window: Window;
    /**
     * @param {ImageUploadOptions} options
     */
    constructor(options: ImageUploadOptions);
    /**
     * Upload image from a file
     * @param {File} file
     * @param {Array<{ name: string, value: string | Blob, fileName?: string }>} data default empty array
     */
    uploadFile(file: File, data?: Array<{
        name: string;
        value: string | Blob;
        fileName?: string;
    }>): void;
    /**
     * Upload image from a blob
     * @param {Blob} blob
     * @param {string} name
     * @param {Array<{ name: string, value: string | Blob, fileName?: string }>} data default empty array
     */
    uploadBlob(blob: Blob, name: string, data?: Array<{
        name: string;
        value: string | Blob;
        fileName?: string;
    }>): void;
    /**
     * Determines if webp is supported by the browser
     * @returns a promise resolving to a boolean to know if webp is supported
     */
    static isWebpSupported(): Promise<Boolean>;
    /**
     * Determines if webp convertion with canvas is supported by the browser
     * @returns a boolean to know if webp conversion is supported
     */
    static isWebpConvertionSupported(): Boolean;
    /**
     * Determines if image min size is valid
     * Emit error if setError
     * @param {number} width
     * @param {number} height
     * @param {boolean} setError default true
     * @returns true if image min size valid, false otherwise
     */
    protected isImageMinSizeValid(width: number, height: number, setError?: boolean): boolean;
    /**
     * Determines if file type is valid
     * @param {File} file
     * @returns {boolean} true if file type valid, false otherwise
     */
    protected isFileTypeValid(file: File): boolean;
    /**
     * If orientationAllowed, handle big side/small side instead of width/height
     *
     * @param {number} width
     * @param {number} height
     */
    private handleOrientationAllowed;
    /**
     * Build FormData et call sendFiles
     * Gère les erreurs
     * @param {File} file
     * @param {Array<{ name: string, value: string | Blob, fileName?: string }>} data default empty array
     */
    private resizeAndConvert;
}
