import axios, { Canceler, AxiosRequestConfig } from 'axios';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface metadata { 
  name: string, 
  value: string | Blob, 
  fileName?: string 
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
export class FileUpload {
  protected fileSize: number | null = null;
  protected timeUpload: number | null = null;
  protected progress = new Subject<number>();
  protected complete = new Subject<boolean>();
  protected success = new Subject<any>();
  protected error = new Subject<any>();
  protected options: FileUploadOptions;
  protected cancelRequest!: Canceler;
  protected started: boolean = false;
  protected initialProgress: number = 0;
  protected lastFormData!: FormData;

  /**
   * @param {FileUploadOptions} options
   */
  constructor(options: FileUploadOptions) {
    const {
      maxSize = 20971520,
      name = 'file',
    } = options;

    this.options = { maxSize, name, ...options };
  }

  /**
   * @returns {number | null}
   */
  public getFileSize(): number | null {
    return this.fileSize;
  }
  /**
   * @returns {number | null}
   */
  public getTimeUpload(): number | null {
    return this.timeUpload;
  }
  /**
   * Observable request progress
   * @returns {Observable<number>}
   */
  public onProgress(): Observable<number> {
    return this.progress.asObservable().pipe(filter(value => value !== null));
  }

  /**
   * Observable error
   * @returns {Observable<any>}
   */
  public onError(): Observable<any> {
    return this.error.asObservable().pipe(filter(value => value !== null));
  }

  /**
   * Request completed
   * @returns {Observable<boolean>}
   */
  public onComplete(): Observable<boolean> {
    return this.complete.asObservable().pipe(filter(value => value !== null));
  }

  /**
   * Request Succeeded
   * @returns {Observable<any>}
   */
  public onSuccess(): Observable<any> {
    return this.success.asObservable().pipe(filter(value => value !== null));
  }

  /**
   * Check if file is valid & call buildFormData()
   * @param {File} file
   * @param {Array<{ name: string, value: string | Blob, fileName?: string }>} data default empty array
   */
  public upload(file: File, data: Array<{ name: string, value: string | Blob, fileName?: string }> = []): void {
    this.reset();

    if (!this.isFileValid(file)) {
      return;
    }

    this.buildFormData(file, data);
  }

  /**
   * Retry to upload last FormData
   */
  public reupload(): void {
    this.execRequest(this.lastFormData);
  }

  /**
   * Reset FileUpload
   */
  protected reset(): void {
    this.started = false;
    setTimeout(() => this.progress.next(0));

    // Cancel request si cancelable
    if (this.cancelRequest) {
      this.cancelRequest();
    }
  }

  /**
   * Build FormData & call execRequest()
   * @param {File} file
   * @param {metadata} data default empty array
   */
  protected buildFormData(file: File, data: Array<metadata> = []): void {
    this.fileSize = file.size;
    const formData = new FormData();
    formData.append(this.options.name!, file, file.name);
    if (data) {
      data.forEach((item) => {
        if (item.value instanceof Blob) {
          formData.append(item.name, item.value, item.fileName);
        } else {
          formData.append(item.name, item.value);
        }
      })
    }
    this.execRequest(formData);
  }

  /**
   * Determines if file type is valid
   * @param {File} file
   * @returns {boolean} true if file type valid, false otherwise
   */
  protected isFileTypeValid(file: File): boolean {
    if (
      this.options.allowedTypes!.length > 0
      && !this.options.allowedTypes!.some(allowedType => allowedType === file.type)
    ) {
      setTimeout(() => this.error.next('invalid_filetype'));
      setTimeout(() => this.complete.next(true));
      this.reset();
      return false;
    }

    return true;
  }

  /**
   * Determines if file size is valid
   * @param {File} file
   * @returns {boolean} true if file size valid, false otherwise
   */
  protected isFileSizeValid(file: File): boolean {
    if (this.options.maxSize! && file.size > this.options.maxSize!) {
      setTimeout(() => this.error.next('invalid_filesize'));
      setTimeout(() => this.complete.next(true));
      this.reset();
      return false;
    }

    return true;
  }

  /**
   * Determines if file is valid
   * @param {File} file
   * @returns {boolean} true if file is valid, false otherwise
   */
  protected isFileValid(file: File): boolean {
    return this.isFileTypeValid(file) && this.isFileSizeValid(file);
  }

  /**
   * Prepare & send request to provided url
   * @param {FormData} formData
   */
  private async execRequest(formData: FormData): Promise<void> {
    this.lastFormData = formData;
    this.started = true;
    const { CancelToken } = axios;

    let headers = {};
    if (this.options.headers) {
      headers = await this.options.headers()
    }

    const axiosConfig: AxiosRequestConfig = {
      method: 'POST',
      url: this.options.url,
      data: formData,
      withCredentials: true,
      headers: {
        ...headers,
        Expires: 'Mon, 26 Jul 1990 05:00:00 GMT',
        'Last-Modified': `${new Date().toUTCString()} GMT`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
        Pragma: 'no-cache'
      },
      cancelToken: new CancelToken(canceler => {
        this.cancelRequest = canceler;
      }),
      onUploadProgress: progress => {
        const { loaded, total = 1 } = progress;
        return setTimeout(() => this.progress.next(this.initialProgress + (loaded / total ) * (100 - this.initialProgress)));
      }
        
    };

    const start = Date.now();
    // Send upload request
    axios.request(axiosConfig).then((success) => {
      this.timeUpload = Date.now() - start;
      setTimeout(() => this.success.next(success.data));

      this.started = false;
      setTimeout(() => this.complete.next(true));
    }).catch((error) => {
      this.reset();
      if (!axios.isCancel(error))
        setTimeout(() => this.error.next(error));

      this.started = false;
      setTimeout(() => this.complete.next(true));
    });
  }
}
