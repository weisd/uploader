
  // weibo 图片
  var publish_pics = [];

   var _params = {
        'file_field' : 'upload_file',
        'source'     : 'uploader',
        'res_name'   : 'weibo'
      };
  $.extend(upload_params, _params);
  if (window.mcw) {
  var weibouploadify = mcw && mcw.upload($('.js_weiboPublishBox').find('#js_uploadBtn'),{
        action: upload_action,
        inputName:'file',
        params:upload_params,
        beforeUpload: function(d, e) {

            $('#js_targetWeibo').trigger('click');

            // 最多9个
      if ($('#js_picQueue li').length >= 9) {
        weibouploadify.cancel(d.id);
        layer.msg('最多可以上传9张图片', 1);
        return;
      }

            var _tpl = '<li ><div class="loadingbox"><em class="percent">0%</em><font class="progress" style="display: block; width: 100%; height: 12px;"></font></div><img class="js_pic" width="40" src="/images/loadpic.gif" /><span class="js_del">x</span></li>';
            var list = $('#js_picQueue');

            var li = $(_tpl).attr('id',d.id).prependTo(list);

            mcw.loadImage(d.obj,function(a){
              if (!a) {
              
              } else {
                li.find('.js_pic').attr('src', a.src);
              }
            });

            li.addClass('uploading');
            
            // cencal
            li.find('.js_del').on('click',function(e){
              e.preventDefault();
              d.id && li.hasClass('uploading') &&  weibouploadify.cancel(d.id);
              // 删除 @todo 后台处理
              var data_id = li.attr('data-id');
              if(data_id){
                publish_pics = array_remove(publish_pics, data_id);
              }
              li.remove();
            });
        },
        onProgress: function(a,d,e,f){
            if( window.File && window.FileList){
                var g = $('#js_picQueue').find("li[id=" + a.id + "]"),
                h = d / e;
                h = (h * 100).toFixed(0) + "%";
                
                g.find(".loadingbox").find('.progress').width(h);
                g.find(".loadingbox").find('.percent').text(h);
            }
        },
        onSuccess:function(a,d,e){
             try {
                d = $.parseJSON(d)
              } catch(f) {
                d = eval( "(" + d + ")" );
            }

            var li = $('#js_picQueue').find("li[id=" + a.id + "]");

            if (d.info !='ok') {
              //  上传失败
              li.find('.loadingbox').html(d.data).css('color', 'red');
              li.find('.js_pic').attr('src', '/images/picerror.gif');
              return;
            }

            li.find('.loadingbox').remove();

            var info = d.data;

            li.attr('data-id', info.id);
          
            publish_pics.push(info.id);

            li.find('.js_pic').attr('src', info.middle);
            return ;

        },
        onComplete: function(a, d, e) {
        },
        onCancel: function(a, c) {
        },
        onValidate: function(a, b) {
            var exts = ['gif','jpeg','jpg','png'];
            if(-1 == $.inArray(b, exts)) {
                layer.msg('不允许上传该图片类型');
                return !1;
            }
            return !0;
            /*
            return a.size && a.size / 1048576 > 50 ? (mcw.message({
                msg: "抱歉，本地文件最大只支持 50M，超大文件请通过够快或者 Dropbox 上传。",
                width: 420
            }), !1) : !0
            */
        },
        onError: function(d, e, f) {
        }

  });

  }