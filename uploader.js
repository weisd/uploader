    window.mcw = {
        loadImage: function(a, b) {
            var c = new Image;
            b && (c.onload = function() {
                b(c)
            },
            c.onerror = function() {
                b()
            });
            if (typeof a == "string") c.src = a;
            else if (a.nodeName && a.nodeName == "IMG") c.src = a.src;
            else if (window.FileReader && FileReader.prototype.readAsDataURL && /^image/.test(a.type)) {
                var d = new FileReader;
                d.onload = function(a) {
                    c.src = a.target.result
                },
                d.readAsDataURL(a)
            } else b()
        },
        preloadImages: function(b) {
            $.each(b, 
            function(a, b) {
                mcw.loadImage(b)
            })
        }
    };
/**
 *  文件上传
 */
(function(a){
    function b(b, c) {
        this.opts = a.extend({},
        {
            title: "添加附件",
            action: "",
            params: {},
            multiple: !0,
            maxConnections: 1,
            allowedExtensions: [],
            sizeLimit: 0,
            minSizeLimit: 0,
            beforeUpload: function(a, b) {},
            onProgress: function(a, b, c, d) {},
            onSuccess: function(a, b, c) {},
            onComplete: function(a, b, c) {},
            onCancel: function(a, b) {},
            onValidate: function(a, b) {
                return ! 0
            },
            onError: function(a, b, c) {}
        },
        c),
        this._files = [],
        this._queue = [],
        this._params = [],
        this._loaded = [],
        this._xhrs = [],
        this.el = a(b),
        this._input = null,
        this._createUploadButton(),
        this._filesInProgress = 0,
        this._preventLeaveInProgress()
    }
    a.extend(b.prototype, {
        setParams: function() {
            this.opts.params = params
        },
        getInProgress: function() {
            return this._filesInProgress
        },
        uploadFile: function(a, b) {
            this._supportHTML5 && this._uploadFileList([a], b)
        },
        cancel: function(b) {
            if (!b) return;
            var c = this._files[b];
            this.opts.onCancel(c),
            this._supportHTML5 ? (c = null, this._xhrs[b] && (this._xhrs[b].abort(), this._xhrs[b] = null)) : (delete c, a("#upload-iframe-" + b).attr("src", "javascript:false;").remove(), this._queue.splice(this._queue.indexOf(b * 1), 1), this._filesInProgress--, this.opts.onComplete())
        },
        _preventLeaveInProgress: function() {
            var b = this;
            a(window).bind("beforeunload", 
            function(a) {
                if (b._filesInProgress <= 0) return;
                return a.originalEvent.returnValue = "正在上传文件，如果离开上传会自动取消",
                "正在上传文件，如果离开上传会自动取消"
            })
        },
        // __1 创建上传按钮
        _createUploadButton: function() {
            return this.el.css({
                position: "relative",
                overflow: "hidden",
                direction: "ltr"
            }),
            this.el.is("input[type=file]") || (this._input = a("<input />", {
                multiple: this.opts.multiple && this._supportHTML5,
                type: "file",
                title: this.opts.title,
                name: "upload-file",
                tabIndex: -1,
                css: {
                    position: "absolute",
                    right: 0,
                    top: 0,
                    fontFamily: "Arial",
                    fontSize: "118px",
                    margin: 0,
                    padding: 0,
                    cursor: "pointer",
                    opacity: 0
                }
            }).on("change", a.proxy(this._onInputChange, this)), this.el.append(this._input), window.attach && this._input.prop("tabindex", "-1")),
            this._input
        },
        // __2 点击上传
        _onInputChange: function() {
            this._supportHTML5 ? this._uploadFileList(this._input[0].files) : this._validateFile(this._input[0]) ? this._uploadFile(this._input[0]) : this.opts.onComplete(this._input[0]),
            this._resetUploadButton()
        },
        _resetUploadButton: function() {
            this._input[0].parentNode && this._input.remove(),
            this._input = this._createUploadButton()
        },
        _uploadFileList: function(a, b) {
            for (var c = 0, d = a.length; c < d; c++) if (!this._validateFile(a[c])) {
                this.opts.onComplete(a[c], null, b);
                return
            }
            for (var c = 0, d = a.length; c < d; c++) this._uploadFile(a[c], b)
        },
        // __4  上传入口 beforeunload
        _uploadFile: function(b, c) {
            var d = this._addFile(b);
            this.opts.beforeUpload(d) !== !1 && (this._filesInProgress++, this._prepareUpload(d, a.extend({},
            this.opts.params, c)))
        },
        // __5 加入队列
        _prepareUpload: function(b, c) {
            var d = this._queue.push(b.id);
            this._params[b.id] = a.extend({},
            c),
            d <= this.opts.maxConnections && this._upload(b, this._params[b.id])
        },
        // __6 上传操作
        _upload: function(a, b) {
            this._supportHTML5 ? this._xhrUpload(a, b) : this._formUpload(a, b)
        },
        // __6.1   html5上传
        _xhrUpload: function(b, c) {
            this._loaded[b.id] = 0;
            var d = this;
            c = c || {};
            var e = new FormData;
            e.append("authenticity_token", a('meta[name="csrf-token"]').attr("content")),
            e.append("upload_file", b.obj),
            c.original_filename = this._getFileName(b),
            c.conn_guid = a("#conn-guid").val(),
            a.each(c, 
            function(a, b) {
                e.append(a, b)
            });
            var f = this._xhrs[b.id] = a.ajax({
                url: this.opts.action,
                data: e,
                processData: !1,
                contentType: !1,
                type: "POST",
                headers: {
                    "X-File-Name": encodeURIComponent(b.name)
                },
                xhr: function() {
                    var b = a.ajaxSettings.xhr();
                    return b && (b.upload.onprogress = a.proxy(function(a) {
                        this.progress(a)
                    },
                    this)),
                    b
                },
                progress: function(a) {
                    a.lengthComputable && (d._loaded[b.id] = a.loaded, d.opts.onProgress(b, a.loaded, a.total, c))
                },
                error: function(a, e, f) {
                    d.opts.onError(b, a, c)
                },
                success: a.proxy(function(a) {
                    this.opts.onProgress(b, b.size, b.size, c),
                    this.opts.onSuccess(b, a, c)
                },
                this),
                complete: a.proxy(function(d, e) {
                    this._filesInProgress--,
                    this.opts.onComplete(b, a.parseJSON(d.responseText), c),
                    this._files[b.id] = null,
                    this._xhrs[b.id] = null,
                    this._dequeue(b)
                },
                this)
            })
        },
        _dequeue: function(b) {
            var c = a.inArray(b.id, this._queue);
            this._queue.splice(c, 1);
            var d = this.opts.maxConnections;
            if (this._queue.length >= d && c < d) {
                var e = this._queue[d - 1];
                this._upload(this._files[e], this._params[e])
            }
        },
        // __6.2 表单上传
        _formUpload: function(b, c) {
            var d = b.obj;
            if (!d) throw new Error("file with does not exsit, or already uploaded or cancel");
            var e = this._createIframe("upload-iframe-" + b.id);
            var f = this._createForm(e, c);
            f.appendChild(d);
            var g = this;
            this._attachLoadEvent(e, 
            function() {
                var res = g._getIframeContentJSON(e);
                g._filesInProgress--;
                g.opts.onSuccess(b, res, c);
                g.opts.onComplete(b, res, c);
                g._files[b.id] = null;
                g._dequeue(b);
                a(e).remove();
            });
            f.submit();
            a(f).remove();
            return b.id
        },
        _attachLoadEvent: function(b, c) {
            a(b).on("load", 
            function() {
                if (!b.parentNode) return;
                if (b.contentDocument && b.contentDocument.body && b.contentDocument.body.innerHTML == "false") return;
                c()
            })
        },
        _getIframeContentJSON: function(b) {
            var d,e,body;
            if ( b.contentDocument ) 
            { // FF
              body = b.contentDocument.getElementsByTagName('body')[0];
            } else if ( b.contentWindow ) { // IE
              body = b.contentWindow.document.getElementsByTagName('body')[0];
            }
            d = body.innerHTML;

            return d;
            /*
            alert(iFrameBody.innerHTML);
            return;
            alert(b);
            var c = b.contentDocument,
            d,
            e;
            console.log(c);
            c.getElementById("json-response") ? d = c.getElementById("json-response").innerHTML: d = c.body.innerHTML;
            */
            try {
                e = a.parseJSON(d)
            } catch(f) {
                e = eval( "(" + d + ")" );
                //e = {}
            }
            return e
        },
        _createIframe: function(b) {
            // weisd fix IE下不能对name赋值，所以时指定name 
            var c = a("<iframe name='"+b+"' style='display:none' />", {
                src: "javascript:false;",
                name: b,
                id: b,
                css: {
                    display: "none"
                }
            });
            return a(document.body).append(c),
            c[0]
        },
        _createForm: function(b, c) {
            var d = a('<form method="post" enctype="multipart/form-data"></form>');
            d.attr("action", this.opts.action).attr("target", b.name).hide();
            var e = a("meta[name=csrf-token]").attr("content"),
            f = a("meta[name=csrf-param]").attr("content");
            if (f !== undefined && e !== undefined) {
                var g = a('<input name="' + f + '" value="' + e + '" type="hidden" />');
                d.append(g)
            }
            return a.each(c, 
            function(a, b) {
                d.append('<input type="hidden" name="' + a + '" value="' + b + '" />')
            }),
            a(document.body).append(d),
            d[0]
        },
        // __3 验证
        _validateFile: function(a) {
            var b = this._getFileExtension(a),
            c = this._getFileName(a);
            return this.opts.onValidate(a, b)
        },
        _addFile: function(b) {
            var c = {
                id: this._getUniqueId(),
                name: this._getFileName(b),
                size: this._getFileSize(b),
                extension: this._getFileExtension(b),
                obj: b
            };
            return this._files[c.id] = c,
            this._supportHTML5 || (a(b).prop("name", "upload_file"), b.parentNode && a(b).remove()),
            c
        },
        _getUniqueId: function() {
            var a = 0;
            return function() {
                return a++
            }
        } (),
        _getFileSize: function(a) {
            return this._supportHTML5 ? a.fileSize != null ? a.fileSize: a.size: null
        },
        _getFileName: function(a) {
            var b;
            return this._supportHTML5 ? b = a.fileName != null ? a.fileName: a.name: b = a.value.replace(/.*(\/|\\)/, ""),
            b
        },
        _getFileExtension: function(a) {
            var b = this._getFileName(a);
            return b.split(".").pop().toLowerCase()
        },
        _supportHTML5: !!window.File && !!window.FileList
    }),
    window.mcw || (mcw = {}),
    a.extend(mcw, {
        upload: function(a, c) {
            return new b(a, c)
        }
    })
})(jQuery);
