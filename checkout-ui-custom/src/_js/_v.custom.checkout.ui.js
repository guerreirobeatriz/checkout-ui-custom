const { _locale } = require("./_locale-infos.js");
const { debounce } = require("./_utils.js");


class checkoutCustom {
  constructor({
    type = "vertical", 
    accordionPayments = true, 
    deliveryDateFormat = false,
    quantityPriceCart = false,
    showNoteField = false
  } = {}) {
    this.type = type; // ["vertical"]
    this.orderForm = ""; 
    this.orderId = this.orderForm ? this.orderForm.orderFormId : "";
    this.lang = "";

    this.accordionPayments = accordionPayments;
    this.deliveryDateFormat = deliveryDateFormat;
    this.quantityPriceCart = quantityPriceCart;
    this.showNoteField = showNoteField;

  } 


  general() {
    if(!$(".custom-cart-template-wrap").length) $(".cart-template.mini-cart .cart-fixed > *").wrapAll('<div class="custom-cart-template-wrap">');
  
    $(".table.cart-items tbody tr.product-item").each(function (w) {
      if ($(this).find(".v-custom-product-item-wrap").length > 0) return false;
      $(this).find("> *").wrapAll(`<div class="v-custom-product-item-wrap">`);
    })

    $("body").addClass("v-custom-loaded");
  }
  
  builder() {
    let _this = this;
    
    if(this.type=="vertical") {
      _this.buildVertical();
    } else if(this.type=="horizontal") {
      _this.buildHorizontal();
    } else {
      console.error("No `type` identified, check your code");
    }

    if(_this.showNoteField) {
      $("body").addClass("js-vcustom-showNoteField");
    }
  }

  buildVertical() {
    $("body").addClass("body-cart-vertical");
    $(".cart-template .cart-links-bottom:eq(0)").appendTo(".cart-template > .summary-template-holder");
    $(".cart-template .cart-more-options:eq(0), .cart-template .extensions-checkout-buttons-container").appendTo(".cart-template-holder");

  }

  buildHorizontal() {

  }

  checkEmpty(items) {
    if(items.length==0) {
      $("body").addClass("v-custom-cart-empty");
    } else {
      $("body").removeClass("v-custom-cart-empty");
    }
  }

  addEditButtoninLogin() {
    $("#v-custom-edit-login-data").remove();
    $(".client-pre-email h3.client-pre-email-h span").append(`
      <a id="v-custom-edit-login-data" class="link-box-edit btn btn-small" style="" title="${this.lang ? this.lang.editLabel:true}">
        <i class="icon-edit"></i>
        <i class="icon-spinner icon-spin icon-3x"></i>
      </a>
    `);
  }

  addStepsHeader() {

    if($(".checkout-steps").length>0) return false

    let addStepsHeaderHtml = `
      <div class="checkout-steps">
        <div class="checkout-steps-wrap">
          <span class="checkout-steps_bar">
            <span class="checkout-steps_bar_inner"></span>
            <span class="checkout-steps_bar_inner-active"></span>
          </span>
          <div class="checkout-steps_items">
            <span class="checkout-steps_item checkout-steps_item_cart js-checkout-steps-item" data-url="/checkout/#/cart">
              <span class="text">Cart</span>
            </span>
            <span class="checkout-steps_item checkout-steps_item_identification js-checkout-steps-item" data-url="/checkout/#/profile">
              <span class="text">Identification</span>
            </span>
            <span class="checkout-steps_item checkout-steps_item_shipping js-checkout-steps-item" data-url="/checkout/#/shipping">
              <span class="text">Shipping</span>
            </span>
            <span class="checkout-steps_item checkout-steps_item_payment js-checkout-steps-item" data-url="/checkout/#/payment">
              <span class="text">Payment</span>
            </span>
            <span class="checkout-steps_item checkout-steps_item_confirmation js-checkout-steps-item">
              <span class="text">Confirmation</span>
            </span>
          </div>
        </div>
      </div>
    `;
    if($("header.main-header").length) $("header.main-header .container").append(addStepsHeaderHtml);
  }

  addAssemblies(orderForm) {
    try {
      $.each(orderForm.items, function(i) {
        let _item = this;

        if(_item.assemblies.length>0) {
          let _assembliesHtml = `<div class="v-custom-assemblies">`
          $.each(_item.assemblies, function(w) {
            let _assemblies = this;

            let inptValues = _assemblies.inputValues;
            _assembliesHtml += `<p>${_assemblies.id}</p>`;
            _assembliesHtml += `<ul class="v-custom-assemblies__values">`;
              Object.entries(inptValues).forEach(([key, val]) => {
                _assembliesHtml += `<li class="v-custom-assemblies__values__item assembly-${key.toLowerCase().replace(/ /g, "-")}">
                                      <strong>${key}</strong>
                                      <span>${val.trim()}</span>
                                    </li>`;
              });
            _assembliesHtml += `</ul>`;
          })
          _assembliesHtml += `</div>`;
          $(`.table.cart-items tbody tr.product-item:eq(${i}) .v-custom-assemblies`).remove();
          $(`.table.cart-items tbody tr.product-item:eq(${i})`).addClass("v-custom-assemblies-in").find("td.product-name").append(_assembliesHtml);
        }

      })
    } catch(e) {

    }
    
  }

  bundleItems(orderForm) {
    try {
      $.each(orderForm.items, function (i) {
        if (this.bundleItems.length > 0) {
          $(`.table.cart-items tbody tr.product-item:eq(${i})`).addClass("v-custom-bundles-in").find("td.product-name");
        } else {
          $(`.table.cart-items tbody tr.product-item:eq(${i})`).removeClass("v-custom-bundles-in");
        }
      });
      $(".table.cart-items tbody tr.item-service").each(function (w) {
        if ($(this).find(".v-custom-trservice-wrap").length > 0) return false
        $(this).find("> *").wrapAll(`<div class="v-custom-trservice-wrap">`)
      })
    } catch (e) { }
  }

  showCustomMsgCoupon(orderForm) {

    let _this = this,
        _coupon = orderForm.marketingData.coupon;
    
    let couponItemsCount = orderForm.items.reduce(function (accumulator, item) {
      return accumulator + (item.priceTags.length ? item.priceTags.filter( _pricetag => { return _pricetag.ratesAndBenefitsIdentifier ? _pricetag.ratesAndBenefitsIdentifier.matchedParameters["couponCode@Marketing"] == _coupon : 0 } ).length : 0);
    }, 0);

    if(!_coupon || couponItemsCount>0)  {
      $("fieldset.coupon-fieldset").removeClass("js-vcustom-showCustomMsgCoupon");
      $(".vcustom-showCustomMsgCoupon").remove();
      return false;
    }
        
    // $(window).trigger('addMessage', {
    //   content:  {
    //     title: '',
    //     detail: `${_this.lang.couponInactive} "${_coupon}"`
    //   },
    //   type: 'info'
    // });	
    
    if($(".vcustom-showCustomMsgCoupon").length==0) $("fieldset.coupon-fieldset").addClass("js-vcustom-showCustomMsgCoupon").append(`<p class="vcustom-showCustomMsgCoupon">${_this.lang.couponInactive}</div>`);
    
  }
  addLabels(orderForm) {
    let _this = this,
        _coupon = orderForm.marketingData.coupon,
        _couponItems = [];
    if(!_coupon) return false;

    try {
      $(`.table.cart-items tbody tr.product-item, .mini-cart .cart-items li`).removeClass("v-custom-addLabels-active js-vcustom-addLabels");
      $(`.v-custom-addLabels-active-flag`).remove();
      $.each(orderForm.items, function (i) {

        if(this.priceTags.length>0) {
          if(this.priceTags.filter( _pricetag => { return _pricetag.ratesAndBenefitsIdentifier ? _pricetag.ratesAndBenefitsIdentifier.matchedParameters["couponCode@Marketing"] == _coupon : false } ).length>0) {
            _couponItems.push(this);
            $(`.table.cart-items tbody tr.product-item:eq(${i})`)
            .addClass("v-custom-addLabels-active js-vcustom-addLabels")
            .find(".product-name")
            .append(`<span class="v-custom-addLabels-active-flag">${_coupon}</span>`);
          }
        }
      });
      
      
    } catch (e) { 
      console.error(e)
    }
  }

  buildMiniCart(orderForm) {
    /* overide refresh from vtex */
    let _this = this;
    if (orderForm.items.filter(item => { return item.parentItemIndex != null }).length == 0) { return false; }
    if ($(`.mini-cart .cart-items`).text().trim()!="") {
      $(`.mini-cart .cart-items`).html(`${$(`.mini-cart .cart-items`).html()}`);
      $.each(orderForm.items, function (i) {
        if (this.availability == "available") {
          $(`.mini-cart .cart-items li:eq(${i})`).find(".item-unavailable").remove()
        }
      });
    }

  }
  
  removeMCLoader () { $(`.mini-cart .cart-items`).addClass("v-loaded"); }
  indexedInItems(orderForm) {
    let _this = this;
    try {
      if (orderForm.items.filter(item => { return item.parentItemIndex != null }).length == 0) { _this.removeMCLoader(); return false;}
      if (orderForm.items) {
        $.each(orderForm.items, function (i) {
          if (this.parentItemIndex!=null) {
            $(`.table.cart-items tbody tr.product-item:eq(${i}), .mini-cart .cart-items li:eq(${i}) `).addClass("v-custom-indexed-item")
            //$(`.table.cart-items tbody tr.product-item:eq(${i})`).appendTo(`.table.cart-items tbody tr.product-item:eq(${this.parentItemIndex})`);
            $(`.table.cart-items tbody tr.product-item:eq(${this.parentItemIndex}), .mini-cart .cart-items li:eq(${this.parentItemIndex})`).addClass("v-custom-indexedItems-in");
            
            if ($(`.mini-cart .cart-items li`).length>0) {
              $(`.mini-cart .cart-items li:eq(${i})`).appendTo(`.mini-cart .cart-items li:eq(${this.parentItemIndex})`);
            }
          }
        });
        _this.removeMCLoader();
      }
      
    } catch (e) { _this.removeMCLoader(); }
  }

  
  addBusinessDays(n, lang = i18n.options.lng) {
    let _this = this;
    let d = new Date();
    d = new Date(d.getTime());
    let day = d.getDay();
    d.setDate(d.getDate() + n + (day === 6 ? 2 : +!day) + (Math.floor((n - 1 + (day % 6 || 1)) / 5) * 2));
    
    let doptions = { weekday: 'long', month: 'short', day: 'numeric' };

    if(lang=="pt") doptions = { weekday: 'short', month: 'short', day: 'numeric' };

    if( (d.getDate() - new Date().getDate()) == 1 ) return _this.lang.tomorrowLabel||"Tomorrow";
    d = d.toLocaleDateString(lang, doptions);
    
    return d
  }

  changeShippingTimeInfo() {
    let _this = this;
    $("body").addClass("v-custom-changeShippingTimeInfo");
    let mainSTIelems = [
      ".shp-summary-package-time > span", 
      "p.vtex-omnishipping-1-x-sla.sla", 
      ".vtex-omnishipping-1-x-leanShippingTextLabelSingle > span",
      "span.shipping-date",
      ".shp-option-text-time",
      ".pkpmodal-pickup-point-sla",
      ".shp-option-text-package"
    ];
    try {
      $(`
        .vtex-omnishipping-1-x-summaryPackage.shp-summary-package:not(.v-changeShippingTimeInfo-active), 
        .vtex-omnishipping-1-x-leanShippingOption, 
        .vtex-omnishipping-1-x-packageItem:not(.v-changeShippingTimeInfo-active),
        .orderform-template .cart-template.mini-cart .item,
        .vtex-pickup-points-modal-3-x-pickupPointSlaAvailability        
      `).each(function(i) {
        let txtselectin = $(this).find(mainSTIelems.map(elem => elem+":not(.v-changeShippingTimeInfo-elem-active)").join(", ")).text();
        if(txtselectin!="" && txtselectin.match(/(day)|(dia)/gm)) {
          let days = parseInt(txtselectin.match(/\d+/));
          if(days) {
            let _delivtext = _this.lang.deliveryDateText;
            if(!! $(this).find(mainSTIelems.join(", ")).text().toLowerCase().match(/(ready in up)|(pronto)/gm)) _delivtext = _this.lang.PickupDateText; // check if is pickup. OBS: none of others solutions worked, needs constantly update
            $(this).find(mainSTIelems.join(", ")).html(`${_delivtext} <strong>${_this.addBusinessDays(days)}</strong>`).addClass("v-changeShippingTimeInfo-elem-active");
          }
        }
        $(this).addClass("v-changeShippingTimeInfo-active");
      });
    } catch(e) {}
  }

  changeShippingTimeInfoInit() {
    let _this = this;
    if(_this.lang && _this.deliveryDateFormat) {
      _this.changeShippingTimeInfo();
    }
  }

  enchancementTotalPrice(orderForm) {
    let _this = this;

    if(!_this.quantityPriceCart) return;
    try {
      $.each(orderForm.items, function(i) {
        let _item = this;
        let _trElem = $(`.table.cart-items tbody tr.product-item:eq(${i})`);

       
        if(_item.quantity==1 || _trElem.find("td.product-price").find(".best-price").length==0) return;

        let totalValue = _trElem.find(".total-selling-price").text()
        let _eachprice = `
          <div class="v-custom-quantity-price vqc-ldelem">
            <span class="v-custom-quantity-price__list">
              ${_item.listPrice > _item.sellingPrice ? `<span class="v-custom-quantity-price__list--list">${orderForm.storePreferencesData.currencySymbol} ${(_item.listPrice/100).toFixed(2)}</span>` : ""}
            </span>
          </div>
        `;
        _trElem.find("td.product-price").find(".vqc-ldelem").remove();
        //_trElem.find("td.quantity-price").prepend(_eachprice);
        _trElem.find("td.product-price")
        .addClass("v-custom-quantity-price-active")
        .prepend(_eachprice)
        .append(`<div class="v-custom-quantity-price vqc-ldelem"><span class="v-custom-quantity-price__best">${totalValue}</span></div>`);
        //console.log(_trElem.find("td.product-price").find(".best-price"), _trElem.find(".js-v-custom-quantity-price").length)
        _trElem.find("td.product-price").find("> .best-price").wrap(`<div class="v-custom-quantity-price__list--selling"></div>`);
        _trElem.find("td.product-price").find(".v-custom-quantity-price__list--selling").append(`<span class="vqc-ldelem"> ${_this.lang.eachLabel}</span>`);

      })
    } catch(e) {

    }
  }

  update(orderForm) {
    let _this = this;

    this.checkEmpty(orderForm.items);
    this.addAssemblies(orderForm);
    this.enchancementTotalPrice(orderForm);
    this.bundleItems(orderForm);
    this.buildMiniCart(orderForm);
    this.indexedInItems(orderForm);

    
    // debounce to prevent append from default script
    let updateDebounce = (debounce(function() {
      if(orderForm.marketingData) {
        _this.addLabels(orderForm);
        _this.showCustomMsgCoupon(orderForm);
      }
    }, 250));
    updateDebounce();
    
    
    
  }

  updateStep() {

    let prefixClass = "v-custom-step-";
    let bClassStep = [
      "cart",
      "email",
      "profile",
      "shipping",
      "payment"
    ];

    $("body").removeClass(bClassStep.map(step => { return prefixClass+step }).join(" "))
    if(window.location.hash) {
      let hashstep = window.location.hash.split("/")[1];
      if(typeof bClassStep.find(st => { return st==hashstep })) {
        $("body").addClass(prefixClass+hashstep)
      }
    }
    
  }

  updateLang(orderForm) {
    this.lang = _locale[orderForm.storePreferencesData.countryCode];

    if (!this.lang) return false;
    const _lang = this.lang;

    if(_lang.editLabel)  $(".link-box-edit").attr("title", _lang.editLabel);
    if(_lang.cartSubmitButton) $("#cart-to-orderform").text(_lang.cartSubmitButton)

    if(_lang.cartNoteLabel) $("p.note-label label").text(_lang.cartNoteLabel)

    if(_lang.identifiedUserMessage) $(".identified-user-modal-body p.identified-user-message").html(_lang.identifiedUserMessage)

    //paypal
    if(_lang.paypalPhone) $(".payment-paypal-help-number").text(_lang.paypalPhone);

    if (_lang.paypalImg) {
      $(".payment-paypal-title-short-logo").css("background-image", `url(${_lang.paypalImg})`);
    } else if (_lang.paypalImg=="") {
      $(".payment-paypal-title-short-logo").hide();
    }
    
  }

  paymentBuilder() {
    let _this = this;

    
    if(_this.orderForm && $(".payment-group-item-cards").length == 0) {
      if(_this.orderForm.paymentData) {
        let paymentGroupCardsHtml = `<span class="payment-group-item-cards">`;
        $.each(_this.orderForm.paymentData.paymentSystems.filter( item => item.groupName=="creditCardPaymentGroup"), function (i) {
          paymentGroupCardsHtml += `<span class="card-flag ${this.name}">${this.name}</span>`;
        });
        paymentGroupCardsHtml += `</span>`;

        if(_this.accordionPayments) {
          $("#payment-group-creditCardPaymentGroup").append(paymentGroupCardsHtml);
        } else {
          $("#iframe-placeholder-creditCardPaymentGroup").prepend(paymentGroupCardsHtml);
        }
      }
    }


    if(!this.accordionPayments || $(".payment-group-list-btn").find(".v-custom-payment-item-wrap").length > 0) return false

    $("body").addClass("v-custom-paymentBuilder-accordion");

    $(".payment-group-item").each(function(i) {
      $(this).wrap(`<div class='v-custom-payment-item-wrap ${ $(this).hasClass("active") ? "active" : "" }'></div>`);
    });

    $(".payment-group-item").each(function(i) {
      $(`#payment-data .steps-view > div:eq(${0})`).appendTo($(this).closest(".v-custom-payment-item-wrap"));
    });
    
    

  }

  bind() {
    let _this = this;
    $("body").on("click", "#v-custom-edit-login-data", function(e) {

      e.preventDefault();

      $(this).addClass("active");

      var data = null;
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) { 
          location.reload(); 
          setTimeout(function() {
            $("#v-custom-edit-login-data").removeClass("active");
          },1000)
        }
      });

      xhr.open("GET", `/checkout/changeToAnonymousUser/${_this.orderForm.orderFormId}`);
      xhr.setRequestHeader("content-type", "application/json");
      xhr.setRequestHeader("accept", "application/json");

      xhr.send(data);


    })

    $("body").on("click", ".v-custom-payment-item-wrap", function(e) {
      $(".v-custom-payment-item-wrap").removeClass("active")
      $(this).addClass("active")
    });

    $("body").on("click", ".vtex-pickup-points-modal-3-x-pickupDetailsHeaderButton, #map-canvas img, .vtex-omnishipping-1-x-pickupPointChange, .pkpmodal-pickup-point, .vtex-pickup-points-modal-3-x-modalDetailsBackLnk", function(e) {
      setTimeout(() => {
        _this.changeShippingTimeInfoInit();
      }, 100);
    });

    $("body").on("click", ".js-checkout-steps-item .text", function(e) {
      window.location = $(this).closest(".checkout-steps_item").attr("data-url");
    });

  }

  init() {
    let _this = this;
    
    _this.orderForm = vtexjs.checkout.orderForm ? vtexjs.checkout.orderForm : false;
    _this.general();
    _this.updateStep();
    _this.addStepsHeader();
    _this.builder();
    _this.paymentBuilder();
    _this.changeShippingTimeInfoInit();
    if (_this.orderForm) {
      _this.updateLang(_this.orderForm)
      _this.update(_this.orderForm);
    }
    _this.addEditButtoninLogin();

  }
  
  start() {
    let _this = this;
    try {
      $(function() {
        _this.bind(); 
      });

      $(document).ajaxComplete(function() {
        _this.init();
      })


      $(window).on('hashchange', function() {
        _this.updateStep();
        _this.changeShippingTimeInfoInit()
        _this.paymentBuilder();
        if(_this.orderForm) {
          _this.buildMiniCart(_this.orderForm);
          _this.indexedInItems(_this.orderForm);
          _this.updateLang(_this.orderForm)
        }
      });

      $(window).on('orderFormUpdated.vtex', function(evt, orderForm) {
        _this.update(orderForm);
      })

      console.log(`🎉 Yay! You are using the vtex.checkout.ui customization !!`);
    }
    catch(e) {
      _this.general();
    }
    
  }
}

module.exports = checkoutCustom;

