"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileUpload = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _axios = _interopRequireDefault(require("axios"));
var _rxjs = require("rxjs");
var _operators = require("rxjs/operators");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2.default)(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * FileUpload Options
 */
/**
 * Class upload file, to send a file to a server with an axios request
 * Documentation : Le live
 */
var FileUpload = exports.FileUpload = /*#__PURE__*/function () {
  /**
   * @param {FileUploadOptions} options
   */
  function FileUpload(options) {
    (0, _classCallCheck2.default)(this, FileUpload);
    (0, _defineProperty2.default)(this, "fileSize", null);
    (0, _defineProperty2.default)(this, "timeUpload", null);
    (0, _defineProperty2.default)(this, "progress", new _rxjs.Subject());
    (0, _defineProperty2.default)(this, "complete", new _rxjs.Subject());
    (0, _defineProperty2.default)(this, "success", new _rxjs.Subject());
    (0, _defineProperty2.default)(this, "error", new _rxjs.Subject());
    (0, _defineProperty2.default)(this, "options", void 0);
    (0, _defineProperty2.default)(this, "cancelRequest", void 0);
    (0, _defineProperty2.default)(this, "started", false);
    (0, _defineProperty2.default)(this, "initialProgress", 0);
    (0, _defineProperty2.default)(this, "lastFormData", void 0);
    var _options$maxSize = options.maxSize,
      maxSize = _options$maxSize === void 0 ? 20971520 : _options$maxSize,
      _options$name = options.name,
      name = _options$name === void 0 ? 'file' : _options$name;
    this.options = _objectSpread({
      maxSize: maxSize,
      name: name
    }, options);
  }

  /**
   * @returns {number | null}
   */
  return (0, _createClass2.default)(FileUpload, [{
    key: "getFileSize",
    value: function getFileSize() {
      return this.fileSize;
    }
    /**
     * @returns {number | null}
     */
  }, {
    key: "getTimeUpload",
    value: function getTimeUpload() {
      return this.timeUpload;
    }
    /**
     * Observable request progress
     * @returns {Observable<number>}
     */
  }, {
    key: "onProgress",
    value: function onProgress() {
      return this.progress.asObservable().pipe((0, _operators.filter)(function (value) {
        return value !== null;
      }));
    }

    /**
     * Observable error
     * @returns {Observable<any>}
     */
  }, {
    key: "onError",
    value: function onError() {
      return this.error.asObservable().pipe((0, _operators.filter)(function (value) {
        return value !== null;
      }));
    }

    /**
     * Request completed
     * @returns {Observable<boolean>}
     */
  }, {
    key: "onComplete",
    value: function onComplete() {
      return this.complete.asObservable().pipe((0, _operators.filter)(function (value) {
        return value !== null;
      }));
    }

    /**
     * Request Succeeded
     * @returns {Observable<any>}
     */
  }, {
    key: "onSuccess",
    value: function onSuccess() {
      return this.success.asObservable().pipe((0, _operators.filter)(function (value) {
        return value !== null;
      }));
    }

    /**
     * Check if file is valid & call buildFormData()
     * @param {File} file
     * @param {Array<{ name: string, value: string | Blob, fileName?: string }>} data default empty array
     */
  }, {
    key: "upload",
    value: function upload(file) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      this.reset();
      if (!this.isFileValid(file)) {
        return;
      }
      this.buildFormData(file, data);
    }

    /**
     * Retry to upload last FormData
     */
  }, {
    key: "reupload",
    value: function reupload() {
      this.execRequest(this.lastFormData);
    }

    /**
     * Reset FileUpload
     */
  }, {
    key: "reset",
    value: function reset() {
      var _this = this;
      this.started = false;
      setTimeout(function () {
        return _this.progress.next(0);
      });

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
  }, {
    key: "buildFormData",
    value: function buildFormData(file) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      this.fileSize = file.size;
      var formData = new FormData();
      formData.append(this.options.name, file, file.name);
      if (data) {
        data.forEach(function (item) {
          if (item.value instanceof Blob) {
            formData.append(item.name, item.value, item.fileName);
          } else {
            formData.append(item.name, item.value);
          }
        });
      }
      this.execRequest(formData);
    }

    /**
     * Determines if file type is valid
     * @param {File} file
     * @returns {boolean} true if file type valid, false otherwise
     */
  }, {
    key: "isFileTypeValid",
    value: function isFileTypeValid(file) {
      var _this2 = this;
      if (this.options.allowedTypes.length > 0 && !this.options.allowedTypes.some(function (allowedType) {
        return allowedType === file.type;
      })) {
        setTimeout(function () {
          return _this2.error.next('invalid_filetype');
        });
        setTimeout(function () {
          return _this2.complete.next(true);
        });
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
  }, {
    key: "isFileSizeValid",
    value: function isFileSizeValid(file) {
      var _this3 = this;
      if (this.options.maxSize && file.size > this.options.maxSize) {
        setTimeout(function () {
          return _this3.error.next('invalid_filesize');
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
     * Determines if file is valid
     * @param {File} file
     * @returns {boolean} true if file is valid, false otherwise
     */
  }, {
    key: "isFileValid",
    value: function isFileValid(file) {
      return this.isFileTypeValid(file) && this.isFileSizeValid(file);
    }

    /**
     * Prepare & send request to provided url
     * @param {FormData} formData
     */
  }, {
    key: "execRequest",
    value: (function () {
      var _execRequest = (0, _asyncToGenerator2.default)(/*#__PURE__*/_regenerator.default.mark(function _callee(formData) {
        var _this4 = this;
        var CancelToken, headers, axiosConfig, start;
        return _regenerator.default.wrap(function (_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              this.lastFormData = formData;
              this.started = true;
              CancelToken = _axios.default.CancelToken;
              headers = {};
              if (!this.options.headers) {
                _context.next = 2;
                break;
              }
              _context.next = 1;
              return this.options.headers();
            case 1:
              headers = _context.sent;
            case 2:
              axiosConfig = {
                method: 'POST',
                url: this.options.url,
                data: formData,
                withCredentials: true,
                headers: _objectSpread(_objectSpread({}, headers), {}, {
                  Expires: 'Mon, 26 Jul 1990 05:00:00 GMT',
                  'Last-Modified': "".concat(new Date().toUTCString(), " GMT"),
                  'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
                  Pragma: 'no-cache'
                }),
                cancelToken: new CancelToken(function (canceler) {
                  _this4.cancelRequest = canceler;
                }),
                onUploadProgress: function onUploadProgress(progress) {
                  var loaded = progress.loaded,
                    _progress$total = progress.total,
                    total = _progress$total === void 0 ? 1 : _progress$total;
                  return setTimeout(function () {
                    return _this4.progress.next(_this4.initialProgress + loaded / total * (100 - _this4.initialProgress));
                  });
                }
              };
              start = Date.now(); // Send upload request
              _axios.default.request(axiosConfig).then(function (success) {
                _this4.timeUpload = Date.now() - start;
                setTimeout(function () {
                  return _this4.success.next(success.data);
                });
                _this4.started = false;
                setTimeout(function () {
                  return _this4.complete.next(true);
                });
              }).catch(function (error) {
                _this4.reset();
                if (!_axios.default.isCancel(error)) setTimeout(function () {
                  return _this4.error.next(error);
                });
                _this4.started = false;
                setTimeout(function () {
                  return _this4.complete.next(true);
                });
              });
            case 3:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function execRequest(_x) {
        return _execRequest.apply(this, arguments);
      }
      return execRequest;
    }())
  }]);
}();
//# sourceMappingURL=file.js.map