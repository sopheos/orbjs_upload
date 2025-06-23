import { FileUpload, FileUploadOptions, metadata } from "./file";
import { ExifParserFactory } from "ts-exif-parser";

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
export class ImageUpload extends FileUpload {
  imageOptions: ImageUploadOptions;
  window: Window;

  /**
   * @param {ImageUploadOptions} options
   */
  constructor(options: ImageUploadOptions) {
    const {
      allowedTypes = ["image/jpeg", "image/png"],
      quality = 0.75,
      outputType = "image/jpeg",
      orientationAllowed = true,
      lessCrop = false,
    } = options;

    super(options);
    this.imageOptions = {
      allowedTypes,
      quality,
      outputType,
      orientationAllowed,
      lessCrop,
      ...this.options,
      ...options,
    };
    this.window = window;
  }

  /**
   * Upload image from a file
   * @param {File} file
   * @param {Array<{ name: string, value: string | Blob, fileName?: string }>} data default empty array
   */
  public uploadFile(
    file: File,
    data: Array<{ name: string; value: string | Blob; fileName?: string }> = []
  ): void {
    this.reset();

    if (!this.isFileTypeValid(file)) {
      return;
    }

    this.resizeAndConvert(file, data);
  }

  /**
   * Upload image from a blob
   * @param {Blob} blob
   * @param {string} name
   * @param {Array<{ name: string, value: string | Blob, fileName?: string }>} data default empty array
   */
  public uploadBlob(
    blob: Blob,
    name: string,
    data: Array<{ name: string; value: string | Blob; fileName?: string }> = []
  ): void {
    const file = new File([blob], name, { type: blob.type });
    this.uploadFile(file, data);
  }

  /**
   * Determines if webp is supported by the browser
   * @returns a promise resolving to a boolean to know if webp is supported
   */
  public static isWebpSupported(): Promise<Boolean> {
    return new Promise<Boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width === 2 && img.height === 1);
      img.onerror = () => resolve(false);
      img.src =
        "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==";
    });
  }

  /**
   * Determines if webp convertion with canvas is supported by the browser
   * @returns a boolean to know if webp conversion is supported
   */
  public static isWebpConvertionSupported(): Boolean {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").match("image/webp") !== null;
  }

  /**
   * Determines if image min size is valid
   * Emit error if setError
   * @param {number} width
   * @param {number} height
   * @param {boolean} setError default true
   * @returns true if image min size valid, false otherwise
   */
  protected isImageMinSizeValid(
    width: number,
    height: number,
    setError: boolean = true
  ): boolean {
    if (!(this.imageOptions.minWidth && this.imageOptions.minHeight)) {
      return true;
    }

    const isValid =
      width >= this.imageOptions.minWidth &&
      height >= this.imageOptions.minHeight;

    if (setError && !isValid) {
      setTimeout(() => this.error.next("minsize"));
      setTimeout(() => this.complete.next(true));
    }

    return isValid;
  }

  /**
   * Determines if file type is valid
   * @param {File} file
   * @returns {boolean} true if file type valid, false otherwise
   */
  protected isFileTypeValid(file: File): boolean {
    if (
      this.imageOptions.allowedTypes!.length > 0 &&
      !this.imageOptions.allowedTypes!.some(
        (allowedType) => allowedType === file.type
      )
    ) {
      setTimeout(() => {
        const error =
          file.type === "image/webp"
            ? "invalid_filetype_webp"
            : "invalid_filetype";
        this.error.next(error);
      });
      setTimeout(() => this.complete.next(true));
      this.reset();
      return false;
    }

    return true;
  }

  /**
   * If orientationAllowed, handle big side/small side instead of width/height
   *
   * @param {number} width
   * @param {number} height
   */
  private handleOrientationAllowed(width: number, height: number) {
    if (!this.imageOptions.orientationAllowed) return;

    // handle max size. If image is wider than higher we make sur that maxWidth is bigger than maxHeight
    // if not we swap max size
    if (this.imageOptions.maxHeight && this.imageOptions.maxWidth) {
      if (width > height) {
        if (this.imageOptions.maxHeight > this.imageOptions.maxWidth) {
          [this.imageOptions.maxHeight, this.imageOptions.maxWidth] = [
            this.imageOptions.maxWidth,
            this.imageOptions.maxHeight,
          ];
        }
      } else if (this.imageOptions.maxHeight < this.imageOptions.maxWidth) {
        [this.imageOptions.maxHeight, this.imageOptions.maxWidth] = [
          this.imageOptions.maxWidth,
          this.imageOptions.maxHeight,
        ];
      }
    }

    // handle min size. If image is wider than higher we make sur that minWidth is bigger than minHeight
    // if not we swap min size
    if (this.imageOptions.minHeight && this.imageOptions.minWidth) {
      if (width > height) {
        if (this.imageOptions.minHeight > this.imageOptions.minWidth) {
          [this.imageOptions.minHeight, this.imageOptions.minWidth] = [
            this.imageOptions.minWidth,
            this.imageOptions.minHeight,
          ];
        }
      } else if (this.imageOptions.minHeight < this.imageOptions.minWidth) {
        [this.imageOptions.minHeight, this.imageOptions.minWidth] = [
          this.imageOptions.minWidth,
          this.imageOptions.minHeight,
        ];
      }
    }
  }

  /**
   * Build FormData et call sendFiles
   * Gère les erreurs
   * @param {File} file
   * @param {Array<{ name: string, value: string | Blob, fileName?: string }>} data default empty array
   */
  private resizeAndConvert(
    file: File,
    data: Array<{ name: string; value: string | Blob; fileName?: string }> = []
  ): void {
    let exif: any;

    this.initialProgress = 10;
    setTimeout(() => this.progress.next(this.initialProgress));
    const image = document.createElement("img");
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      let { width, height } = image;

      this.handleOrientationAllowed(width, height);

      if (!this.isImageMinSizeValid(width, height)) return;

      // if no max/min size, set max/min size to width/height
      const {
        maxWidth = width,
        maxHeight = height,
        minWidth = width,
        minHeight = height,
        lessCrop,
      } = this.imageOptions;

      // Define ratio to have the biggest image allowed
      const maxWRatio = maxWidth / width;
      const maxHRatio = maxHeight / height;
      const ratios = [maxWRatio, maxHRatio].filter((ratio) => ratio < 1);
      let ratio = 1;
      if (ratios.length > 0) {
        ratio = lessCrop ? Math.min(...ratios) : Math.max(...ratios);
      }
      let newWidth = width * ratio;
      let newHeight = height * ratio;

      // Make sure the ratio respect min size if we need to resize down the image
      if (newWidth < minWidth || newHeight < minHeight) {
        const minWRatio = minWidth / width;
        const minHRatio = minHeight / height;
        const ratios = [minWRatio, minHRatio].filter((ratio) => ratio < 1);
        ratio = ratios.length > 0 ? Math.max(...ratios) : 1;
        newWidth = width * ratio;
        newHeight = height * ratio;
      }

      let sourceWidth = newWidth > maxWidth ? maxWidth / ratio : width;
      let sourceHeight = newHeight > maxHeight ? maxHeight / ratio : height;
      let x = 0;
      let y = 0;

      // if needed, offset the exceeding part on the x axis
      if (newWidth > maxWidth) {
        x = (width - sourceWidth) / 2;
        newWidth = maxWidth;
      }

      // if needed, offset the exceeding part on the y axis
      if (newHeight > maxHeight) {
        y = (height - sourceHeight) / 2;
        newHeight = maxHeight;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
      context.drawImage(
        image,
        x,
        y,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const metadata: Array<metadata> = [
        {
          name: "metadata[quality]",
          value: String(this.imageOptions.quality),
        },
      ];

      if (exif && exif.lat && exif.lon) {
        metadata.push(
          {
            name: "metadata[lat]",
            value: exif.lat,
          },
          {
            name: "metadata[lon]",
            value: exif.lon,
          }
        );
      }

      this.initialProgress = 17;
      setTimeout(() => this.progress.next(this.initialProgress));

      const blobCallback = (blob: Blob | null): void => {
        if (!blob) {
          setTimeout(() => this.error.next("default"));
          setTimeout(() => this.complete.next(true));
          this.reset();
          return;
        }

        this.initialProgress = 25;
        setTimeout(() => this.progress.next(this.initialProgress));

        // Rename file with correct extension

        const nameSplit = file.name.split(".");
        nameSplit.pop();

        const nameParts = [...nameSplit, blob.type.replace("image/", "")];
        const newFile = new File([blob], nameParts.join("."), {
          type: blob.type,
        });

        this.buildFormData(newFile, [...metadata, ...data]);
      };

      canvas.toBlob(
        blobCallback,
        this.imageOptions.outputType,
        this.imageOptions.quality
      );
    };

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target!.result;

      const urlCreator = this.window.URL || this.window.webkitURL;

      if (result && typeof result !== "string") {
        try {
          const Data = ExifParserFactory.create(result).parse();
          if (Data && Data.tags!.GPSLatitude && Data.tags!.GPSLongitude) {
            const lat = String(Data.tags!.GPSLatitude);
            const lon = String(Data.tags!.GPSLongitude);
            exif = { lat, lon };
          }
        } catch (e) {
          console.log(`can't read exif data`);
        }
      }
      image.src = urlCreator.createObjectURL(file);
    };
    reader.readAsArrayBuffer(file);
  }
}
