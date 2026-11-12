jQuery(function (jQuery) {



  if (jQuery(".wpcf7c-elm-step1").length != 0) {
    // 対象有り

    jQuery(".wpcf7c-elm-step1").each(function () {
      // 親のフォームを検索
      var parent = jQuery(this).closest("form");
      if (parent.length && parent.attr("wpcf7c") == undefined) {
        // elm-submitをsubmitボタンへもセット
        parent.find(".wpcf7-submit").addClass("wpcf7c-elm-step2").addClass("wpcf7c-force-hide");
        parent.find(".ajax-loader").addClass("wpcf7c-elm-step2").addClass("wpcf7c-force-hide");

        // ajax用ID退避,処理済みフラグセット
        var hidden_wpcf7 = parent.find("input[name=_wpcf7]");
        var _wpcf7 = hidden_wpcf7.val();
        parent.attr("wpcf7c", _wpcf7);

        parent.attr("step", 1);

        if (!parent.find('input[name="_wpcf7c"]').length) {
          hidden_wpcf7.after('<input type="hidden" name="_wpcf7c" value="step1" />');
        }
        parent.find('input[name="_wpcf7c"]').val('step1');

        //parent.find("input[name=_wpcf7]").val("");

        // 不要要素非表示
        parent.find(".wpcf7c-elm-step2").addClass("wpcf7c-force-hide");
        parent.find(".wpcf7c-elm-step3").addClass("wpcf7c-force-hide");
        parent.find(".wpcf7c-elm-step1").removeClass("wpcf7c-force-hide");

        // 戻って編集ボタン挙動
        parent.find(".wpcf7c-btn-back").on("click", function () {
          wpcf7c_to_step1(parent, true);
          return false;
        });
      }




    });



  }

});

// Save only the state of fields this plugin changes.
var wpcf7c_remember_field = function (field) {
  var element = jQuery(field);
  if (element.data('wpcf7c-original-state') === undefined) {
    element.data('wpcf7c-original-state', {
      disabled: field.disabled,
      readOnly: field.readOnly,
      height: field.style.height,
      step1: element.hasClass('wpcf7c-elm-step1')
    });
  }
};

var wpcf7c_to_step1 = function (parent, scroll) {
  parent.find(".wpcf7c-conf-hidden").remove();
  parent.find(".wpcf7c-conf").each(function () {
    var element = jQuery(this);
    var state = element.data('wpcf7c-original-state');
    if (state) {
      this.disabled = state.disabled;
      if (state.readOnly !== undefined) {
        this.readOnly = state.readOnly;
      }
      this.style.height = state.height;
      if (this.type === 'file' && !state.step1) {
        element.removeClass('wpcf7c-elm-step1 wpcf7c-force-hide');
      }
      element.removeData('wpcf7c-original-state');
    } else {
      element.removeAttr('disabled').removeAttr('readonly');
    }
    element.removeClass('wpcf7c-conf');
  });

  parent.find(".wpcf7c-elm-step2").addClass("wpcf7c-force-hide");
  parent.find(".wpcf7c-elm-step3").addClass("wpcf7c-force-hide");
  parent.find(".wpcf7c-elm-step1").removeClass("wpcf7c-force-hide");

  parent.find("input[name=_wpcf7c]").val("step1");
  parent.attr("step", 1).removeClass("wpcf7c-step2-active");

  var responseOutput = parent.find('div.wpcf7-response-output');
  responseOutput.removeClass("wpcf7c-force-hide");
  responseOutput.removeClass("wpcf7-mail-sent-ng");
  if (scroll) {
    //responseOutput.css("display", "none");
    responseOutput.addClass("wpcf7c-force-hide");
  }

  parent.find(".ajax-loader").addClass("wpcf7c-elm-step2").addClass("wpcf7c-force-hide");

  // スムーズスクロール
  if (scroll) {
    // スムーズスクロール
    setTimeout(function () {
      wpcf7c_scroll(parent.find("input[name=_wpcf7_unit_tag]").val())
    }, 100);
  }

}


var wpcf7c_step1 = function (unit_tag) {
  // 確認完了

  // 対象フォーム検索
  //var elm_unit_tag = jQuery.find("input[name=_wpcf7_unit_tag]");
  jQuery(jQuery.find("input[name=_wpcf7_unit_tag]")).each(function () {
    if (jQuery(this).val() == unit_tag) {
      var parent = jQuery(this).closest("form");
      // Do not duplicate hidden fields when a confirmation event is repeated.
      if (parent.attr('step') === '2') {
        return;
      }

      var responseOutput = parent.find('div.wpcf7-response-output');
      responseOutput.addClass("wpcf7c-force-hide");

      // 確認画面表示
      // テキストエリアを伸ばす
      parent.find("textarea").each(function () {
        if (jQuery(this).is(':disabled')) {
          return;
        }
        wpcf7c_remember_field(this);
        if (this.scrollHeight > this.offsetHeight) {
          this.style.height = (this.scrollHeight + 10) + 'px';
        }
        jQuery(this).prop("readOnly", true).addClass("wpcf7c-conf");
      });
      parent.find("select").each(function () {
        var field = jQuery(this);
        if (field.is(':disabled')) {
          return;
        }
        wpcf7c_remember_field(this);
        var values = field.val();
        values = values == null ? [] : (Array.isArray(values) ? values : [values]);
        field.prop("disabled", true).addClass("wpcf7c-conf");
        // A multiple select needs one hidden input per selected option.
        if (field.attr('name')) {
          jQuery.each(values, function (index, value) {
            field.before(jQuery('<input type="hidden" />')
              .attr('name', field.attr('name')).val(value).addClass('wpcf7c-conf-hidden'));
          });
        }
      });
      parent.find("input").each(function () {
        if (jQuery(this).is(':disabled')) {
          return;
        }
        switch (this.type) {
          case "submit":
          case "button":
          case "hidden":
          case "image":
          case "reset":
            // なにもしない
            break;
          case "radio":
          case "checkbox":
            // 選択されているものだけ対処
            wpcf7c_remember_field(this);
            jQuery(this).prop("disabled", true).addClass("wpcf7c-conf");
            if (jQuery(this).is(":checked") && this.name) {
              jQuery(this).after(
                jQuery('<input type="hidden" />').attr("name", jQuery(this).attr("name")).val(jQuery(this).val()).addClass("wpcf7c-conf-hidden")
              );
            }
            break;
          case "file":
            wpcf7c_remember_field(this);
            jQuery(this).addClass("wpcf7c-conf wpcf7c-elm-step1 wpcf7c-force-hide");
            jQuery(this).after(
              jQuery('<input type="text" />').attr("name", (jQuery(this).attr("name") + "_conf")).val(jQuery(this).val()).addClass("wpcf7c-conf-hidden").addClass("wpcf7c-conf").attr("readonly", true).attr("disabled", true)
            );

            break;
          default:
            wpcf7c_remember_field(this);
            // Readonly controls are submitted normally; do not duplicate their names.
            jQuery(this).prop("readOnly", true).addClass("wpcf7c-conf");
            break;
        }
      });

      // 表示切替
      parent.find(".wpcf7c-elm-step1").addClass("wpcf7c-force-hide");
      parent.find(".wpcf7c-elm-step3").addClass("wpcf7c-force-hide");
      parent.find(".wpcf7c-elm-step2").removeClass("wpcf7c-force-hide");

      parent.find(".ajax-loader").removeClass("wpcf7c-force-hide");

      parent.find("input[name=_wpcf7c]").val("step2");
      parent.attr("step", 2).addClass("wpcf7c-step2-active");

      // スムーズスクロール
      setTimeout(function () {
        wpcf7c_scroll(unit_tag)
      }, 100);


    }
  });
}

var wpcf7c_scroll = function (unit_tag) {
  // エラーの時などにアンカーまでスクロール
  jQuery(jQuery.find("input[name=_wpcf7_unit_tag]")).each(function () {
    if (jQuery(this).val() == unit_tag) {
      var parent = jQuery(this).closest("form");
      var speed = 1000;
      var position = parent.offset().top;
      if (jQuery('.wpcf7c-anchor').length != 0) {
        position = jQuery('.wpcf7c-anchor').offset().top;
      }
      jQuery("html, body").animate({
        scrollTop: position
      }, speed, "swing");
    }
  });
}

var wpcf7c_step2 = function (unit_tag) {
  // 確認完了

  // 対象フォーム検索
  //var elm_unit_tag = jQuery.find("input[name=_wpcf7_unit_tag]");
  jQuery(jQuery.find("input[name=_wpcf7_unit_tag]")).each(function () {
    if (jQuery(this).val() == unit_tag) {
      var parent = jQuery(this).closest("form");


      var responseOutput = parent.find('div.wpcf7-response-output');
      responseOutput.removeClass("wpcf7c-force-hide");

      // step1状態の画面表示
      wpcf7c_to_step1(parent);

      // step3の要素があれば、それに切り替える
      if (parent.find(".wpcf7c-elm-step3").length != 0) {
        // 表示切替
        parent.find(".wpcf7c-elm-step1").addClass("wpcf7c-force-hide");
        parent.find(".wpcf7c-elm-step2").addClass("wpcf7c-force-hide");
        parent.find(".wpcf7c-elm-step3").removeClass("wpcf7c-force-hide");
      }


    }
  });
}

var wpcf7c_step2_error = function (unit_tag) {
  jQuery(jQuery.find("input[name=_wpcf7_unit_tag]")).each(function () {
    if (jQuery(this).val() == unit_tag) {
      var parent = jQuery(this).closest("form");

      var responseOutput = parent.find('div.wpcf7-response-output');
      responseOutput.removeClass("wpcf7c-force-hide");
    }
  });

}


// Match the exact form instance; forms without a confirmation step are untouched.
var wpcf7c_event_form = function (event) {
  var detail = event.detail || {};
  if (!detail.unitTag) {
    return jQuery();
  }
  return jQuery('input[name="_wpcf7_unit_tag"]').filter(function () {
    return this.value === detail.unitTag;
  }).closest('form[wpcf7c]');
};

document.addEventListener('wpcf7beforesubmit', function (event) {
  // A previous confirmation/back action may have hidden CF7's response box.
  wpcf7c_event_form(event).find('.wpcf7-response-output')
    .removeClass('wpcf7c-force-hide');
}, false);

document.addEventListener('wpcf7submit', function (event) {
  var parent = wpcf7c_event_form(event);
  if (!parent.length) {
    return;
  }
  var detail = event.detail || {};
  var status = (detail.apiResponse && detail.apiResponse.status) || detail.status;

  switch (status) {
    case 'wpcf7c_confirmed':
      wpcf7c_step1(detail.unitTag);
      break;
    case 'mail_sent':
      wpcf7c_step2(detail.unitTag);
      break;
    case 'validation_failed':
    case 'acceptance_missing':
      // Unlock the form so that the user can correct server-side errors.
      wpcf7c_to_step1(parent, false);
      wpcf7c_step2_error(detail.unitTag);
      break;
    default:
      // Includes spam, aborted and mail_failed. Never present these as success.
      wpcf7c_step2_error(detail.unitTag);
      break;
  }
}, false);
