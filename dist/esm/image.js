import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
import _classCallCheck from "@babel/runtime/helpers/classCallCheck";
import _createClass from "@babel/runtime/helpers/createClass";
import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";
import _inherits from "@babel/runtime/helpers/inherits";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
import { FileUpload } from "./file";
import { ExifParserFactory } from "ts-exif-parser";

/**
 * ImageUpload options
 * @extends FileUploadOptions
 */

/**
 * Class upload image, to send an image to a server with an axios request
 * @extends FileUpload
 * Documentation : Le live
 */
export var ImageUpload = /*#__PURE__*/function (_FileUpload) {
  /**
   * @param {ImageUploadOptions} options
   */
  function ImageUpload(options) {
    var _this;
    _classCallCheck(this, ImageUpload);
    var _options$allowedTypes = options.allowedTypes,
      allowedTypes = _options$allowedTypes === void 0 ? ["image/jpeg", "image/png"] : _options$allowedTypes,
      _options$quality = options.quality,
      quality = _options$quality === void 0 ? 0.75 : _options$quality,
      _options$outputType = options.outputType,
      outputType = _options$outputType === void 0 ? "image/jpeg" : _options$outputType,
      _options$orientationA = options.orientationAllowed,
      orientationAllowed = _options$orientationA === void 0 ? true : _options$orientationA,
      _options$lessCrop = options.lessCrop,
      lessCrop = _options$lessCrop === void 0 ? false : _options$lessCrop;
    _this = _callSuper(this, ImageUpload, [options]);
    _defineProperty(_this, "imageOptions", void 0);
    _defineProperty(_this, "window", void 0);
    _this.imageOptions = _objectSpread(_objectSpread({
      allowedTypes: allowedTypes,
      quality: quality,
      outputType: outputType,
      orientationAllowed: orientationAllowed,
      lessCrop: lessCrop
    }, _this.options), options);
    _this.window = window;
    return _this;
  }

  /**
   * Upload image from a file
   * @param {File} file
   * @param {Array<{ name: string, value: string | Blob, fileName?: string }>} data default empty array
   */
  _inherits(ImageUpload, _FileUpload);
  return _createClass(ImageUpload, [{
    key: "uploadFile",
    value: function uploadFile(file) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
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
  }, {
    key: "uploadBlob",
    value: function uploadBlob(blob, name) {
      var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var file = new File([blob], name, {
        type: blob.type
      });
      this.uploadFile(file, data);
    }

    /**
     * Determines if webp is supported by the browser
     * @returns a promise resolving to a boolean to know if webp is supported
     */
  }, {
    key: "isImageMinSizeValid",
    value:
    /**
     * Determines if image min size is valid
     * Emit error if setError
     * @param {number} width
     * @param {number} height
     * @param {boolean} setError default true
     * @returns true if image min size valid, false otherwise
     */
    function isImageMinSizeValid(width, height) {
      var _this2 = this;
      var setError = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      if (!(this.imageOptions.minWidth && this.imageOptions.minHeight)) {
        return true;
      }
      var isValid = width >= this.imageOptions.minWidth && height >= this.imageOptions.minHeight;
      if (setError && !isValid) {
        setTimeout(function () {
          return _this2.error.next("minsize");
        });
        setTimeout(function () {
          return _this2.complete.next(true);
        });
      }
      return isValid;
    }

    /**
     * Determines if file type is valid
     * @param {File} file
     * @returns {boolean} true if file type valid, false otherwise
     */
  }, {
    key: "isFileTypeValid",
    value: function isFileTypeValid(file) {
      var _this3 = this;
      if (this.imageOptions.allowedTypes.length > 0 && !this.imageOptions.allowedTypes.some(function (allowedType) {
        return allowedType === file.type;
      })) {
        setTimeout(function () {
          var error = file.type === "image/webp" ? "invalid_filetype_webp" : "invalid_filetype";
          _this3.error.next(error);
        });
        setTimeout(function () {
          return _this3.complete.next(true);
        });
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
  }, {
    key: "handleOrientationAllowed",
    value: function handleOrientationAllowed(width, height) {
      if (!this.imageOptions.orientationAllowed) return;

      // handle max size. If image is wider than higher we make sur that maxWidth is bigger than maxHeight
      // if not we swap max size
      if (this.imageOptions.maxHeight && this.imageOptions.maxWidth) {
        if (width > height) {
          if (this.imageOptions.maxHeight > this.imageOptions.maxWidth) {
            var _ref = [this.imageOptions.maxWidth, this.imageOptions.maxHeight];
            this.imageOptions.maxHeight = _ref[0];
            this.imageOptions.maxWidth = _ref[1];
          }
        } else if (this.imageOptions.maxHeight < this.imageOptions.maxWidth) {
          var _ref2 = [this.imageOptions.maxWidth, this.imageOptions.maxHeight];
          this.imageOptions.maxHeight = _ref2[0];
          this.imageOptions.maxWidth = _ref2[1];
        }
      }

      // handle min size. If image is wider than higher we make sur that minWidth is bigger than minHeight
      // if not we swap min size
      if (this.imageOptions.minHeight && this.imageOptions.minWidth) {
        if (width > height) {
          if (this.imageOptions.minHeight > this.imageOptions.minWidth) {
            var _ref3 = [this.imageOptions.minWidth, this.imageOptions.minHeight];
            this.imageOptions.minHeight = _ref3[0];
            this.imageOptions.minWidth = _ref3[1];
          }
        } else if (this.imageOptions.minHeight < this.imageOptions.minWidth) {
          var _ref4 = [this.imageOptions.minWidth, this.imageOptions.minHeight];
          this.imageOptions.minHeight = _ref4[0];
          this.imageOptions.minWidth = _ref4[1];
        }
      }
    }

    /**
     * Build FormData et call sendFiles
     * Gère les erreurs
     * @param {File} file
     * @param {Array<{ name: string, value: string | Blob, fileName?: string }>} data default empty array
     */
  }, {
    key: "resizeAndConvert",
    value: function resizeAndConvert(file) {
      var _this4 = this;
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var exif;
      this.initialProgress = 10;
      setTimeout(function () {
        return _this4.progress.next(_this4.initialProgress);
      });
      var image = document.createElement("img");
      image.onload = function () {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        var width = image.width,
          height = image.height;
        _this4.handleOrientationAllowed(width, height);
        if (!_this4.isImageMinSizeValid(width, height)) return;

        // if no max/min size, set max/min size to width/height
        var _this4$imageOptions = _this4.imageOptions,
          _this4$imageOptions$m = _this4$imageOptions.maxWidth,
          maxWidth = _this4$imageOptions$m === void 0 ? width : _this4$imageOptions$m,
          _this4$imageOptions$m2 = _this4$imageOptions.maxHeight,
          maxHeight = _this4$imageOptions$m2 === void 0 ? height : _this4$imageOptions$m2,
          _this4$imageOptions$m3 = _this4$imageOptions.minWidth,
          minWidth = _this4$imageOptions$m3 === void 0 ? width : _this4$imageOptions$m3,
          _this4$imageOptions$m4 = _this4$imageOptions.minHeight,
          minHeight = _this4$imageOptions$m4 === void 0 ? height : _this4$imageOptions$m4,
          lessCrop = _this4$imageOptions.lessCrop;

        // Define ratio to have the biggest image allowed
        var maxWRatio = maxWidth / width;
        var maxHRatio = maxHeight / height;
        var ratios = [maxWRatio, maxHRatio].filter(function (ratio) {
          return ratio < 1;
        });
        var ratio = 1;
        if (ratios.length > 0) {
          ratio = lessCrop ? Math.min.apply(Math, _toConsumableArray(ratios)) : Math.max.apply(Math, _toConsumableArray(ratios));
        }
        var newWidth = width * ratio;
        var newHeight = height * ratio;

        // Make sure the ratio respect min size if we need to resize down the image
        if (newWidth < minWidth || newHeight < minHeight) {
          var minWRatio = minWidth / width;
          var minHRatio = minHeight / height;
          var _ratios = [minWRatio, minHRatio].filter(function (ratio) {
            return ratio < 1;
          });
          ratio = _ratios.length > 0 ? Math.max.apply(Math, _toConsumableArray(_ratios)) : 1;
          newWidth = width * ratio;
          newHeight = height * ratio;
        }
        var sourceWidth = newWidth > maxWidth ? maxWidth / ratio : width;
        var sourceHeight = newHeight > maxHeight ? maxHeight / ratio : height;
        var x = 0;
        var y = 0;

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
        context.drawImage(image, x, y, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
        var metadata = [{
          name: "metadata[quality]",
          value: String(_this4.imageOptions.quality)
        }];
        if (exif && exif.lat && exif.lon) {
          metadata.push({
            name: "metadata[lat]",
            value: exif.lat
          }, {
            name: "metadata[lon]",
            value: exif.lon
          });
        }
        _this4.initialProgress = 17;
        setTimeout(function () {
          return _this4.progress.next(_this4.initialProgress);
        });
        var blobCallback = function blobCallback(blob) {
          if (!blob) {
            setTimeout(function () {
              return _this4.error.next("default");
            });
            setTimeout(function () {
              return _this4.complete.next(true);
            });
            _this4.reset();
            return;
          }
          _this4.initialProgress = 25;
          setTimeout(function () {
            return _this4.progress.next(_this4.initialProgress);
          });

          // Rename file with correct extension

          var nameSplit = file.name.split(".");
          nameSplit.pop();
          var nameParts = [].concat(_toConsumableArray(nameSplit), [blob.type.replace("image/", "")]);
          var newFile = new File([blob], nameParts.join("."), {
            type: blob.type
          });
          _this4.buildFormData(newFile, [].concat(metadata, _toConsumableArray(data)));
        };
        canvas.toBlob(blobCallback, _this4.imageOptions.outputType, _this4.imageOptions.quality);
      };
      var reader = new FileReader();
      reader.onload = function (event) {
        var result = event.target.result;
        var urlCreator = _this4.window.URL || _this4.window.webkitURL;
        if (result && typeof result !== "string") {
          try {
            var Data = ExifParserFactory.create(result).parse();
            if (Data && Data.tags.GPSLatitude && Data.tags.GPSLongitude) {
              var lat = String(Data.tags.GPSLatitude);
              var lon = String(Data.tags.GPSLongitude);
              exif = {
                lat: lat,
                lon: lon
              };
            }
          } catch (e) {
            console.log("can't read exif data");
          }
        }
        image.src = urlCreator.createObjectURL(file);
      };
      reader.readAsArrayBuffer(file);
    }
  }], [{
    key: "isWebpSupported",
    value: function isWebpSupported() {
      return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () {
          return resolve(img.width === 2 && img.height === 1);
        };
        img.onerror = function () {
          return resolve(false);
        };
        img.src = "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==";
      });
    }

    /**
     * Determines if webp convertion with canvas is supported by the browser
     * @returns a boolean to know if webp conversion is supported
     */
  }, {
    key: "isWebpConvertionSupported",
    value: function isWebpConvertionSupported() {
      var canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL("image/webp").match("image/webp") !== null;
    }
  }]);
}(FileUpload);
//# sourceMappingURL=image.js.map