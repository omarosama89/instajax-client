"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define("xgram-frontend/adapters/application", ["exports", "ember-data", "xgram-frontend/config/environment"], function (exports, _emberData, _xgramFrontendConfigEnvironment) {
  exports["default"] = _emberData["default"].JSONAPIAdapter.extend({
    host: _xgramFrontendConfigEnvironment["default"].host
  });
});
define('xgram-frontend/adapters/order-row', ['exports', 'xgram-frontend/adapters/application'], function (exports, _xgramFrontendAdaptersApplication) {
  exports['default'] = _xgramFrontendAdaptersApplication['default'].extend({
    pathForType: function pathForType(type) {
      return Ember.String.underscore(type) + 's';
    }
  });
});
define('xgram-frontend/adapters/subscription-service', ['exports', 'xgram-frontend/adapters/application'], function (exports, _xgramFrontendAdaptersApplication) {
  exports['default'] = _xgramFrontendAdaptersApplication['default'].extend({
    pathForType: function pathForType(type) {
      return Ember.String.underscore(type) + 's';
    }
  });
});
define('xgram-frontend/app', ['exports', 'ember', 'xgram-frontend/resolver', 'ember-load-initializers', 'xgram-frontend/config/environment'], function (exports, _ember, _xgramFrontendResolver, _emberLoadInitializers, _xgramFrontendConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _xgramFrontendConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _xgramFrontendConfigEnvironment['default'].podModulePrefix,
    Resolver: _xgramFrontendResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _xgramFrontendConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('xgram-frontend/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'xgram-frontend/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _xgramFrontendConfigEnvironment) {

  var name = _xgramFrontendConfigEnvironment['default'].APP.name;
  var version = _xgramFrontendConfigEnvironment['default'].APP.version;

  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});
define('xgram-frontend/components/cancel-modal', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define('xgram-frontend/components/error-wrapper', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div'
  });
});
define('xgram-frontend/components/index-component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    urls: _ember['default'].inject.service(),
    store: _ember['default'].inject.service(),
    serviceId: null,
    selectedService: null,
    orderRow: null,
    subscription: null,
    username: null,
    notification_text: null,
    notification_flag: false,
    i18n: _ember['default'].inject.service(),
    didRender: function didRender() {
      _ember['default'].$('#preloader').delay(1000).fadeOut('slow');
      _ember['default'].$('#status').fadeOut(); //
      _ember['default'].$('body').delay(350).css({
        'overflow': 'visible'
      });

      _ember['default'].$("a").on('click', function (event) {
        if (this.hash !== "") {
          event.preventDefault();
          var hash = this.hash;
          _ember['default'].$('html, body').animate({
            scrollTop: _ember['default'].$(hash).offset().top
          }, 800, function () {
            window.location.hash = hash;
          });
        }
      });
      _ember['default'].$('.counter').countUp({ 'time': 2000, 'delay': 10 });
      _ember['default'].$(window).scroll(function () {
        if (_ember['default'].$(window).scrollTop() > 10) {
          _ember['default'].$(".top-header").addClass("scroll");
        } else {
          _ember['default'].$(".top-header").removeClass("scroll");
        }
      });
      var orderRowsCount = this.get('store').peekAll('order-row').get('length');
      var subscriptionsCount = this.get('store').peekAll('subscription').get('length');
      if (orderRowsCount || subscriptionsCount) {
        _ember['default'].$('#thankModal').modal({ backdrop: 'static', keyboard: false });
      }
      var self = this;
      // new Ember.RSVP.Promise(function (resolve, reject) {
      //   Ember.$.ajax({
      //     type: "GET",
      //     url: self.get('urls').getUrlWithId('notifications', 1),
      //     contentType: 'application/json;charset=utf-8',
      //     dataType: 'json',
      //     crossDomain: true,
      //   }).then(function (response, status, xhr) {
      //     self.set('notification_text', response.text);
      //     self.set('notification_flag', response.active);
      //   }, function (error) {
      //     self.set('errors.username', JSON.parse(error.responseText).error_message);
      //   });
      // });
    },
    actions: {
      changeLanguage: function changeLanguage() {
        var self = this;
        var locale = this.get('i18n.locale') == 'en' ? 'ar' : 'en';
        new _ember['default'].RSVP.Promise(function (resolve, reject) {
          _ember['default'].$.ajax({
            type: "POST",
            url: self.get('urls').getUrl('setLocale'),
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
              locale: locale
            }),
            crossDomain: true
          }).then(function (response, status, xhr) {
            self.set('i18n.locale', response.locale);
          });
        });
      }
    }
  });
});
define('xgram-frontend/components/main-section', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    i18n: _ember['default'].inject.service(),
    store: _ember['default'].inject.service(),
    urls: _ember['default'].inject.service(),
    services: null,
    selectedService: null,
    username: null,
    usernameErrorFlag: true,
    photos: null,
    followersAmount: null,
    followersAmountErrorFlag: true,
    errors: {},
    isLoadingPosts: false,
    isLoadingCheckout: false,
    mode: 'automatic',
    actions: {
      setSelectedService: function setSelectedService(id) {
        this.get('store').peekAll('photo').forEach(function (photo) {
          photo.set('isSelected', false);
          photo.set('amount', 0);
          photo.set('errorError', '');
          photo.set('amountErrorFlag', false);
          _ember['default'].$('#div-' + photo.get('id')).removeClass('checked');
        });
        var selectedService = this.get('store').peekRecord('service', id);
        this.set('selectedService', selectedService);
        this.set('errors.service', '');
      },
      openBrowsePostsModal: function openBrowsePostsModal() {
        var self = this;
        self.get('store').unloadAll('photo');
        self.set('errors.username', '');
        self.set('errors.browsePosts', '');
        if (self.get('selectedService') !== null) {
          if (self.get('username') !== '' && self.get('username') !== null) {
            self.set('isLoadingPosts', true);
            new _ember['default'].RSVP.Promise(function (resolve, reject) {
              _ember['default'].$.ajax({
                type: "GET",
                url: self.get('urls').getUrlWithUsername('getPosts', self.get('username')),
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                crossDomain: true
              }).then(function (response, status, xhr) {
                _ember['default'].$('#selectPosts').modal({
                  backdrop: 'static',
                  keyboard: false
                });
                self.set('isLoadingPosts', false);
                self.get('store').pushPayload('user', response);
              }, function (error) {
                self.set('isLoadingPosts', false);
                self.set('errors.username', JSON.parse(error.responseText).error_message);
              });
            });
          } else {
            self.set('errors.username', self.get('i18n').t('errorMessages.client.username.empty'));
          }
        } else {
          self.set('errors.service', self.get('i18n').t('errorMessages.service.empty'));
        }
      },
      openCheckoutModal: function openCheckoutModal() {
        var errorFlag = false;
        var self = this;
        if (self.get('selectedService') !== null) {
          if (self.get('selectedService.serviceFamily') == 'followers') {
            if (self.get('username') !== '' && self.get('username') !== null) {
              self.set('isLoadingCheckout', true);
              new _ember['default'].RSVP.Promise(function (resolve, reject) {
                _ember['default'].$.ajax({
                  type: "GET",
                  url: self.get('urls').getUrlWithUsername('checkUsername', self.get('username')),
                  contentType: 'application/json;charset=utf-8',
                  dataType: 'json',
                  crossDomain: true
                }).then(function (response, status, xhr) {
                  self.set('errors.username', '');
                  self.set('usernameErrorFlag', false);
                  self.set('isLoadingCheckout', false);
                  if (!self.get('usernameErrorFlag') && !self.get('followersAmountErrorFlag')) {
                    _ember['default'].$('#orderCheckout').modal({ backdrop: 'static', keyboard: false });
                  }
                }, function (error) {
                  self.set('usernameErrorFlag', true);
                  self.set('isLoadingCheckout', false);
                  self.set('errors.username', JSON.parse(error.responseText).error_message);
                });
              });
              var min = this.get('selectedService.minimum');
              var max = this.get('selectedService.maximum');
              if (self.get('followersAmount') < min) {
                // errorFlag |= true;
                self.set('followersAmountErrorFlag', true);
                self.set('errors.followersAmount', self.get('i18n').t('errorMessages.service.min') + min);
              } else if (self.get('followersAmount') > max) {
                // errorFlag |= true;
                self.set('followersAmountErrorFlag', true);
                self.set('errors.followersAmount', self.get('i18n').t('errorMessages.service.max') + max);
              } else {
                errorFlag |= false;
                self.set('followersAmountErrorFlag', false);
                self.set('errors.followersAmount', '');
              }
            } else {
              self.set('errors.username', self.get('i18n').t('errorMessages.client.username.empty'));
            }
          } else {
            var selectedPhotosCount = self.get('store').peekAll('photo').filterBy('isSelected', true).get('length');
            if (selectedPhotosCount) {
              _ember['default'].$('#orderCheckout').modal({ backdrop: 'static', keyboard: false });
            } else {
              self.set('errors.browsePosts', 'Select posts first');
            }
          }
        } else {
          self.set('errors.service', self.get('i18n').t('errorMessages.service.empty'));
        }
      },
      checkUsernameValidity: function checkUsernameValidity() {}
    }
  });
});
define('xgram-frontend/components/main-section/browse-posts-modal', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    store: _ember['default'].inject.service(),
    i18n: _ember['default'].inject.service(),
    linkService: _ember['default'].inject.service('link-service'),
    variable: "ssssss",
    photos: _ember['default'].computed(function () {
      return this.get('store').peekAll('photo');
    }),
    links: _ember['default'].computed(function () {
      return this.get('store').peekAll('link');
    }),
    selectedService: null,
    selectedPhotos: null,
    photoId: null, // only for custom comments
    followersAmount: null,
    link: null,
    amount: null,
    errors: {},
    didRender: function didRender() {
      var self = this;
      _ember['default'].$(".post-content>img").click(function () {
        var checkbox = _ember['default'].$(this).parent().find(".checkbox");
        if (checkbox.checked) {} else {
          _ember['default'].$(this).parent().addClass('checked');
          checkbox.prop('checked', true);
          var id = checkbox.prop('id');
          var photo = self.get('store').peekRecord('photo', id);
          photo.set('isSelected', true);
          _ember['default'].$('#btn-cc-' + id).prop('disabled', false);
          if (self.get('selectedService.serviceFamily') == 'custom_comments') {
            self.set('photoId', id);
            _ember['default'].$('#addComments').modal({ backdrop: 'static', keyboard: false });
          }
        }
      });
      _ember['default'].$(".checkbox").click(function () {

        _ember['default'].$(this).parent().removeClass('checked');
        _ember['default'].$(this).prop('checked', false);
        var id = _ember['default'].$(this).prop('id');
        var photo = self.get('store').peekRecord('photo', id);
        photo.set('isSelected', false);
        _ember['default'].$('#btn-cc-' + id).prop('disabled', true);
      });
    },
    actions: {
      validatePhotos: function validatePhotos() {
        var self = this;
        if (this.get('mode') == 'automatic') {
          var selectedPhotos = this.get('store').peekAll('photo').filterBy('isSelected', true);
          var min = this.get('selectedService.minimum');
          var max = this.get('selectedService.maximum');
          var errorFlag = false;
          if (selectedPhotos.get('length')) {
            selectedPhotos.forEach(function (photo) {
              if (photo.get('amount') < min) {
                photo.set('errorMessage', self.get('i18n').t('errorMessages.service.min') + min);
                photo.set('amountErrorFlag', true);
              } else if (photo.get('amount') > max) {
                photo.set('errorMessage', self.get('i18n').t('errorMessages.service.max') + max);
                photo.set('amountErrorFlag', true);
              } else {
                photo.set('errorMessage', '');
                photo.set('amountErrorFlag', false);
              }
            });
            selectedPhotos.forEach(function (photo) {
              errorFlag |= photo.get('amountErrorFlag');
            });
            if (!errorFlag) {
              _ember['default'].$('#selectPosts').modal('hide');
              _ember['default'].$('#orderCheckout').modal({ backdrop: 'static', keyboard: false });
            }
          } else {
            // self.set('errors.browsePosts', 'Select Posts first')
          }
        } else {
            if (self.get('links.length') == 0) {
              self.set('errors.links', 'You have to add link first');
            } else {
              _ember['default'].$('#selectPosts').modal('hide');
              _ember['default'].$('#orderCheckout').modal({ backdrop: 'static', keyboard: false });
            }
          }
      },
      insertLink: function insertLink() {
        var min = this.get('selectedService.minimum');
        var max = this.get('selectedService.maximum');
        if (this.get('link') != '' && this.get('link') != null && this.get('amount') != '' && this.get('amount') != null) {
          if (this.get('amount') < this.get('selectedService.minimum')) {
            this.set('errors.errorMessage', self.get('i18n').t('errorMessages.service.min') + min);
          } else if (this.get('amount') > this.get('selectedService.maximum')) {
            this.set('errors.errorMessage', self.get('i18n').t('errorMessages.service.min') + min);
          } else {
            this.get('store').pushPayload('link', {
              link: {
                id: this.get('linkService').getAutoIdForLink(),
                link: this.get('link'),
                amount: this.get('amount')
              }
            });
            this.set('link', '');
            this.set('amount', '');
            this.set('errors.errorMessage', '');
            this.set('errors.links', '');
          }
        }
      },
      removeLink: function removeLink(id) {
        var link = this.get('store').peekRecord('link', id);
        link.unloadRecord();
      },
      switchMode: function switchMode() {
        var mode = this.get('mode');
        if (mode == 'automatic') {
          this.set('mode', 'manual');
        } else {
          this.set('mode', 'automatic');
        }
      }
    }
  });
});
define('xgram-frontend/components/main-section/browse-posts/custom-comments-modal', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    store: _ember['default'].inject.service(),
    i18n: _ember['default'].inject.service(),
    commentService: _ember['default'].inject.service('comment-service'),
    photoId: null,
    comments: _ember['default'].computed('photoId', function () {
      return this.get('store').peekAll('comment');
    }),
    text: null,
    selectedService: null,
    errorMessage: '',
    didInsertElement: function didInsertElement() {
      _ember['default'].$('#addComments').on('show.bs.modal', function () {
        _ember['default'].$('#selectPosts').modal('hide');
      });
      _ember['default'].$('#addComments').on('hidden.bs.modal', function () {
        _ember['default'].$('#selectPosts').modal({ backdrop: 'static', keyboard: false });
      });
    },
    actions: {
      insertComment: function insertComment() {
        if (this.get('text') != '' && this.get('text') != null) {
          this.get('store').pushPayload('comment', {
            comment: {
              id: this.get('commentService').getAutoIdForComment(),
              text: this.get('text'),
              photo_id: this.get('photoId')
            }
          });
          this.set('text', '');
        }
      },
      removeComment: function removeComment(id) {
        var comment = this.get('store').peekRecord('comment', id);
        comment.unloadRecord();
      },
      validateComments: function validateComments() {
        var min = this.get('selectedService.minimum');
        var max = this.get('selectedService.maximum');
        var selectedPhoto = this.get('store').peekRecord('photo', this.get('photoId'));
        var count = selectedPhoto.get('comments.length');
        selectedPhoto.set('amount', count);
        // var errorFlag = false;
        if (count < min) {
          this.set('errorMessage', self.get('i18n').t('errorMessages.service.min') + min);
          // errorFlag = true;
        } else if (count > max) {
            this.set('errorMessage', self.get('i18n').t('errorMessages.service.max') + max);
            // errorFlag = true;
          } else {
              this.set('errorMessage', '');
              _ember['default'].$('#addComments').modal('hide');
              // errorFlag = false;
            }
      }
    }
  });
});
define('xgram-frontend/components/main-section/browse-posts/error-wrapper', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define('xgram-frontend/components/main-section/checkout-modal', ['exports', 'ember', 'xgram-frontend/config/environment'], function (exports, _ember, _xgramFrontendConfigEnvironment) {
  exports['default'] = _ember['default'].Component.extend({
    store: _ember['default'].inject.service(),
    i18n: _ember['default'].inject.service(),
    urls: _ember['default'].inject.service(),
    paypalFormAction: _ember['default'].computed(function () {
      return _xgramFrontendConfigEnvironment['default'].host + '/order_rows/create';
    }),
    stripeFormAction: _ember['default'].computed(function () {
      return _xgramFrontendConfigEnvironment['default'].host + '/order_rows/create_stripe';
    }),
    errorFlag: false,
    errorMessage: '',
    selectedPhotos: null,
    selectedService: null,
    isLoading: false,
    photos: _ember['default'].computed(function () {
      return this.get('store').peekAll('photo');
    }),
    photosObserver: _ember['default'].observer('photos.@each.isSelected', function () {
      this.set('selectedPhotos', this.get('photos').filterBy('isSelected', true));
    }),
    links: _ember['default'].computed(function () {
      return this.get('store').peekAll('link');
    }),
    linksStr: '',
    amountsStr: '',
    commentsStr: '',
    errors: null,
    cost: null,
    costIso: null,
    costIsoObserver: _ember['default'].observer('cost', function () {
      var costIso = this.get('cost') * 100;
      _ember['default'].$('#stripe-form').append('<script id="stripe-form-script" src="https://checkout.stripe.com/checkout.js" class="stripe-button" data-key="pk_test_TYooMQauvdEDq54NiTphI7jx" data-amount="' + costIso + '" data-name="Stripe.com" data-description="Example charge" data-image="https://stripe.com/img/documentation/checkout/marketplace.png" data-locale="auto" data-zip-code="true"> </script>');
    }),
    costIsLoading: false,
    followersAmount: null,
    username: null,
    didInsertElement: function didInsertElement() {
      this.get('photos');
      var self = this;
      _ember['default'].$('#orderCheckout').on('shown.bs.modal', function () {
        // Ember.$('#paynowBtn').prop('disabled',true);
        if (self.get('selectedService') !== null) {
          if (self.get('selectedService.serviceFamily') != 'followers') {
            if (self.get('mode') == 'automatic') {
              if (self.get('selectedPhotos') !== null) {
                var errorFlag = self.get('selectedPhotos').mapBy('amountErrorFlag').reduce(function (acc, val) {
                  return acc || val;
                }, false);
                if (errorFlag) {
                  _ember['default'].$('#paynowBtn').prop('disabled', true);
                  self.set('errorFlag', errorFlag);
                  self.set('errorMessage', 'Please, resolve the errors you have.');
                } else {
                  _ember['default'].$('#paynowBtn').prop('disabled', false);
                  self.set('errorFlag', errorFlag);
                  self.set('errorMessage', '');
                }
                self.set('linksStr', '');
                self.set('amountsStr', '');
                self.get('selectedPhotos').forEach(function (photo) {
                  self.set('linksStr', self.get('linksStr') + ',' + photo.get('link'));
                  self.set('amountsStr', self.get('amountsStr') + ',' + photo.amount);
                  if (self.get('selectedService.serviceFamily') == 'custom_comments') {
                    photo.get('comments').forEach(function (comment) {
                      self.set('commentsStr', self.get('commentsStr') + '~' + comment.get('text').replace('~', ''));
                    });
                    self.set('commentsStr', self.get('commentsStr') + '~');
                  }
                });

                // self.set('linksStr', self.get('linksStr').substring(1));
                // self.set('amountsStr', self.get('amountsStr').substring(1));
                if (!errorFlag) {
                  self.set('costIsLoading', true);
                  new _ember['default'].RSVP.Promise(function (resolve, reject) {
                    _ember['default'].$.ajax({
                      type: "GET",
                      url: self.get('urls').getUrlWithServiceIdAndAmounts('getPrice', self.get('selectedService.id'), self.get('amountsStr')),
                      contentType: 'application/json;charset=utf-8',
                      dataType: 'json',
                      crossDomain: true
                    }).then(function (response, status, xhr) {
                      self.set('costIsLoading', false);
                      self.set('cost', response.price);
                    }, function (error) {});
                  });
                }
              } else {
                _ember['default'].$('#paynowBtn').prop('disabled', true);
                self.set('errorFlag', true);
                self.set('errorMessage', 'You have to select posts first.');
              }
            } else {
              if (self.get('links.length') > 0) {
                self.get('links').forEach(function (link) {
                  self.set('linksStr', self.get('linksStr') + ',' + link.get('link'));
                  self.set('amountsStr', self.get('amountsStr') + ',' + link.get('amount'));
                });
                self.set('costIsLoading', true);
                new _ember['default'].RSVP.Promise(function (resolve, reject) {
                  _ember['default'].$.ajax({
                    type: "GET",
                    url: self.get('urls').getUrlWithServiceIdAndAmounts('getPrice', self.get('selectedService.id'), self.get('amountsStr')),
                    contentType: 'application/json;charset=utf-8',
                    dataType: 'json',
                    crossDomain: true
                  }).then(function (response, status, xhr) {
                    self.set('costIsLoading', false);
                    self.set('cost', response.price);
                  }, function (error) {});
                });
              } else {}
            }
          } else {
            var min = self.get('selectedService.minimum');
            var max = self.get('selectedService.maximum');
            if (self.get('followersAmount') < min) {
              self.set('errorMessage', 'Minimum amount for this service is ' + min);
            } else if (self.get('followersAmount') > max) {
              self.set('errorMessage', 'Maximum amount for this service is ' + max);
            } else {
              self.set('linksStr', self.get('username'));
              self.set('amountsStr', self.get('followersAmount'));
              self.set('costIsLoading', true);
              new _ember['default'].RSVP.Promise(function (resolve, reject) {
                _ember['default'].$.ajax({
                  type: "GET",
                  url: self.get('urls').getUrlWithServiceIdAndAmounts('getPrice', self.get('selectedService.id'), self.get('amountsStr')),
                  contentType: 'application/json;charset=utf-8',
                  dataType: 'json',
                  crossDomain: true
                }).then(function (response, status, xhr) {
                  self.set('costIsLoading', false);
                  self.set('cost', response.price);
                  // }
                }, function (error) {
                  // self.set('usernameErrorFlag', true)
                  // self.set('isLoadingCheckout', false);
                  // self.set('errors.username', JSON.parse(error.responseText).error_message);
                });
              });
            }
          }
        } else {
            self.set('errors.service', self.get('i18n').t('errorMessages.service.empty'));
          }
      });
    },
    actions: {
      enableIsLoading: function enableIsLoading() {
        this.set('isLoading', true);
        _ember['default'].$('#postsForm').submit();
      },
      backToBrowsePosts: function backToBrowsePosts() {
        $('#stripe-form > script').remove();
        $('#stripe-form > button').remove();
        _ember['default'].$('#orderCheckout').modal('hide');
        _ember['default'].$('#selectPosts').modal({
          backdrop: 'static',
          keyboard: false
        });
      }
    }
  });
});
define('xgram-frontend/components/news-section', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    urls: _ember['default'].inject.service(),
    email: null,
    isLoading: false,
    succefullySubscribed: false,
    unsuccefullySubscribed: false,
    errorMessage: null,
    actions: {
      sendEmail: function sendEmail() {
        var self = this;
        self.set('succefullySubscribed', false);
        self.set('unsuccefullySubscribed', false);
        self.set('isLoading', true);
        new _ember['default'].RSVP.Promise(function (resolve, reject) {
          _ember['default'].$.ajax({
            type: "POST",
            url: self.get('urls').getUrl('newsletters'),
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({
              email: self.get('email')
            }),
            crossDomain: true
          }).then(function (response, status, xhr) {
            self.set('succefullySubscribed', true);
            self.set('isLoading', false);
          }, function (error) {
            self.set('errorMessage', JSON.parse(error.responseText).email[0]);
            self.set('unsuccefullySubscribed', true);
            self.set('isLoading', false);
          });
        });
      }
    }
  });
});
define('xgram-frontend/components/not-approved-modal', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define('xgram-frontend/components/not-created-modal', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define('xgram-frontend/components/package-section', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    store: _ember['default'].inject.service(),
    subscriptionType: null,
    selectedService: null,
    username: null,
    likes: null,
    posts: null,
    actions: {
      setSubscriptionType: function setSubscriptionType(subscriptionType) {
        this.set('subscriptionType', subscriptionType);
        _ember['default'].$('#packages').modal({ backdrop: 'static', keyboard: false });
        var selectedService = this.get('store').peekAll('subscription-service').filterBy('subType', this.get('subscriptionType')).get('firstObject');
        this.set('selectedService', selectedService);
      }
    }
  });
});
define('xgram-frontend/components/package-section/checkout-modal', ['exports', 'ember', 'xgram-frontend/config/environment'], function (exports, _ember, _xgramFrontendConfigEnvironment) {
  exports['default'] = _ember['default'].Component.extend({
    urls: _ember['default'].inject.service(),
    paypalFormAction: _ember['default'].computed(function () {
      return _xgramFrontendConfigEnvironment['default'].host + '/subscriptions/create';
    }),
    username: null,
    likes: null,
    posts: null,
    cost: '?',
    selectedService: null,
    isCheckingout: false,
    didInsertElement: function didInsertElement() {
      var self = this;
      _ember['default'].$('#packageCheckout').on('shown.bs.modal', function () {
        self.set('isCheckingout', true);
        new _ember['default'].RSVP.Promise(function (resolve, reject) {
          _ember['default'].$.ajax({
            type: "GET",
            url: self.get('urls').getUrlWithServiceIdAndLikesAndPosts('getSubscriptionPrice', self.get('selectedService.id'), self.get('likes'), self.get('posts')),
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            crossDomain: true
          }).then(function (response, status, xhr) {
            self.set('isCheckingout', false);
            self.set('cost', response.price);
          }, function (error) {
            self.set('isCheckingout', false);
          });
        });
      });
    },
    actions: {
      backToBrowsePackage: function backToBrowsePackage() {
        _ember['default'].$('#packageCheckout').modal('hide');
        _ember['default'].$('#packages').modal({
          backdrop: 'static',
          keyboard: false
        });
      }
    }
  });
});
define('xgram-frontend/components/package-section/package-modal', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    store: _ember['default'].inject.service(),
    urls: _ember['default'].inject.service(),
    subscriptionType: null,
    selectedService: null,
    username: null,
    likes: null,
    posts: null,
    errors: {},
    isCheckingout: false,
    actions: {
      setSubscriptionType: function setSubscriptionType(subscriptionType) {
        this.set('errors', {});
        this.sendAction('setSubscriptionType', subscriptionType);
      },
      validatePackage: function validatePackage() {
        var isValidPackage = true;
        var self = this;
        self.set('isCheckingout', true);

        function validateRestFiels() {
          var minLikes = self.get('selectedService.minLikes');
          var maxLikes = self.get('selectedService.maxLikes');
          if (self.get('likes') < minLikes) {
            self.set('errors.likes', 'minimum value is ' + minLikes);
            isValidPackage = isValidPackage && false;
          } else if (self.get('likes') > maxLikes) {
            self.set('errors.likes', 'maximum value is ' + maxLikes);
            isValidPackage = isValidPackage && false;
          } else {
            self.set('errors.likes', '');
            isValidPackage = isValidPackage && true;
          }

          if (self.get('selectedService.subType') == 'limited') {
            var minPosts = self.get('selectedService.minPosts');
            var maxPosts = self.get('selectedService.maxPosts');
            if (self.get('posts') < minPosts) {
              self.set('errors.posts', 'minimum value is ' + minPosts);
              isValidPackage = isValidPackage && false;
            } else if (self.get('posts') > maxPosts) {
              self.set('errors.posts', 'maximum value is ' + maxPosts);
              isValidPackage = isValidPackage && false;
            } else {
              self.set('errors.posts', '');
              isValidPackage = isValidPackage && true;
            }
          }
          return isValidPackage;
        }

        new _ember['default'].RSVP.Promise(function (resolve, reject) {
          _ember['default'].$.ajax({
            type: "GET",
            url: self.get('urls').getUrlWithUsername('checkUsername', self.get('username')),
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            crossDomain: true
          }).then(function (response, status, xhr) {
            self.set('isLoadingPosts', false);
            self.set('isCheckingout', false);
            var isValid = validateRestFiels();
            if (isValid) {
              _ember['default'].$('#packages').modal('hide');
              _ember['default'].$('#packageCheckout').modal({ backdrop: 'static', keyboard: false });
            } else {}
          }, function (error) {
            self.set('isLoadingPosts', false);
            self.set('errors.username', JSON.parse(error.responseText).error_message);
            validateRestFiels();
            self.set('isCheckingout', false);
          });
        });
      }
    }
  });
});
define('xgram-frontend/components/stat-section', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define('xgram-frontend/components/status-section', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    urls: _ember['default'].inject.service(),
    orderCode: null,
    isLoadingStatus: false,
    errorMessage: '',
    orderDetails: null,
    serviceFamily: null,
    actions: {
      openStatusModal: function openStatusModal() {
        var self = this;
        self.set('isLoadingStatus', true);
        new _ember['default'].RSVP.Promise(function (resolve, reject) {
          _ember['default'].$.ajax({
            type: "GET",
            url: self.get('urls').getStatusUrl(self.get('orderCode')),
            contentType: 'application/json;charset=utf-8',
            dataType: 'json',
            crossDomain: true
          }).then(function (response, status, xhr) {
            self.set('isLoadingStatus', false);
            self.set('orderDetails', response.order_details);
            self.set('serviceFamily', response.service_family);
            self.set('serviceDescription', response.service_description);
            _ember['default'].$('#orderStatus').modal({ backdrop: 'static', keyboard: false });
            self.set('errorMessage', '');
          }, function (error) {
            self.set('isLoadingStatus', false);
            self.set('errorMessage', JSON.parse(error.responseText).error_message);
          });
        });
      }
    }
  });
});
define('xgram-frontend/components/status-section/status-modal', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({});
});
define('xgram-frontend/components/thankyou-modal', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    urls: _ember['default'].inject.service(),
    rating: null,
    review: null,
    orderRow: null,
    subscription: null,
    isLoading: false,
    actions: {
      setRating: function setRating(rate) {
        this.set('rating', rate);
      },
      sendReview: function sendReview() {
        var self = this;
        if (self.get('rating') != null || self.get('review') != null) {
          self.set('isLoading', true);
          new _ember['default'].RSVP.Promise(function (resolve, reject) {
            _ember['default'].$.ajax({
              type: "POST",
              url: self.get('urls').getUrl('reviews'),
              contentType: 'application/json;charset=utf-8',
              dataType: 'json',
              data: JSON.stringify({
                message: self.get('review'),
                rate: self.get('rating'),
                client_id: self.get('orderRow.clientId')
              }),
              crossDomain: true
            }).then(function (response, status, xhr) {
              self.set('isLoading', false);
            }, function (error) {
              self.set('isLoading', false);
            });
          });
        }
        _ember['default'].$('#thankModal').modal('hide');
      }
    }
  });
});
define('xgram-frontend/components/x-option', ['exports', 'emberx-select/components/x-option'], function (exports, _emberxSelectComponentsXOption) {
  exports['default'] = _emberxSelectComponentsXOption['default'];
});
define('xgram-frontend/components/x-select', ['exports', 'emberx-select/components/x-select'], function (exports, _emberxSelectComponentsXSelect) {
  exports['default'] = _emberxSelectComponentsXSelect['default'];
});
define('xgram-frontend/helpers/and', ['exports', 'ember', 'ember-truth-helpers/helpers/and'], function (exports, _ember, _emberTruthHelpersHelpersAnd) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersAnd.andHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersAnd.andHelper);
  }

  exports['default'] = forExport;
});
define('xgram-frontend/helpers/eq', ['exports', 'ember', 'ember-truth-helpers/helpers/equal'], function (exports, _ember, _emberTruthHelpersHelpersEqual) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersEqual.equalHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersEqual.equalHelper);
  }

  exports['default'] = forExport;
});
define('xgram-frontend/helpers/gt', ['exports', 'ember', 'ember-truth-helpers/helpers/gt'], function (exports, _ember, _emberTruthHelpersHelpersGt) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersGt.gtHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersGt.gtHelper);
  }

  exports['default'] = forExport;
});
define('xgram-frontend/helpers/gte', ['exports', 'ember', 'ember-truth-helpers/helpers/gte'], function (exports, _ember, _emberTruthHelpersHelpersGte) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersGte.gteHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersGte.gteHelper);
  }

  exports['default'] = forExport;
});
define('xgram-frontend/helpers/is-array', ['exports', 'ember', 'ember-truth-helpers/helpers/is-array'], function (exports, _ember, _emberTruthHelpersHelpersIsArray) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersIsArray.isArrayHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersIsArray.isArrayHelper);
  }

  exports['default'] = forExport;
});
define('xgram-frontend/helpers/is-equal', ['exports', 'ember-truth-helpers/helpers/is-equal'], function (exports, _emberTruthHelpersHelpersIsEqual) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberTruthHelpersHelpersIsEqual['default'];
    }
  });
  Object.defineProperty(exports, 'isEqual', {
    enumerable: true,
    get: function get() {
      return _emberTruthHelpersHelpersIsEqual.isEqual;
    }
  });
});
define('xgram-frontend/helpers/lt', ['exports', 'ember', 'ember-truth-helpers/helpers/lt'], function (exports, _ember, _emberTruthHelpersHelpersLt) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersLt.ltHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersLt.ltHelper);
  }

  exports['default'] = forExport;
});
define('xgram-frontend/helpers/lte', ['exports', 'ember', 'ember-truth-helpers/helpers/lte'], function (exports, _ember, _emberTruthHelpersHelpersLte) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersLte.lteHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersLte.lteHelper);
  }

  exports['default'] = forExport;
});
define('xgram-frontend/helpers/not-eq', ['exports', 'ember', 'ember-truth-helpers/helpers/not-equal'], function (exports, _ember, _emberTruthHelpersHelpersNotEqual) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersNotEqual.notEqualHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersNotEqual.notEqualHelper);
  }

  exports['default'] = forExport;
});
define('xgram-frontend/helpers/not', ['exports', 'ember', 'ember-truth-helpers/helpers/not'], function (exports, _ember, _emberTruthHelpersHelpersNot) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersNot.notHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersNot.notHelper);
  }

  exports['default'] = forExport;
});
define('xgram-frontend/helpers/or', ['exports', 'ember', 'ember-truth-helpers/helpers/or'], function (exports, _ember, _emberTruthHelpersHelpersOr) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersOr.orHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersOr.orHelper);
  }

  exports['default'] = forExport;
});
define('xgram-frontend/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('xgram-frontend/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('xgram-frontend/helpers/t', ['exports', 'ember-i18n/helper'], function (exports, _emberI18nHelper) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nHelper['default'];
    }
  });
});
define('xgram-frontend/helpers/xor', ['exports', 'ember', 'ember-truth-helpers/helpers/xor'], function (exports, _ember, _emberTruthHelpersHelpersXor) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersXor.xorHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersXor.xorHelper);
  }

  exports['default'] = forExport;
});
define("xgram-frontend/initializers/active-model-adapter", ["exports", "active-model-adapter", "active-model-adapter/active-model-serializer"], function (exports, _activeModelAdapter, _activeModelAdapterActiveModelSerializer) {
  exports["default"] = {
    name: 'active-model-adapter',
    initialize: function initialize() {
      var application = arguments[1] || arguments[0];
      application.register('adapter:-active-model', _activeModelAdapter["default"]);
      application.register('serializer:-active-model', _activeModelAdapterActiveModelSerializer["default"]);
    }
  };
});
define('xgram-frontend/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'xgram-frontend/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _xgramFrontendConfigEnvironment) {
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(_xgramFrontendConfigEnvironment['default'].APP.name, _xgramFrontendConfigEnvironment['default'].APP.version)
  };
});
define('xgram-frontend/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('xgram-frontend/initializers/data-adapter', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).

    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('xgram-frontend/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _emberDataSetupContainer, _emberData) {

  /*

    This code initializes Ember-Data onto an Ember application.

    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.

    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.

    For example, imagine an Ember.js application with the following classes:

    ```app/services/store.js
    import DS from 'ember-data';

    export default DS.Store.extend({
      adapter: 'custom'
    });
    ```

    ```app/controllers/posts.js
    import { Controller } from '@ember/controller';

    export default Controller.extend({
      // ...
    });

    When the application is initialized, `ApplicationStore` will automatically be
    instantiated, and the instance of `PostsController` will have its `store`
    property set to that instance.

    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('xgram-frontend/initializers/ember-i18n', ['exports', 'ember-i18n/initializers/ember-i18n'], function (exports, _emberI18nInitializersEmberI18n) {
  exports['default'] = _emberI18nInitializersEmberI18n['default'];
});
define('xgram-frontend/initializers/export-application-global', ['exports', 'ember', 'xgram-frontend/config/environment'], function (exports, _ember, _xgramFrontendConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_xgramFrontendConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _xgramFrontendConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_xgramFrontendConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('xgram-frontend/initializers/injectStore', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).

    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('xgram-frontend/initializers/store', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).

    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('xgram-frontend/initializers/transforms', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).

    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('xgram-frontend/initializers/truth-helpers', ['exports', 'ember', 'ember-truth-helpers/utils/register-helper', 'ember-truth-helpers/helpers/and', 'ember-truth-helpers/helpers/or', 'ember-truth-helpers/helpers/equal', 'ember-truth-helpers/helpers/not', 'ember-truth-helpers/helpers/is-array', 'ember-truth-helpers/helpers/not-equal', 'ember-truth-helpers/helpers/gt', 'ember-truth-helpers/helpers/gte', 'ember-truth-helpers/helpers/lt', 'ember-truth-helpers/helpers/lte'], function (exports, _ember, _emberTruthHelpersUtilsRegisterHelper, _emberTruthHelpersHelpersAnd, _emberTruthHelpersHelpersOr, _emberTruthHelpersHelpersEqual, _emberTruthHelpersHelpersNot, _emberTruthHelpersHelpersIsArray, _emberTruthHelpersHelpersNotEqual, _emberTruthHelpersHelpersGt, _emberTruthHelpersHelpersGte, _emberTruthHelpersHelpersLt, _emberTruthHelpersHelpersLte) {
  exports.initialize = initialize;

  function initialize() /* container, application */{

    // Do not register helpers from Ember 1.13 onwards, starting from 1.13 they
    // will be auto-discovered.
    if (_ember['default'].Helper) {
      return;
    }

    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('and', _emberTruthHelpersHelpersAnd.andHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('or', _emberTruthHelpersHelpersOr.orHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('eq', _emberTruthHelpersHelpersEqual.equalHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('not', _emberTruthHelpersHelpersNot.notHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('is-array', _emberTruthHelpersHelpersIsArray.isArrayHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('not-eq', _emberTruthHelpersHelpersNotEqual.notEqualHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('gt', _emberTruthHelpersHelpersGt.gtHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('gte', _emberTruthHelpersHelpersGte.gteHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('lt', _emberTruthHelpersHelpersLt.ltHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('lte', _emberTruthHelpersHelpersLte.lteHelper);
  }

  exports['default'] = {
    name: 'truth-helpers',
    initialize: initialize
  };
});
define("xgram-frontend/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (exports, _emberDataInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataInitializeStoreService["default"]
  };
});
define('xgram-frontend/instance-initializers/ember-i18n', ['exports', 'ember-i18n/instance-initializers/ember-i18n'], function (exports, _emberI18nInstanceInitializersEmberI18n) {
  exports['default'] = _emberI18nInstanceInitializersEmberI18n['default'];
});
define("xgram-frontend/locales/ar/config", ["exports"], function (exports) {
  // Ember-I18n includes configuration for common locales. Most users
  // can safely delete this file. Use it if you need to override behavior
  // for a locale or define behavior for a locale that Ember-I18n
  // doesn't know about.
  exports["default"] = {
    // rtl: [true|FALSE],
    //
    // pluralForm: function(count) {
    //   if (count === 0) { return 'zero'; }
    //   if (count === 1) { return 'one'; }
    //   if (count === 2) { return 'two'; }
    //   if (count < 5) { return 'few'; }
    //   if (count >= 5) { return 'many'; }
    //   return 'other';
    // }
  };
});
define('xgram-frontend/locales/ar/translations', ['exports'], function (exports) {
  exports['default'] = {
    changeLanguage: 'English',
    hello: 'أهلا',
    placeAnOrder: 'ضع طلبا',
    selectService: 'اختر خدمة',
    enterUserName: 'ادخل اسم المستخدم',
    browsePosts: 'تصفح صورك',
    amount: 'كمية',
    checkout: 'ادفع',
    startingFrom: 'يبدأ من',
    whyXgram: "لماذا نحن",
    howItWorks: "كيف يعمل",
    orderStatus: "حالة الطلب",
    packages: "الباقات",
    newsletter: "الصحيفة",
    statistics: "إحصاءات",
    errorMessages: {
      service: {
        empty: "يرجى اختيار الخدمة أولا",
        min: "الحد الأدنى هو ",
        max: "الحد الأقصى هو "
      },
      client: {
        username: {
          empty: "اسم المستخدم لا يمكن أن يكون فارغا"
        }
      }
    },
    whySection: {
      title: 'لماذا نحن',
      desc: 'ﻷن لدينا أفضل منصة لتقديم خدمات إنستجرام!',
      speed: {
        title: 'السرعة',
        desc: 'سرعة فائقة في إيصال الخدمات حيث أن جميع أنظمة الإيصال لدينا مميكنة. لتصلك الخدمة في غضون دقائق.'
      },
      support: {
        title: 'الدعم',
        desc: 'فريق الدعم الفني لدينا جاهز لخدمتك 24 ساعة طوال أيام الاسبوع. ما عليك سوى أن تتواصل بالإيميل أو الماسنجر.'
      },
      privacy: {
        title: 'الخصوصية',
        desc: 'جميع طرق الدفع تتم عن طريق paypal'
      },
      money_back_guarantee: {
        title: 'ضمان استرداد المال',
        desc: 'يمكنك تقديم طلب لاسترداد أموالك إن لم تصلك'
      }
    },
    howSection: {
      title: 'كيف أزيد من تفاعل الحساب خاصتي',
      fill_order_form: {
        title: 'قم بإرسال الطلب',
        desc: 'اختر الخدمة ثم قم بكتابة اسم المستخدم خاصتك'
      },
      pay_with_paypal: {
        title: 'ادفع بأمان مع paypal',
        desc: 'ادفع اونلاين باستخدام paypal بأمان'
      },
      track_order: {
        title: 'تهانينا',
        desc: 'ستصلك الخدمة في أي لحظة من الآن'
      },
      magic_happens: {
        title: 'تهانينا',
        desc: 'ستصلك الخدمة في أي لحظة من الآن'
      }
    },
    statusSection: {
      title: 'تابع حالة الطلب',
      desc: 'تابع حالة طلبك الحالي في منظومتنا المميكنة للتوصيل',
      check_now: 'افحص'
    },
    statsSection: {
      title: 'إحصاءات',
      desc: 'أرقام حقيقية من قواعد البيانات خاصتنا',
      happyClients: 'عملائنا الحاليون',
      deliveredOrders: 'إجمالي الطلبات',
      likesSent: 'أعجبني المرسلة'
    },
    footer: '2021, Instajax, inc. جميع الحقوق محفوظة.'
  };
});
define("xgram-frontend/locales/en/config", ["exports"], function (exports) {
  // Ember-I18n includes configuration for common locales. Most users
  // can safely delete this file. Use it if you need to override behavior
  // for a locale or define behavior for a locale that Ember-I18n
  // doesn't know about.
  exports["default"] = {
    // rtl: [true|FALSE],
    //
    // pluralForm: function(count) {
    //   if (count === 0) { return 'zero'; }
    //   if (count === 1) { return 'one'; }
    //   if (count === 2) { return 'two'; }
    //   if (count < 5) { return 'few'; }
    //   if (count >= 5) { return 'many'; }
    //   return 'other';
    // }
  };
});
define('xgram-frontend/locales/en/translations', ['exports'], function (exports) {
  exports['default'] = {
    changeLanguage: 'العربية',
    hello: 'Hello',
    placeAnOrder: 'place an order',
    selectService: 'select service',
    enterUserName: 'Enter your username',
    browsePosts: 'Browse posts',
    amount: 'amount',
    checkout: 'checkout',
    startingFrom: 'starting from',
    whyXgram: "Why Instajax",
    howItWorks: "How It Works",
    orderStatus: "Order Status",
    packages: "Packages",
    newsletter: "Newsletter",
    statistics: "Statistics",
    errorMessages: {
      service: {
        empty: "Please, specify service first",
        min: "Minimum amount is ",
        max: "Minimum amount is "
      },
      client: {
        username: {
          empty: "Username cannot be empty"
        }
      }
    },
    whySection: {
      title: 'Why Instajax',
      desc: 'Instajax is the best platform for Instagram services!',
      speed: {
        title: 'Speed',
        desc: 'High Speed Delivery Our delivery system is fully automated. Get your order within minutes after checking out!'
      },
      support: {
        title: 'Support',
        desc: 'Our cutomer support team are online 24/7 ready for help. Just text us on messanger or by email'
      },
      privacy: {
        title: 'Privacy',
        desc: 'All followers and likes are reliable. We care about privacy and our clients are top-secret!'
      },
      money_back_guarantee: {
        title: 'Money Back Guarantee',
        desc: '100% Lifetime money back guarantee'
      }
    },
    howSection: {
      title: 'How It Works',
      fill_order_form: {
        title: 'Fill Order Form',
        desc: 'Choose the service you want, fill your Instagram username, browse posts and checkout!'
      },
      pay_with_paypal: {
        title: 'Support',
        desc: 'Pay online with your PayPal account securely!'
      },
      track_order: {
        title: 'Track Order status',
        desc: 'You can track your order status via the code generated after placing the order from order status form'
      },
      magic_happens: {
        title: 'Magic Happenss',
        desc: 'Congratulations! Your social media presence is now promoted'
      }
    },
    statusSection: {
      title: 'Check Order Status',
      desc: 'Track your current order in our automated delivery system!',
      check_now: 'Check Now'
    },
    statsSection: {
      title: 'Statistics',
      desc: 'Actual numbers from our database',
      happyClients: 'Happy Clients',
      deliveredOrders: 'Orders Delivered',
      likesSent: 'Likes Sent'
    },
    footer: '2022, Instajax, inc. All Rights Reserved.'
  };
});
define('xgram-frontend/models/client', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    payerId: _emberData['default'].attr('string'),
    email: _emberData['default'].attr('string'),
    country: _emberData['default'].attr('string'),
    firstName: _emberData['default'].attr('string'),
    lastName: _emberData['default'].attr('string'),
    sendEmailFlag: _emberData['default'].attr('boolean'),
    createdAt: _emberData['default'].attr('number')
  });
});
define('xgram-frontend/models/comment', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    text: _emberData['default'].attr('string'),
    photo: _emberData['default'].belongsTo('photo')
  });
});
define('xgram-frontend/models/link', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    link: _emberData['default'].attr('string'),
    amount: _emberData['default'].attr('number'),
    amountErrorFlag: Ember.computed(function () {
      return false;
    }),
    errorMessage: Ember.computed(function () {
      return '';
    })
  });
});
define('xgram-frontend/models/order-detail', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    link: _emberData['default'].attr('string'),
    amount: _emberData['default'].attr('number'),
    apiOrderId: _emberData['default'].attr('string'),
    status: _emberData['default'].attr('string'),
    orderRow: _emberData['default'].belongsTo('order-row'),
    // comments: DS.hasMany('comment'),
    createdAt: _emberData['default'].attr('number')
  });
});
define('xgram-frontend/models/order-row', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    paid: _emberData['default'].attr('number'),
    net: _emberData['default'].attr('number'),
    orderCode: _emberData['default'].attr('string'),
    transactionId: _emberData['default'].attr('string'),
    orderDetails: _emberData['default'].hasMany('order-detail'),
    clientId: _emberData['default'].attr('number'),
    service: _emberData['default'].belongsTo('service'),
    createdAt: _emberData['default'].attr('number')
  });
});
define('xgram-frontend/models/photo', ['exports', 'ember-data', 'ember'], function (exports, _emberData, _ember) {
  exports['default'] = _emberData['default'].Model.extend({
    imagePreview: _emberData['default'].attr('string'),
    link: _emberData['default'].attr('string'),
    createdAt: _emberData['default'].attr('number'),
    createdAtFormatted: _ember['default'].computed('createdAt', function () {
      return this.get('createdAt');
    }),
    comments: _emberData['default'].hasMany('comment'),
    isVideo: _emberData['default'].attr('boolean'),
    isSelected: _ember['default'].computed(function () {
      return false;
    }),
    amount: _ember['default'].computed(function () {
      return 0;
    }),
    errorMessage: _ember['default'].computed(function () {
      return '';
    }),
    amountErrorFlag: _ember['default'].computed(function () {
      return false;
    })
  });
});
define('xgram-frontend/models/service', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    description: _emberData['default'].attr('string'),
    minimum: _emberData['default'].attr('number'),
    maximum: _emberData['default'].attr('number'),
    price: _emberData['default'].attr('number'),
    sale: _emberData['default'].attr('number'),
    salePercentage: Ember.computed('sale', function () {
      return this.get('sale') * 100;
    }),
    hasNote: _emberData['default'].attr('boolean'),
    note: _emberData['default'].attr('string'),
    active: _emberData['default'].attr('boolean'),
    serviceFamily: _emberData['default'].attr('string')
  });
});
define('xgram-frontend/models/subscription-service', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    description: _emberData['default'].attr('string'),
    minLikes: _emberData['default'].attr('number'),
    maxLikes: _emberData['default'].attr('number'),
    minPosts: _emberData['default'].attr('number'),
    maxPosts: _emberData['default'].attr('number'),
    price: _emberData['default'].attr('number'),
    sale: _emberData['default'].attr('number'),
    subType: _emberData['default'].attr('string'),
    active: _emberData['default'].attr('boolean')
  });
});
define('xgram-frontend/models/subscription', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    username: _emberData['default'].attr('string'),
    paid: _emberData['default'].attr('number'),
    net: _emberData['default'].attr('number'),
    orderCode: _emberData['default'].attr('string'),
    status: _emberData['default'].attr('string'),
    transactionId: _emberData['default'].attr('string'),
    verified: _emberData['default'].attr('boolean'),
    clientId: _emberData['default'].attr('number'),
    client: _emberData['default'].belongsTo('client'),
    postsCount: _emberData['default'].attr('number'),
    likesCount: _emberData['default'].attr('number'),
    subscriptionServiceId: _emberData['default'].attr('number'),
    subscriptionService: _emberData['default'].belongsTo('subscription-service'),
    createdAt: _emberData['default'].attr('date')
  });
});
define('xgram-frontend/models/user', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    found: _emberData['default'].attr('boolean'),
    code: _emberData['default'].attr('string'),
    errorMesesage: _emberData['default'].attr('string'),
    username: _emberData['default'].attr('string'),
    followedBy: _emberData['default'].attr('number'),
    photos: _emberData['default'].hasMany('photo')
  });
});
define('xgram-frontend/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('xgram-frontend/router', ['exports', 'ember', 'xgram-frontend/config/environment'], function (exports, _ember, _xgramFrontendConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _xgramFrontendConfigEnvironment['default'].locationType,
    rootURL: _xgramFrontendConfigEnvironment['default'].rootURL
  });

  Router.map(function () {
    this.route('index', { path: '/' });
    this.route('index', { path: '/:modelName/:id' });
  });

  exports['default'] = Router;
});
define('xgram-frontend/routes/index', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    // i18n: Ember.inject.service(),
    // afterModel(params,t) {
    //   this.set('i18n.locale', t.queryParams.locale || 'en');
    // },
    model: function model(params) {
      switch (params.id) {
        case '-1':
          _ember['default'].run.later(function () {
            _ember['default'].$('#notCreatedModal').modal({ backdrop: 'static', keyboard: false });
          }, 1000);
          break;
        case '-2':
          _ember['default'].run.later(function () {
            _ember['default'].$('#notApprovedModal').modal({ backdrop: 'static', keyboard: false });
          }, 1000);
          break;
        case '-3':
          _ember['default'].run.later(function () {
            _ember['default'].$('#canceledModal').modal({ backdrop: 'static', keyboard: false });
          }, 1000);
          break;
      }
      if (parseInt(params.id) > 0 || typeof params.id == "undefined") {
        switch (params.modelName) {
          case 'order-row':
            return _ember['default'].RSVP.hash({
              services: this.store.findAll('service'),
              subscriptionServices: this.store.findAll('subscription-service'),
              orderRow: this.store.findRecord(params.modelName, params.id)
            });
            break;
          case 'subscription':
            return _ember['default'].RSVP.hash({
              services: this.store.findAll('service'),
              subscriptionServices: this.store.findAll('subscription-service'),
              subscription: this.store.findRecord(params.modelName, params.id)
            });
            break;
          default:
            return _ember['default'].RSVP.hash({
              services: this.store.findAll('service'),
              subscriptionServices: this.store.findAll('subscription-service')
            });
        }
      } else {
        return _ember['default'].RSVP.hash({
          services: this.store.findAll('service'),
          subscriptionServices: this.store.findAll('subscription-service')
        });
      }
    }
  });
});
define('xgram-frontend/serializers/application', ['exports', 'ember-data', 'active-model-adapter'], function (exports, _emberData, _activeModelAdapter) {
  exports['default'] = _activeModelAdapter.ActiveModelSerializer.extend(_emberData['default'].EmbeddedRecordsMixin, {});
});
define('xgram-frontend/serializers/comment', ['exports', 'xgram-frontend/serializers/application', 'active-model-adapter'], function (exports, _xgramFrontendSerializersApplication, _activeModelAdapter) {
  exports['default'] = _activeModelAdapter.ActiveModelSerializer.extend(DS.EmbeddedRecordsMixin, {});
});
define('xgram-frontend/serializers/order-row', ['exports', 'ember-data', 'active-model-adapter'], function (exports, _emberData, _activeModelAdapter) {
  exports['default'] = _activeModelAdapter.ActiveModelSerializer.extend(_emberData['default'].EmbeddedRecordsMixin, {
    attrs: {
      orderDetails: { embedded: 'always' },
      client: { embedded: 'always' },
      service: { embedded: 'always' }
    }
  });
});
define('xgram-frontend/serializers/service', ['exports', 'xgram-frontend/serializers/application', 'active-model-adapter'], function (exports, _xgramFrontendSerializersApplication, _activeModelAdapter) {
  exports['default'] = _activeModelAdapter.ActiveModelSerializer.extend(DS.EmbeddedRecordsMixin, {});
});
define('xgram-frontend/serializers/user', ['exports', 'ember-data', 'active-model-adapter'], function (exports, _emberData, _activeModelAdapter) {
  exports['default'] = _activeModelAdapter.ActiveModelSerializer.extend(_emberData['default'].EmbeddedRecordsMixin, {
    attrs: {
      photos: { embedded: 'always' }
    }
  });
});
define('xgram-frontend/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define('xgram-frontend/services/comment-service', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Service.extend({
    store: _ember['default'].inject.service(),
    getAutoIdForComment: function getAutoIdForComment() {
      var comments = this.get('store').peekAll('comment');
      if (comments.get('length') > 0) {
        return parseInt(comments.get('lastObject').get('id')) + 1;
      } else {
        return 1;
      }
    }
  });
});
define('xgram-frontend/services/i18n', ['exports', 'ember-i18n/services/i18n'], function (exports, _emberI18nServicesI18n) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nServicesI18n['default'];
    }
  });
});
define('xgram-frontend/services/link-service', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Service.extend({
    store: _ember['default'].inject.service(),
    getAutoIdForLink: function getAutoIdForLink() {
      var links = this.get('store').peekAll('link');
      if (links.get('length') > 0) {
        return parseInt(links.get('lastObject').get('id')) + 1;
      } else {
        return 1;
      }
    }
  });
});
define('xgram-frontend/services/urls', ['exports', 'ember', 'xgram-frontend/config/environment'], function (exports, _ember, _xgramFrontendConfigEnvironment) {
  exports['default'] = _ember['default'].Service.extend({
    checkUsername: '/clients/check_username',
    setLocale: '/clients/set_locale',
    getPosts: '/clients',
    getPrice: '/order_rows/get_price',
    getSubscriptionPrice: '/subscriptions/get_price',
    reviews: '/reviews',
    newsletters: '/newsletters',
    notifications: '/notifications',
    getUrl: function getUrl(path) {
      return _xgramFrontendConfigEnvironment['default'].host + this.get(path);
    },
    getUrlWithId: function getUrlWithId(path, id) {
      return _xgramFrontendConfigEnvironment['default'].host + this.get(path) + '/' + id;
    },
    getUrlWithUsername: function getUrlWithUsername(path, username) {
      return _xgramFrontendConfigEnvironment['default'].host + this.get(path) + '/' + username;
    },
    getUrlWithServiceIdAndAmounts: function getUrlWithServiceIdAndAmounts(path, serviceId, amounts) {
      return _xgramFrontendConfigEnvironment['default'].host + this.get(path) + '/' + serviceId + '/' + amounts;
    },
    getUrlWithServiceIdAndLikesAndPosts: function getUrlWithServiceIdAndLikesAndPosts(path, serviceId, likes, posts) {
      return _xgramFrontendConfigEnvironment['default'].host + this.get(path) + '/' + serviceId + '/' + likes + '/' + posts;
    },
    getStatusUrl: function getStatusUrl(orderCode) {
      return _xgramFrontendConfigEnvironment['default'].host + '/order_rows/get_status/' + orderCode;
    }
  });
});
define("xgram-frontend/templates/components/cancel-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 23,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/components/cancel-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "canceledModal");
        dom.setAttribute(el1, "class", "modal fade bus-modal");
        dom.setAttribute(el1, "role", "dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-dialog modal-lg");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Modal content");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-content thank-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "close");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("×");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5, "class", "modal-title");
        var el6 = dom.createTextNode("unsuccessfull");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-body text-center");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h1");
        var el6 = dom.createTextNode("Unfortunately");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("You canceled the order. If you are facing any issues you are welcome to chat with or customer support.");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "col-md-12 text-center");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6, "class", "btn btn-warning");
        var el7 = dom.createElement("a");
        dom.setAttribute(el7, "href", "https://m.me/xgram.xyz");
        var el8 = dom.createTextNode("Chat with us");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "btn");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("done");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/components/error-wrapper", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 4,
                "column": 4
              },
              "end": {
                "line": 6,
                "column": 4
              }
            },
            "moduleName": "xgram-frontend/templates/components/error-wrapper.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["content", "error", ["loc", [null, [5, 6], [5, 15]]], 0, 0, 0, 0]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 7,
              "column": 11
            }
          },
          "moduleName": "xgram-frontend/templates/components/error-wrapper.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("label");
          dom.setAttribute(el1, "class", "error-label");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(element0, 1, 1);
          morphs[1] = dom.createMorphAt(element0, 3, 3);
          return morphs;
        },
        statements: [["content", "attributeErrors", ["loc", [null, [3, 4], [3, 23]]], 0, 0, 0, 0], ["block", "each", [["get", "error", ["loc", [null, [4, 12], [4, 17]]], 0, 0, 0, 0], ["get", "in", ["loc", [null, [4, 18], [4, 20]]], 0, 0, 0, 0], ["get", "attributeErrors", ["loc", [null, [4, 21], [4, 36]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [4, 4], [6, 13]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 10,
            "column": 11
          }
        },
        "moduleName": "xgram-frontend/templates/components/error-wrapper.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" yield any custom content");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("end ");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["block", "if", [["get", "attributeErrors", ["loc", [null, [1, 6], [1, 21]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [1, 0], [7, 18]]]], ["content", "yield", ["loc", [null, [9, 0], [9, 9]]], 0, 0, 0, 0]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("xgram-frontend/templates/components/index-component", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 0
            },
            "end": {
              "line": 7,
              "column": 0
            }
          },
          "moduleName": "xgram-frontend/templates/components/index-component.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/notification"], [], ["loc", [null, [6, 2], [6, 37]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 53,
            "column": 0
          }
        },
        "moduleName": "xgram-frontend/templates/components/index-component.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "preloader");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "id", "status");
        var el3 = dom.createTextNode(" ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("snakbar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("header");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("Main section");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" Trigger the modal with a button ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" Modal  Add Comments ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" Modal order status");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" Modal standard package");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" Modal order checkout");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" Modal Business package");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" Modal Business package");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(11);
        morphs[0] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 8, 8, contextualElement);
        morphs[2] = dom.createMorphAt(fragment, 12, 12, contextualElement);
        morphs[3] = dom.createMorphAt(fragment, 14, 14, contextualElement);
        morphs[4] = dom.createMorphAt(fragment, 16, 16, contextualElement);
        morphs[5] = dom.createMorphAt(fragment, 18, 18, contextualElement);
        morphs[6] = dom.createMorphAt(fragment, 22, 22, contextualElement);
        morphs[7] = dom.createMorphAt(fragment, 26, 26, contextualElement);
        morphs[8] = dom.createMorphAt(fragment, 28, 28, contextualElement);
        morphs[9] = dom.createMorphAt(fragment, 30, 30, contextualElement);
        morphs[10] = dom.createMorphAt(fragment, 32, 32, contextualElement);
        return morphs;
      },
      statements: [["block", "if", [["get", "notification_flag", ["loc", [null, [5, 6], [5, 23]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [5, 0], [7, 7]]]], ["inline", "partial", ["partials/header"], [], ["loc", [null, [10, 0], [10, 29]]], 0, 0], ["inline", "main-section", [], ["services", ["subexpr", "@mut", [["get", "services", ["loc", [null, [13, 24], [13, 32]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [13, 0], [13, 34]]], 0, 0], ["inline", "partial", ["partials/why-section"], [], ["loc", [null, [15, 0], [15, 34]]], 0, 0], ["inline", "partial", ["partials/how-section"], [], ["loc", [null, [18, 0], [18, 34]]], 0, 0], ["content", "status-section", ["loc", [null, [21, 0], [21, 18]]], 0, 0, 0, 0], ["content", "stat-section", ["loc", [null, [30, 0], [30, 16]]], 0, 0, 0, 0], ["inline", "thankyou-modal", [], ["orderRow", ["subexpr", "@mut", [["get", "orderRow", ["loc", [null, [35, 26], [35, 34]]], 0, 0, 0, 0]], [], [], 0, 0], "subscription", ["subexpr", "@mut", [["get", "subscription", ["loc", [null, [35, 48], [35, 60]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [35, 0], [35, 62]]], 0, 0], ["content", "not-created-modal", ["loc", [null, [36, 0], [36, 21]]], 0, 0, 0, 0], ["content", "not-approved-modal", ["loc", [null, [37, 0], [37, 22]]], 0, 0, 0, 0], ["content", "cancel-modal", ["loc", [null, [38, 0], [38, 16]]], 0, 0, 0, 0]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("xgram-frontend/templates/components/main-section", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 19,
            "column": 10
          }
        },
        "moduleName": "xgram-frontend/templates/components/main-section.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("section");
        dom.setAttribute(el1, "class", "main-section");
        dom.setAttribute(el1, "id", "top");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "section-bg");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "slider");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "slide1");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "slide2");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "slide3");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "order-data");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "container-fluid");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "row");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [4, 5, 1, 1]), 1, 1);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["inline", "main-section/browse-posts-modal", [], ["selectedService", ["subexpr", "@mut", [["get", "selectedService", ["loc", [null, [1, 50], [1, 65]]], 0, 0, 0, 0]], [], [], 0, 0], "followersAmount", ["subexpr", "@mut", [["get", "followersAmount", ["loc", [null, [1, 82], [1, 97]]], 0, 0, 0, 0]], [], [], 0, 0], "mode", ["subexpr", "@mut", [["get", "mode", ["loc", [null, [1, 103], [1, 107]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [1, 0], [1, 109]]], 0, 0], ["inline", "main-section/checkout-modal", [], ["selectedService", ["subexpr", "@mut", [["get", "selectedService", ["loc", [null, [2, 46], [2, 61]]], 0, 0, 0, 0]], [], [], 0, 0], "errors", ["subexpr", "@mut", [["get", "errors", ["loc", [null, [2, 69], [2, 75]]], 0, 0, 0, 0]], [], [], 0, 0], "followersAmount", ["subexpr", "@mut", [["get", "followersAmount", ["loc", [null, [2, 92], [2, 107]]], 0, 0, 0, 0]], [], [], 0, 0], "username", ["subexpr", "@mut", [["get", "username", ["loc", [null, [3, 39], [3, 47]]], 0, 0, 0, 0]], [], [], 0, 0], "mode", ["subexpr", "@mut", [["get", "mode", ["loc", [null, [3, 53], [3, 57]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [2, 0], [3, 59]]], 0, 0], ["inline", "partial", ["partials/order-form"], [], ["loc", [null, [14, 8], [14, 41]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/components/main-section/browse-posts-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        var child0 = (function () {
          var child0 = (function () {
            return {
              meta: {
                "revision": "Ember@2.8.3",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 16,
                    "column": 14
                  },
                  "end": {
                    "line": 18,
                    "column": 14
                  }
                },
                "moduleName": "xgram-frontend/templates/components/main-section/browse-posts-modal.hbs"
              },
              isEmpty: false,
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createTextNode("                ");
                dom.appendChild(el0, el1);
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                var el1 = dom.createTextNode("\n");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var morphs = new Array(1);
                morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
                return morphs;
              },
              statements: [["inline", "partial", ["partials/main-section/browse-posts/photo-item"], [], ["loc", [null, [17, 16], [17, 75]]], 0, 0]],
              locals: [],
              templates: []
            };
          })();
          return {
            meta: {
              "revision": "Ember@2.8.3",
              "loc": {
                "source": null,
                "start": {
                  "line": 15,
                  "column": 12
                },
                "end": {
                  "line": 19,
                  "column": 12
                }
              },
              "moduleName": "xgram-frontend/templates/components/main-section/browse-posts-modal.hbs"
            },
            isEmpty: false,
            arity: 1,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
              dom.insertBoundary(fragment, 0);
              dom.insertBoundary(fragment, null);
              return morphs;
            },
            statements: [["block", "if", [["get", "photo.isVideo", ["loc", [null, [16, 20], [16, 33]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [16, 14], [18, 21]]]]],
            locals: ["photo"],
            templates: [child0]
          };
        })();
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 14,
                "column": 10
              },
              "end": {
                "line": 20,
                "column": 10
              }
            },
            "moduleName": "xgram-frontend/templates/components/main-section/browse-posts-modal.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [["block", "each", [["get", "photos", ["loc", [null, [15, 20], [15, 26]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [15, 12], [19, 21]]]]],
          locals: [],
          templates: [child0]
        };
      })();
      var child1 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "revision": "Ember@2.8.3",
              "loc": {
                "source": null,
                "start": {
                  "line": 21,
                  "column": 12
                },
                "end": {
                  "line": 23,
                  "column": 12
                }
              },
              "moduleName": "xgram-frontend/templates/components/main-section/browse-posts-modal.hbs"
            },
            isEmpty: false,
            arity: 1,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
              return morphs;
            },
            statements: [["inline", "partial", ["partials/main-section/browse-posts/photo-item"], [], ["loc", [null, [22, 14], [22, 73]]], 0, 0]],
            locals: ["photo"],
            templates: []
          };
        })();
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 20,
                "column": 10
              },
              "end": {
                "line": 24,
                "column": 10
              }
            },
            "moduleName": "xgram-frontend/templates/components/main-section/browse-posts-modal.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [["block", "each", [["get", "photos", ["loc", [null, [21, 20], [21, 26]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [21, 12], [23, 21]]]]],
          locals: [],
          templates: [child0]
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 8
            },
            "end": {
              "line": 25,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/main-section/browse-posts-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["subexpr", "eq", [["get", "selectedService.serviceFamily", ["loc", [null, [14, 20], [14, 49]]], 0, 0, 0, 0], "video_views"], [], ["loc", [null, [14, 16], [14, 64]]], 0, 0]], [], 0, 1, ["loc", [null, [14, 10], [24, 17]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 25,
              "column": 8
            },
            "end": {
              "line": 32,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/main-section/browse-posts-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "modal-items");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "add-comment-input manual-links-content");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
          morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]), 1, 1);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/main-section/browse-posts/manual-links-index"], [], ["loc", [null, [27, 12], [27, 79]]], 0, 0], ["inline", "partial", ["partials/main-section/browse-posts/manual-links-input"], [], ["loc", [null, [30, 12], [30, 79]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 36,
              "column": 8
            },
            "end": {
              "line": 38,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/main-section/browse-posts-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1, "type", "button");
          dom.setAttribute(el1, "class", "link editorderLink");
          var el2 = dom.createTextNode("Add Links Manually");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element1);
          return morphs;
        },
        statements: [["element", "action", ["switchMode"], [], ["loc", [null, [37, 59], [37, 82]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 38,
              "column": 8
            },
            "end": {
              "line": 40,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/main-section/browse-posts-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1, "type", "button");
          dom.setAttribute(el1, "class", "link editorderLink");
          var el2 = dom.createTextNode("Browse Posts");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [["element", "action", ["switchMode"], [], ["loc", [null, [39, 59], [39, 82]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 44,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/components/main-section/browse-posts-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "selectPosts");
        dom.setAttribute(el1, "class", "modal fade select-posts");
        dom.setAttribute(el1, "role", "dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-dialog modal-lg");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Modal content");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "close");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("×");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5, "class", "modal-title");
        var el6 = dom.createTextNode("select target posts");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h5");
        var el6 = dom.createTextNode("(");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(")");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-body");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "btn");
        var el6 = dom.createTextNode("Checkout");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element2 = dom.childAt(fragment, [2, 1, 3]);
        var element3 = dom.childAt(element2, [5]);
        var element4 = dom.childAt(element3, [1]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(dom.childAt(element2, [1, 5]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(element2, [3]), 1, 1);
        morphs[3] = dom.createElementMorph(element4);
        morphs[4] = dom.createMorphAt(element3, 3, 3);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["inline", "main-section/browse-posts/custom-comments-modal", [], ["photoId", ["subexpr", "@mut", [["get", "photoId", ["loc", [null, [1, 58], [1, 65]]], 0, 0, 0, 0]], [], [], 0, 0], "selectedService", ["subexpr", "@mut", [["get", "selectedService", ["loc", [null, [1, 82], [1, 97]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [1, 0], [1, 99]]], 0, 0], ["content", "selectedService.description", ["loc", [null, [10, 13], [10, 44]]], 0, 0, 0, 0], ["block", "if", [["subexpr", "eq", [["get", "mode", ["loc", [null, [13, 18], [13, 22]]], 0, 0, 0, 0], "automatic"], [], ["loc", [null, [13, 14], [13, 35]]], 0, 0]], [], 0, 1, ["loc", [null, [13, 8], [32, 15]]]], ["element", "action", ["validatePhotos"], [], ["loc", [null, [35, 42], [35, 69]]], 0, 0], ["block", "if", [["subexpr", "eq", [["get", "mode", ["loc", [null, [36, 18], [36, 22]]], 0, 0, 0, 0], "automatic"], [], ["loc", [null, [36, 14], [36, 35]]], 0, 0]], [], 2, 3, ["loc", [null, [36, 8], [40, 15]]]]],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  })());
});
define("xgram-frontend/templates/components/main-section/browse-posts/custom-comments-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 25,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/components/main-section/browse-posts/custom-comments-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "addComments");
        dom.setAttribute(el1, "class", "modal fade custom-comments");
        dom.setAttribute(el1, "role", "dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-dialog modal-lg");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Modal content");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "close");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("×");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5, "class", "modal-title");
        var el6 = dom.createTextNode("Add Custom Comments");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-body");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "modal-items");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "add-comment-input");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "btn");
        var el6 = dom.createTextNode("Done");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1, 3]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element0, [5]);
        var element3 = dom.childAt(element2, [3]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(element1, [1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element1, [3]), 1, 1);
        morphs[2] = dom.createMorphAt(element2, 1, 1);
        morphs[3] = dom.createElementMorph(element3);
        return morphs;
      },
      statements: [["inline", "partial", ["partials/main-section/custom-comments/index"], [], ["loc", [null, [12, 10], [12, 67]]], 0, 0], ["inline", "partial", ["partials/main-section/custom-comments/input-field"], [], ["loc", [null, [15, 10], [15, 73]]], 0, 0], ["inline", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errorMessage", ["loc", [null, [19, 40], [19, 52]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [19, 8], [19, 54]]], 0, 0], ["element", "action", ["validateComments"], [], ["loc", [null, [20, 42], [20, 71]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/components/main-section/browse-posts/error-wrapper", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 4,
                "column": 4
              },
              "end": {
                "line": 6,
                "column": 4
              }
            },
            "moduleName": "xgram-frontend/templates/components/main-section/browse-posts/error-wrapper.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["content", "error", ["loc", [null, [5, 6], [5, 15]]], 0, 0, 0, 0]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 7,
              "column": 11
            }
          },
          "moduleName": "xgram-frontend/templates/components/main-section/browse-posts/error-wrapper.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("label");
          dom.setAttribute(el1, "class", "amount-error-label");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(element0, 1, 1);
          morphs[1] = dom.createMorphAt(element0, 3, 3);
          return morphs;
        },
        statements: [["content", "attributeErrors", ["loc", [null, [3, 4], [3, 23]]], 0, 0, 0, 0], ["block", "each", [["get", "error", ["loc", [null, [4, 12], [4, 17]]], 0, 0, 0, 0], ["get", "in", ["loc", [null, [4, 18], [4, 20]]], 0, 0, 0, 0], ["get", "attributeErrors", ["loc", [null, [4, 21], [4, 36]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [4, 4], [6, 13]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 10,
            "column": 11
          }
        },
        "moduleName": "xgram-frontend/templates/components/main-section/browse-posts/error-wrapper.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" yield any custom content");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("end ");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["block", "if", [["get", "attributeErrors", ["loc", [null, [1, 6], [1, 21]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [1, 0], [7, 18]]]], ["content", "yield", ["loc", [null, [9, 0], [9, 9]]], 0, 0, 0, 0]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("xgram-frontend/templates/components/main-section/checkout-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 15,
                "column": 14
              },
              "end": {
                "line": 17,
                "column": 14
              }
            },
            "moduleName": "xgram-frontend/templates/components/main-section/checkout-modal.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "partial", ["partials/main-section/checkout/follower-item"], [], ["loc", [null, [16, 16], [16, 74]]], 0, 0]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "revision": "Ember@2.8.3",
              "loc": {
                "source": null,
                "start": {
                  "line": 18,
                  "column": 16
                },
                "end": {
                  "line": 18,
                  "column": 108
                }
              },
              "moduleName": "xgram-frontend/templates/components/main-section/checkout-modal.hbs"
            },
            isEmpty: false,
            arity: 1,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode(" ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode(" ");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
              return morphs;
            },
            statements: [["inline", "partial", ["partials/main-section/checkout/photo-item"], [], ["loc", [null, [18, 52], [18, 107]]], 0, 0]],
            locals: ["photo"],
            templates: []
          };
        })();
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 17,
                "column": 14
              },
              "end": {
                "line": 19,
                "column": 14
              }
            },
            "moduleName": "xgram-frontend/templates/components/main-section/checkout-modal.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["block", "each", [["get", "selectedPhotos", ["loc", [null, [18, 24], [18, 38]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [18, 16], [18, 117]]]]],
          locals: [],
          templates: [child0]
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 12
            },
            "end": {
              "line": 20,
              "column": 12
            }
          },
          "moduleName": "xgram-frontend/templates/components/main-section/checkout-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["subexpr", "eq", [["get", "selectedService.serviceFamily", ["loc", [null, [15, 24], [15, 53]]], 0, 0, 0, 0], "followers"], [], ["loc", [null, [15, 20], [15, 66]]], 0, 0]], [], 0, 1, ["loc", [null, [15, 14], [19, 21]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 20,
              "column": 12
            },
            "end": {
              "line": 22,
              "column": 12
            }
          },
          "moduleName": "xgram-frontend/templates/components/main-section/checkout-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/main-section/browse-posts/manual-links-index-checkout"], [], ["loc", [null, [21, 14], [21, 90]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 29,
              "column": 10
            },
            "end": {
              "line": 31,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/components/main-section/checkout-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/loader-cost"], [], ["loc", [null, [30, 12], [30, 46]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 31,
              "column": 10
            },
            "end": {
              "line": 33,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/components/main-section/checkout-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "amount");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" $");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          return morphs;
        },
        statements: [["content", "cost", ["loc", [null, [32, 33], [32, 41]]], 0, 0, 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 38,
              "column": 8
            },
            "end": {
              "line": 40,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/main-section/checkout-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/loader"], [], ["loc", [null, [39, 10], [39, 39]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child5 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 43,
                "column": 14
              },
              "end": {
                "line": 47,
                "column": 14
              }
            },
            "moduleName": "xgram-frontend/templates/components/main-section/checkout-modal.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1, "type", "button");
            dom.setAttribute(el1, "class", "link editorderLink");
            dom.setAttribute(el1, "data-dismiss", "modal");
            var el2 = dom.createTextNode("\n                  Edit Order\n                ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createElementMorph(element0);
            return morphs;
          },
          statements: [["element", "action", ["backToBrowsePosts"], [], ["loc", [null, [44, 86], [44, 116]]], 0, 0]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 40,
              "column": 8
            },
            "end": {
              "line": 54,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/main-section/checkout-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "row");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "col-md-8");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "style", "float: right;");
          var el3 = dom.createTextNode("\n              ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(dom.childAt(element1, [1]), 1, 1);
          morphs[1] = dom.createMorphAt(dom.childAt(element1, [3]), 1, 1);
          return morphs;
        },
        statements: [["block", "if", [["subexpr", "not-eq", [["get", "selectedService.serviceFamily", ["loc", [null, [43, 28], [43, 57]]], 0, 0, 0, 0], "followers"], [], ["loc", [null, [43, 20], [43, 70]]], 0, 0]], [], 0, null, ["loc", [null, [43, 14], [47, 21]]]], ["inline", "partial", ["partials/main-section/checkout/paypal-form"], [], ["loc", [null, [50, 14], [50, 70]]], 0, 0]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 59,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/components/main-section/checkout-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "orderCheckout");
        dom.setAttribute(el1, "class", "modal fade select-posts");
        dom.setAttribute(el1, "role", "dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-dialog modal-lg");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Modal content");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "close");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("×");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5, "class", "modal-title");
        var el6 = dom.createTextNode("order checkout");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h5");
        var el6 = dom.createTextNode("(");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(")");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-body");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "modal-items");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("ul");
        dom.setAttribute(el6, "class", "nav");
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "total");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "total-items");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6, "class", "title");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element2 = dom.childAt(fragment, [0, 1, 3]);
        var element3 = dom.childAt(element2, [7]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(dom.childAt(element2, [1, 5]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element2, [3, 1, 1]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(element2, [5, 1]), 3, 3);
        morphs[3] = dom.createMorphAt(element3, 1, 1);
        morphs[4] = dom.createMorphAt(element3, 3, 3);
        return morphs;
      },
      statements: [["content", "selectedService.description", ["loc", [null, [9, 13], [9, 44]]], 0, 0, 0, 0], ["block", "if", [["subexpr", "eq", [["get", "mode", ["loc", [null, [14, 22], [14, 26]]], 0, 0, 0, 0], "automatic"], [], ["loc", [null, [14, 18], [14, 39]]], 0, 0]], [], 0, 1, ["loc", [null, [14, 12], [22, 19]]]], ["block", "if", [["get", "costIsLoading", ["loc", [null, [29, 16], [29, 29]]], 0, 0, 0, 0]], [], 2, 3, ["loc", [null, [29, 10], [33, 17]]]], ["inline", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errorMessage", ["loc", [null, [37, 40], [37, 52]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [37, 8], [37, 54]]], 0, 0], ["block", "if", [["get", "isLoading", ["loc", [null, [38, 14], [38, 23]]], 0, 0, 0, 0]], [], 4, 5, ["loc", [null, [38, 8], [54, 15]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5]
    };
  })());
});
define("xgram-frontend/templates/components/news-section", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 19,
              "column": 8
            },
            "end": {
              "line": 21,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/news-section.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/loader"], [], ["loc", [null, [20, 10], [20, 39]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 21,
              "column": 8
            },
            "end": {
              "line": 23,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/news-section.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1, "class", "btn btn-full");
          dom.setAttribute(el1, "type", "button");
          var el2 = dom.createTextNode("done");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [["element", "action", ["sendEmail"], [], ["loc", [null, [22, 53], [22, 75]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 26,
              "column": 4
            },
            "end": {
              "line": 28,
              "column": 4
            }
          },
          "moduleName": "xgram-frontend/templates/components/news-section.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/news-section/successfully-subscribed"], [], ["loc", [null, [27, 6], [27, 65]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 29,
              "column": 4
            },
            "end": {
              "line": 31,
              "column": 4
            }
          },
          "moduleName": "xgram-frontend/templates/components/news-section.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/news-section/unsuccessfully-subscribed"], [], ["loc", [null, [30, 6], [30, 67]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 34,
            "column": 10
          }
        },
        "moduleName": "xgram-frontend/templates/components/news-section.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("section");
        dom.setAttribute(el1, "class", "news-section");
        dom.setAttribute(el1, "id", "section4");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "section-bg");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "container-fluid");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-12 ");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "header  text-center");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h2");
        var el7 = dom.createTextNode("Newsletter");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        var el7 = dom.createTextNode("Subscribe to our newsletter to get more offers");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-4 col-md-offset-3 col-sm-6 col-sm-offset-1");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "form-group");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-2 col-sm-4");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0, 3]);
        var element2 = dom.childAt(element1, [3]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(element2, [1, 1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element2, [3]), 1, 1);
        morphs[2] = dom.createMorphAt(element1, 5, 5);
        morphs[3] = dom.createMorphAt(element1, 6, 6);
        return morphs;
      },
      statements: [["inline", "input", [], ["type", "text", "class", "form-control", "placeholder", "Enter your E-mail address", "value", ["subexpr", "@mut", [["get", "email", ["loc", [null, [15, 97], [15, 102]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [15, 10], [15, 104]]], 0, 0], ["block", "if", [["get", "isLoading", ["loc", [null, [19, 14], [19, 23]]], 0, 0, 0, 0]], [], 0, 1, ["loc", [null, [19, 8], [23, 15]]]], ["block", "if", [["get", "succefullySubscribed", ["loc", [null, [26, 10], [26, 30]]], 0, 0, 0, 0]], [], 2, null, ["loc", [null, [26, 4], [28, 11]]]], ["block", "if", [["get", "unsuccefullySubscribed", ["loc", [null, [29, 10], [29, 32]]], 0, 0, 0, 0]], [], 3, null, ["loc", [null, [29, 4], [31, 11]]]]],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  })());
});
define("xgram-frontend/templates/components/not-approved-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 24,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/components/not-approved-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "notApprovedModal");
        dom.setAttribute(el1, "class", "modal fade bus-modal");
        dom.setAttribute(el1, "role", "dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-dialog modal-lg");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Modal content");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-content thank-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "close");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("×");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5, "class", "modal-title");
        var el6 = dom.createTextNode("unsuccessfull");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-body text-center");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h1");
        var el6 = dom.createTextNode("Unfortunately");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("There was an error occured when authorizing you on paypal. Please, review information you entered in\n          paypal.");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "col-md-12 text-center");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6, "class", "btn btn-warning");
        var el7 = dom.createElement("a");
        dom.setAttribute(el7, "href", "https://m.me/xgram.xyz");
        var el8 = dom.createTextNode("Chat with us");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "btn");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("done");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/components/not-created-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 23,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/components/not-created-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "notCreatedModal");
        dom.setAttribute(el1, "class", "modal fade bus-modal");
        dom.setAttribute(el1, "role", "dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-dialog modal-lg");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Modal content");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-content thank-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "close");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("×");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5, "class", "modal-title");
        var el6 = dom.createTextNode("unsuccessfull");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-body text-center");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h1");
        var el6 = dom.createTextNode("Unfortunately");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("There was an error occured when creating the order. Please, contact with customer support team");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "col-md-12 text-center");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6, "class", "btn btn-warning");
        var el7 = dom.createElement("a");
        dom.setAttribute(el7, "href", "https://m.me/xgram.xyz");
        var el8 = dom.createTextNode("Chat with us");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "btn");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("done");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/components/package-section", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 44,
            "column": 10
          }
        },
        "moduleName": "xgram-frontend/templates/components/package-section.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("section");
        dom.setAttribute(el1, "class", "packages-section");
        dom.setAttribute(el1, "id", "section6");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "section-bg");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "section-bg right");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "header text-center");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h2");
        var el5 = dom.createTextNode("Likes Subscription");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("We will deliver your desired amount of new Instagram likes to your Instagram post as soon as you upload it\n        without having to place a new order each time!");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-3 col-md-offset-3 col-sm-6 col-sm-offset-3");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "panel packages-panel text-center");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5, "class", "title");
        var el6 = dom.createTextNode("Limited Package");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h3");
        dom.setAttribute(el5, "class", "price");
        var el6 = dom.createTextNode("0");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("how many likes you would like for every post");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "price-content");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h3");
        var el7 = dom.createTextNode("1");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6, "class", "text");
        var el7 = dom.createTextNode("/100");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("i");
        dom.setAttribute(el7, "class", "fa fa-thumbs-up");
        dom.setAttribute(el7, "aria-hidden", "true");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode(" ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6, "class", "currency");
        var el7 = dom.createTextNode("$");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("the cost is applied for every post individually");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("a");
        dom.setAttribute(el5, "class", "btn btn-full");
        dom.setAttribute(el5, "href", "#");
        var el6 = dom.createTextNode("Choose");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-3 col-sm-6 col-md-offset-0 col-md-offset-0 col-sm-offset-3");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "panel packages-panel bus-panel text-center");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5, "class", "title");
        var el6 = dom.createTextNode("Unlimited Package");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "recomended");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h5");
        var el7 = dom.createTextNode("Recomended");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "price-content");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h3");
        var el7 = dom.createTextNode("50");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6, "class", "text");
        var el7 = dom.createTextNode("/mo");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6, "class", "currency");
        var el7 = dom.createTextNode("$");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("For 100 ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("i");
        dom.setAttribute(el6, "class", "fa fa-thumbs-up");
        dom.setAttribute(el6, "aria-hidden", "true");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" per month");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("img");
        dom.setAttribute(el5, "src", "../public../public/assets/img/infinity-symbol.png");
        dom.setAttribute(el5, "width", "70");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("Choose likes number for every post");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("a");
        dom.setAttribute(el5, "class", "btn btn-full");
        dom.setAttribute(el5, "href", "#");
        var el6 = dom.createTextNode("Choose");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [4, 7]);
        var element1 = dom.childAt(element0, [1, 1, 11]);
        var element2 = dom.childAt(element0, [3, 1, 13]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        morphs[2] = dom.createElementMorph(element1);
        morphs[3] = dom.createElementMorph(element2);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["inline", "package-section/checkout-modal", [], ["selectedService", ["subexpr", "@mut", [["get", "selectedService", ["loc", [null, [1, 49], [1, 64]]], 0, 0, 0, 0]], [], [], 0, 0], "username", ["subexpr", "@mut", [["get", "username", ["loc", [null, [1, 74], [1, 82]]], 0, 0, 0, 0]], [], [], 0, 0], "posts", ["subexpr", "@mut", [["get", "posts", ["loc", [null, [1, 89], [1, 94]]], 0, 0, 0, 0]], [], [], 0, 0], "likes", ["subexpr", "@mut", [["get", "likes", ["loc", [null, [1, 101], [1, 106]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [1, 0], [1, 108]]], 0, 0], ["inline", "package-section/package-modal", [], ["subscriptionType", ["subexpr", "@mut", [["get", "subscriptionType", ["loc", [null, [2, 49], [2, 65]]], 0, 0, 0, 0]], [], [], 0, 0], "selectedService", ["subexpr", "@mut", [["get", "selectedService", ["loc", [null, [2, 82], [2, 97]]], 0, 0, 0, 0]], [], [], 0, 0], "username", ["subexpr", "@mut", [["get", "username", ["loc", [null, [2, 107], [2, 115]]], 0, 0, 0, 0]], [], [], 0, 0], "posts", ["subexpr", "@mut", [["get", "posts", ["loc", [null, [3, 38], [3, 43]]], 0, 0, 0, 0]], [], [], 0, 0], "likes", ["subexpr", "@mut", [["get", "likes", ["loc", [null, [3, 50], [3, 55]]], 0, 0, 0, 0]], [], [], 0, 0], "setSubscriptionType", "setSubscriptionType"], ["loc", [null, [2, 0], [3, 99]]], 0, 0], ["element", "action", ["setSubscriptionType", "limited"], [], ["loc", [null, [25, 41], [25, 83]]], 0, 0], ["element", "action", ["setSubscriptionType", "unlimited"], [], ["loc", [null, [40, 41], [40, 85]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/components/package-section/checkout-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 10
            },
            "end": {
              "line": 14,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/checkout-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/package-section/limited/checkout"], [], ["loc", [null, [13, 12], [13, 67]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 10
            },
            "end": {
              "line": 16,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/checkout-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/package-section/unlimited/checkout"], [], ["loc", [null, [15, 12], [15, 69]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 22,
              "column": 12
            },
            "end": {
              "line": 24,
              "column": 12
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/checkout-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/loader"], [], ["loc", [null, [23, 14], [23, 43]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 24,
              "column": 12
            },
            "end": {
              "line": 26,
              "column": 12
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/checkout-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "amount");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" $");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          return morphs;
        },
        statements: [["content", "cost", ["loc", [null, [25, 35], [25, 43]]], 0, 0, 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 46,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/components/package-section/checkout-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "packageCheckout");
        dom.setAttribute(el1, "class", "modal fade select-posts");
        dom.setAttribute(el1, "role", "dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-dialog modal-lg");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Modal content");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "close");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("×");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5, "class", "modal-title");
        var el6 = dom.createTextNode("package checkout");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-body");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "modal-items");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "total");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "total-items");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7, "class", "title");
        var el8 = dom.createTextNode("Total");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("br");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("form");
        dom.setAttribute(el5, "method", "POST");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6, "type", "submit");
        dom.setAttribute(el6, "class", "btn");
        var el7 = dom.createTextNode("Paynow");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("button");
        dom.setAttribute(el6, "type", "button");
        dom.setAttribute(el6, "class", "link editorderLink");
        dom.setAttribute(el6, "data-dismiss", "modal");
        var el7 = dom.createTextNode("Edit\n            Subscription\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1, 3]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element0, [5, 1]);
        var element3 = dom.childAt(element2, [12]);
        var morphs = new Array(8);
        morphs[0] = dom.createMorphAt(dom.childAt(element1, [1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element1, [3, 1]), 5, 5);
        morphs[2] = dom.createAttrMorph(element2, 'action');
        morphs[3] = dom.createMorphAt(element2, 2, 2);
        morphs[4] = dom.createMorphAt(element2, 4, 4);
        morphs[5] = dom.createMorphAt(element2, 6, 6);
        morphs[6] = dom.createMorphAt(element2, 8, 8);
        morphs[7] = dom.createElementMorph(element3);
        return morphs;
      },
      statements: [["block", "if", [["subexpr", "eq", [["get", "selectedService.subType", ["loc", [null, [12, 20], [12, 43]]], 0, 0, 0, 0], "limited"], [], ["loc", [null, [12, 16], [12, 54]]], 0, 0]], [], 0, 1, ["loc", [null, [12, 10], [16, 17]]]], ["block", "if", [["get", "isCheckingout", ["loc", [null, [22, 18], [22, 31]]], 0, 0, 0, 0]], [], 2, 3, ["loc", [null, [22, 12], [26, 19]]]], ["attribute", "action", ["get", "paypalFormAction", ["loc", [null, [31, 23], [31, 39]]], 0, 0, 0, 0], 0, 0, 0, 0], ["inline", "input", [], ["name", "subscription_service_id", "type", "hidden", "value", ["subexpr", "@mut", [["get", "selectedService.id", ["loc", [null, [33, 69], [33, 87]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [33, 10], [33, 89]]], 0, 0], ["inline", "input", [], ["name", "username", "type", "hidden", "value", ["subexpr", "@mut", [["get", "username", ["loc", [null, [34, 54], [34, 62]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [34, 10], [34, 65]]], 0, 0], ["inline", "input", [], ["name", "likes_count", "type", "hidden", "value", ["subexpr", "@mut", [["get", "likes", ["loc", [null, [35, 57], [35, 62]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [35, 10], [35, 65]]], 0, 0], ["inline", "input", [], ["name", "posts_count", "type", "hidden", "value", ["subexpr", "@mut", [["get", "posts", ["loc", [null, [36, 57], [36, 62]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [36, 10], [36, 65]]], 0, 0], ["element", "action", ["backToBrowsePackage"], [], ["loc", [null, [38, 80], [38, 112]]], 0, 0]],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  })());
});
define("xgram-frontend/templates/components/package-section/package-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 8
            },
            "end": {
              "line": 10,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/package-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h4");
          dom.setAttribute(el1, "class", "modal-title");
          var el2 = dom.createTextNode("Standard package");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 10,
              "column": 8
            },
            "end": {
              "line": 12,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/package-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h4");
          dom.setAttribute(el1, "class", "modal-title");
          var el2 = dom.createTextNode("Business package");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 16,
              "column": 10
            },
            "end": {
              "line": 18,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/package-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/package-section/limited/package-header"], [], ["loc", [null, [17, 12], [17, 73]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 18,
              "column": 10
            },
            "end": {
              "line": 20,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/package-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/package-section/unlimited/package-header"], [], ["loc", [null, [19, 12], [19, 75]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 23,
              "column": 10
            },
            "end": {
              "line": 25,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/package-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/package-section/limited/input-fields"], [], ["loc", [null, [24, 12], [24, 71]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child5 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 25,
              "column": 10
            },
            "end": {
              "line": 27,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/package-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/package-section/unlimited/input-fields"], [], ["loc", [null, [26, 12], [26, 73]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child6 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 31,
              "column": 8
            },
            "end": {
              "line": 33,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/package-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/loader"], [], ["loc", [null, [32, 10], [32, 39]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child7 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 33,
              "column": 8
            },
            "end": {
              "line": 35,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/package-section/package-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1, "type", "button");
          dom.setAttribute(el1, "class", "btn");
          var el2 = dom.createTextNode("Checkout");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [["element", "action", ["validatePackage"], [], ["loc", [null, [34, 44], [34, 72]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 40,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/components/package-section/package-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "packages");
        dom.setAttribute(el1, "class", "modal fade bus-modal packages-modal");
        dom.setAttribute(el1, "role", "dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-dialog modal-lg");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Modal content");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-content bus-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "close");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("×");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-body");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "total bus");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "row");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0, 1, 3]);
        var element2 = dom.childAt(element1, [3]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(element1, [1]), 3, 3);
        morphs[1] = dom.createMorphAt(dom.childAt(element2, [1]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(element2, [3]), 1, 1);
        morphs[3] = dom.createMorphAt(dom.childAt(element1, [5]), 1, 1);
        return morphs;
      },
      statements: [["block", "if", [["subexpr", "eq", [["get", "subscriptionType", ["loc", [null, [8, 18], [8, 34]]], 0, 0, 0, 0], "limited"], [], ["loc", [null, [8, 14], [8, 45]]], 0, 0]], [], 0, 1, ["loc", [null, [8, 8], [12, 15]]]], ["block", "if", [["subexpr", "eq", [["get", "subscriptionType", ["loc", [null, [16, 20], [16, 36]]], 0, 0, 0, 0], "limited"], [], ["loc", [null, [16, 16], [16, 47]]], 0, 0]], [], 2, 3, ["loc", [null, [16, 10], [20, 17]]]], ["block", "if", [["subexpr", "eq", [["get", "subscriptionType", ["loc", [null, [23, 20], [23, 36]]], 0, 0, 0, 0], "limited"], [], ["loc", [null, [23, 16], [23, 47]]], 0, 0]], [], 4, 5, ["loc", [null, [23, 10], [27, 17]]]], ["block", "if", [["get", "isCheckingout", ["loc", [null, [31, 14], [31, 27]]], 0, 0, 0, 0]], [], 6, 7, ["loc", [null, [31, 8], [35, 15]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5, child6, child7]
    };
  })());
});
define("xgram-frontend/templates/components/stat-section", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 50,
            "column": 10
          }
        },
        "moduleName": "xgram-frontend/templates/components/stat-section.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("section");
        dom.setAttribute(el1, "class", "stat-section");
        dom.setAttribute(el1, "id", "section5");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "section-bg");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "container-fluid");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-12");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "header text-center");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h2");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-4");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "section-item text-center");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6, "class", "counter");
        var el7 = dom.createTextNode("3,500");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-4");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "section-item text-center");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6, "class", "counter");
        var el7 = dom.createTextNode("11,000");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-4");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "section-item text-center");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6, "class", "counter");
        var el7 = dom.createTextNode("330,975");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("footer");
        dom.setAttribute(el2, "class", "footer");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "container");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4, "class", "text-muted");
        var el5 = dom.createTextNode("© ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        dom.setAttribute(el4, "class", "nav pull-right");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6, "href", "https://www.facebook.com/xgram.xyz/");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("img");
        dom.setAttribute(el7, "src", "../public../public/assets/img/Shape.png");
        dom.setAttribute(el7, "alt", "");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6, "href", "#");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("img");
        dom.setAttribute(el7, "src", "../public../public/assets/img/Bitmap.png");
        dom.setAttribute(el7, "alt", "");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element1, [1, 1, 1]);
        var element3 = dom.childAt(element1, [3]);
        var morphs = new Array(6);
        morphs[0] = dom.createMorphAt(dom.childAt(element2, [1]), 0, 0);
        morphs[1] = dom.createMorphAt(dom.childAt(element2, [3]), 0, 0);
        morphs[2] = dom.createMorphAt(dom.childAt(element3, [1, 1, 3]), 0, 0);
        morphs[3] = dom.createMorphAt(dom.childAt(element3, [3, 1, 3]), 0, 0);
        morphs[4] = dom.createMorphAt(dom.childAt(element3, [5, 1, 3]), 0, 0);
        morphs[5] = dom.createMorphAt(dom.childAt(element0, [5, 1, 1]), 1, 1);
        return morphs;
      },
      statements: [["inline", "t", ["statsSection.title"], [], ["loc", [null, [7, 14], [7, 40]]], 0, 0], ["inline", "t", ["statsSection.desc"], [], ["loc", [null, [8, 13], [8, 38]]], 0, 0], ["inline", "t", ["statsSection.happyClients"], [], ["loc", [null, [16, 13], [16, 46]]], 0, 0], ["inline", "t", ["statsSection.deliveredOrders"], [], ["loc", [null, [22, 13], [22, 49]]], 0, 0], ["inline", "t", ["statsSection.likesSent"], [], ["loc", [null, [28, 13], [28, 43]]], 0, 0], ["inline", "t", ["footer"], [], ["loc", [null, [35, 38], [35, 52]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/components/status-section", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 23,
              "column": 12
            },
            "end": {
              "line": 25,
              "column": 12
            }
          },
          "moduleName": "xgram-frontend/templates/components/status-section.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/loader"], [], ["loc", [null, [24, 14], [24, 43]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 25,
              "column": 12
            },
            "end": {
              "line": 27,
              "column": 12
            }
          },
          "moduleName": "xgram-frontend/templates/components/status-section.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1, "id", "orderStatusBtn");
          dom.setAttribute(el1, "class", "btn btn-full");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(element0, 0, 0);
          return morphs;
        },
        statements: [["element", "action", ["openStatusModal"], [], ["loc", [null, [26, 63], [26, 91]]], 0, 0], ["inline", "t", ["statusSection.check_now"], [], ["loc", [null, [26, 92], [26, 123]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 33,
            "column": 10
          }
        },
        "moduleName": "xgram-frontend/templates/components/status-section.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("section");
        dom.setAttribute(el1, "class", "status-section");
        dom.setAttribute(el1, "id", "section3");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "content");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "section-bg");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "section-bg right");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "header  text-center");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h2");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "row");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "col-md-10 col-md-offset-1");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7, "class", "form-group");
        var el8 = dom.createTextNode("\n");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "col-md-4 col-md-offset-7 col-sm-6 col-sm-offset-6");
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [2, 1]);
        var element2 = dom.childAt(element1, [5]);
        var element3 = dom.childAt(element1, [7, 1, 1]);
        var element4 = dom.childAt(element3, [1, 1]);
        var morphs = new Array(6);
        morphs[0] = dom.createUnsafeMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(dom.childAt(element2, [1]), 0, 0);
        morphs[2] = dom.createMorphAt(dom.childAt(element2, [3]), 0, 0);
        morphs[3] = dom.createMorphAt(element4, 2, 2);
        morphs[4] = dom.createMorphAt(element4, 4, 4);
        morphs[5] = dom.createMorphAt(dom.childAt(element3, [3]), 1, 1);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["inline", "status-section/status-modal", [], ["orderDetails", ["subexpr", "@mut", [["get", "orderDetails", ["loc", [null, [1, 44], [1, 56]]], 0, 0, 0, 0]], [], [], 0, 0], "serviceFamily", ["subexpr", "@mut", [["get", "serviceFamily", ["loc", [null, [1, 71], [1, 84]]], 0, 0, 0, 0]], [], [], 0, 0], "serviceDescription", ["subexpr", "@mut", [["get", "serviceDescription", ["loc", [null, [2, 50], [2, 68]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [1, 0], [2, 71]]], 0, 0], ["inline", "t", ["statusSection.title"], [], ["loc", [null, [8, 10], [8, 37]]], 0, 0], ["inline", "t", ["statusSection.desc"], [], ["loc", [null, [9, 9], [9, 35]]], 0, 0], ["inline", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errorMessage", ["loc", [null, [17, 46], [17, 58]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [17, 14], [17, 60]]], 0, 0], ["inline", "input", [], ["type", "text", "class", "form-control", "placeholder", "ord-xxxxxxx", "value", ["subexpr", "@mut", [["get", "orderCode", ["loc", [null, [18, 87], [18, 96]]], 0, 0, 0, 0]], [], [], 0, 0], "enter", "openStatusModal"], ["loc", [null, [18, 14], [19, 59]]], 0, 0], ["block", "if", [["get", "isLoadingStatus", ["loc", [null, [23, 18], [23, 33]]], 0, 0, 0, 0]], [], 0, 1, ["loc", [null, [23, 12], [27, 19]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("xgram-frontend/templates/components/status-section/status-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 15,
                "column": 14
              },
              "end": {
                "line": 17,
                "column": 14
              }
            },
            "moduleName": "xgram-frontend/templates/components/status-section/status-modal.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "partial", ["partials/status-section/follower-status"], [], ["loc", [null, [16, 16], [16, 69]]], 0, 0]],
          locals: ["orderDetail"],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 12
            },
            "end": {
              "line": 18,
              "column": 12
            }
          },
          "moduleName": "xgram-frontend/templates/components/status-section/status-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "each", [["get", "orderDetails", ["loc", [null, [15, 22], [15, 34]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [15, 14], [17, 23]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    var child1 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 19,
                "column": 14
              },
              "end": {
                "line": 21,
                "column": 14
              }
            },
            "moduleName": "xgram-frontend/templates/components/status-section/status-modal.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "partial", ["partials/status-section/index-status"], [], ["loc", [null, [20, 16], [20, 66]]], 0, 0]],
          locals: ["orderDetail"],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 18,
              "column": 12
            },
            "end": {
              "line": 22,
              "column": 12
            }
          },
          "moduleName": "xgram-frontend/templates/components/status-section/status-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "each", [["get", "orderDetails", ["loc", [null, [19, 22], [19, 34]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [19, 14], [21, 23]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 32,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/components/status-section/status-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "orderStatus");
        dom.setAttribute(el1, "class", "modal fade status-modal");
        dom.setAttribute(el1, "role", "dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-dialog");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Modal content");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "close");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("×");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5, "class", "modal-title");
        var el6 = dom.createTextNode("order status");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h5");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-body");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "modal-items");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("ul");
        dom.setAttribute(el6, "class", "nav");
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "btn");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("close");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1, 3]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 5]), 0, 0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3, 1, 1]), 1, 1);
        return morphs;
      },
      statements: [["content", "serviceDescription", ["loc", [null, [9, 12], [9, 34]]], 0, 0, 0, 0], ["block", "if", [["subexpr", "eq", [["get", "serviceFamily", ["loc", [null, [14, 22], [14, 35]]], 0, 0, 0, 0], "followers"], [], ["loc", [null, [14, 18], [14, 48]]], 0, 0]], [], 0, 1, ["loc", [null, [14, 12], [22, 19]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("xgram-frontend/templates/components/thankyou-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 8
            },
            "end": {
              "line": 15,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/thankyou-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("Your order has been placed, it will be served so soon. here is the order's code for any inquiries\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("b");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1]), 0, 0);
          return morphs;
        },
        statements: [["content", "orderRow.orderCode", ["loc", [null, [14, 15], [14, 37]]], 0, 0, 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 16,
              "column": 8
            },
            "end": {
              "line": 19,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/thankyou-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("Your order has been placed, it will be served so soon. here is the order's code for any inquiries\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("b");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1]), 0, 0);
          return morphs;
        },
        statements: [["content", "subscription.orderCode", ["loc", [null, [18, 15], [18, 41]]], 0, 0, 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 53,
              "column": 8
            },
            "end": {
              "line": 55,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/thankyou-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/loader"], [], ["loc", [null, [54, 10], [54, 39]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 55,
              "column": 8
            },
            "end": {
              "line": 57,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/components/thankyou-modal.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1, "type", "button");
          dom.setAttribute(el1, "class", "btn");
          var el2 = dom.createTextNode("done");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [["element", "action", ["sendReview"], [], ["loc", [null, [56, 44], [56, 67]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 62,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/components/thankyou-modal.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "thankModal");
        dom.setAttribute(el1, "class", "modal fade bus-modal");
        dom.setAttribute(el1, "role", "dialog");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "modal-dialog modal-lg");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Modal content");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "modal-content thank-content");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "close");
        dom.setAttribute(el5, "data-dismiss", "modal");
        var el6 = dom.createTextNode("×");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5, "class", "modal-title");
        var el6 = dom.createTextNode("successful");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-body text-center");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h1");
        var el6 = dom.createTextNode("Thank you");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("br");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("Write a review");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "stars text-center");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("fieldset");
        dom.setAttribute(el6, "class", "rating");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("input");
        dom.setAttribute(el7, "type", "radio");
        dom.setAttribute(el7, "id", "star5");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("label");
        dom.setAttribute(el7, "class", "full");
        dom.setAttribute(el7, "for", "star5");
        dom.setAttribute(el7, "title", "Awesome - 5 stars");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("input");
        dom.setAttribute(el7, "type", "radio");
        dom.setAttribute(el7, "id", "star4half");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("label");
        dom.setAttribute(el7, "class", "half");
        dom.setAttribute(el7, "for", "star4half");
        dom.setAttribute(el7, "title", "Pretty good - 4.5 stars");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("input");
        dom.setAttribute(el7, "type", "radio");
        dom.setAttribute(el7, "id", "star4");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("label");
        dom.setAttribute(el7, "class", "full");
        dom.setAttribute(el7, "for", "star4");
        dom.setAttribute(el7, "title", "Pretty good - 4 stars");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("input");
        dom.setAttribute(el7, "type", "radio");
        dom.setAttribute(el7, "id", "star3half");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("label");
        dom.setAttribute(el7, "class", "half");
        dom.setAttribute(el7, "for", "star3half");
        dom.setAttribute(el7, "title", "Meh - 3.5 stars");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("input");
        dom.setAttribute(el7, "type", "radio");
        dom.setAttribute(el7, "id", "star3");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("label");
        dom.setAttribute(el7, "class", "full");
        dom.setAttribute(el7, "for", "star3");
        dom.setAttribute(el7, "title", "Meh - 3 stars");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("input");
        dom.setAttribute(el7, "type", "radio");
        dom.setAttribute(el7, "id", "star2half");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("label");
        dom.setAttribute(el7, "class", "half");
        dom.setAttribute(el7, "for", "star2half");
        dom.setAttribute(el7, "title", "Kinda bad - 2.5 stars");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("input");
        dom.setAttribute(el7, "type", "radio");
        dom.setAttribute(el7, "id", "star2");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("label");
        dom.setAttribute(el7, "class", "full");
        dom.setAttribute(el7, "for", "star2");
        dom.setAttribute(el7, "title", "Kinda bad - 2 stars");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("input");
        dom.setAttribute(el7, "type", "radio");
        dom.setAttribute(el7, "id", "star1half");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("label");
        dom.setAttribute(el7, "class", "half");
        dom.setAttribute(el7, "for", "star1half");
        dom.setAttribute(el7, "title", "Meh - 1.5 stars");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("input");
        dom.setAttribute(el7, "type", "radio");
        dom.setAttribute(el7, "id", "star1");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("label");
        dom.setAttribute(el7, "class", "full");
        dom.setAttribute(el7, "for", "star1");
        dom.setAttribute(el7, "title", "Sucks big time - 1 star");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("input");
        dom.setAttribute(el7, "type", "radio");
        dom.setAttribute(el7, "id", "starhalf");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("label");
        dom.setAttribute(el7, "class", "half");
        dom.setAttribute(el7, "for", "starhalf");
        dom.setAttribute(el7, "title", "Sucks big time - 0.5 stars");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "col-md-12");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "form-group");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "modal-footer");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0, 1, 3]);
        var element2 = dom.childAt(element1, [3]);
        var element3 = dom.childAt(element2, [10, 1]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element3, [5]);
        var element6 = dom.childAt(element3, [9]);
        var element7 = dom.childAt(element3, [13]);
        var element8 = dom.childAt(element3, [17]);
        var element9 = dom.childAt(element3, [21]);
        var element10 = dom.childAt(element3, [25]);
        var element11 = dom.childAt(element3, [29]);
        var element12 = dom.childAt(element3, [33]);
        var element13 = dom.childAt(element3, [37]);
        var morphs = new Array(14);
        morphs[0] = dom.createMorphAt(element2, 3, 3);
        morphs[1] = dom.createMorphAt(element2, 4, 4);
        morphs[2] = dom.createElementMorph(element4);
        morphs[3] = dom.createElementMorph(element5);
        morphs[4] = dom.createElementMorph(element6);
        morphs[5] = dom.createElementMorph(element7);
        morphs[6] = dom.createElementMorph(element8);
        morphs[7] = dom.createElementMorph(element9);
        morphs[8] = dom.createElementMorph(element10);
        morphs[9] = dom.createElementMorph(element11);
        morphs[10] = dom.createElementMorph(element12);
        morphs[11] = dom.createElementMorph(element13);
        morphs[12] = dom.createMorphAt(dom.childAt(element2, [12, 1]), 1, 1);
        morphs[13] = dom.createMorphAt(dom.childAt(element1, [5]), 1, 1);
        return morphs;
      },
      statements: [["block", "if", [["get", "orderRow", ["loc", [null, [12, 14], [12, 22]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [12, 8], [15, 15]]]], ["block", "if", [["get", "subscription", ["loc", [null, [16, 14], [16, 26]]], 0, 0, 0, 0]], [], 1, null, ["loc", [null, [16, 8], [19, 15]]]], ["element", "action", ["setRating", "5"], [], ["loc", [null, [24, 43], [24, 69]]], 0, 0], ["element", "action", ["setRating", "4.5"], [], ["loc", [null, [26, 47], [26, 75]]], 0, 0], ["element", "action", ["setRating", "4"], [], ["loc", [null, [28, 43], [28, 69]]], 0, 0], ["element", "action", ["setRating", "3.5"], [], ["loc", [null, [30, 47], [30, 75]]], 0, 0], ["element", "action", ["setRating", "3"], [], ["loc", [null, [32, 43], [32, 69]]], 0, 0], ["element", "action", ["setRating", "2.5"], [], ["loc", [null, [34, 47], [34, 75]]], 0, 0], ["element", "action", ["setRating", "2"], [], ["loc", [null, [36, 43], [36, 69]]], 0, 0], ["element", "action", ["setRating", "1.5"], [], ["loc", [null, [38, 47], [38, 75]]], 0, 0], ["element", "action", ["setRating", "1"], [], ["loc", [null, [40, 43], [40, 69]]], 0, 0], ["element", "action", ["setRating", "0.5"], [], ["loc", [null, [42, 46], [42, 74]]], 0, 0], ["inline", "textarea", [], ["class", "form-control", "rows", "5", "id", "comment", "placeholder", "Write a review", "value", ["subexpr", "@mut", [["get", "review", ["loc", [null, [48, 101], [48, 107]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [48, 12], [48, 109]]], 0, 0], ["block", "if", [["get", "isLoading", ["loc", [null, [53, 14], [53, 23]]], 0, 0, 0, 0]], [], 2, 3, ["loc", [null, [53, 8], [57, 15]]]]],
      locals: [],
      templates: [child0, child1, child2, child3]
    };
  })());
});
define('xgram-frontend/templates/components/x-select', ['exports', 'emberx-select/templates/components/x-select'], function (exports, _emberxSelectTemplatesComponentsXSelect) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberxSelectTemplatesComponentsXSelect['default'];
    }
  });
});
define("xgram-frontend/templates/index", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 51
          }
        },
        "moduleName": "xgram-frontend/templates/index.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["inline", "index-component", [], ["services", ["subexpr", "@mut", [["get", "model.services", ["loc", [null, [1, 27], [1, 41]]], 0, 0, 0, 0]], [], [], 0, 0], "subscriptionServices", ["subexpr", "@mut", [["get", "modal.subscriptionServices", ["loc", [null, [1, 63], [1, 89]]], 0, 0, 0, 0]], [], [], 0, 0], "orderRow", ["subexpr", "@mut", [["get", "model.orderRow", ["loc", [null, [1, 99], [1, 113]]], 0, 0, 0, 0]], [], [], 0, 0], "subscription", ["subexpr", "@mut", [["get", "model.subscription", ["loc", [null, [2, 31], [2, 49]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [1, 0], [2, 51]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/-footer", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 19,
            "column": 10
          }
        },
        "moduleName": "xgram-frontend/templates/partials/-footer.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("section");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("footer");
        dom.setAttribute(el2, "class", "footer");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "container");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4, "class", "text-muted");
        var el5 = dom.createTextNode("© 2021, Instajax, inc. All Rights Reserved.");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/-header", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 28,
            "column": 9
          }
        },
        "moduleName": "xgram-frontend/templates/partials/-header.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("header");
        dom.setAttribute(el1, "class", "top-header");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("nav");
        dom.setAttribute(el2, "class", "navbar nav__header navbar-fixed-top");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "container-fluid");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "navbar-header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5, "type", "button");
        dom.setAttribute(el5, "class", "navbar-toggle");
        dom.setAttribute(el5, "data-toggle", "collapse");
        dom.setAttribute(el5, "data-target", "#myNavbar");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6, "class", "icon-bar");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6, "class", "icon-bar");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6, "class", "icon-bar");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("img");
        dom.setAttribute(el5, "src", "../public../public/assets/img/logo.png");
        dom.setAttribute(el5, "alt", "Smiley face");
        dom.setAttribute(el5, "style", "img-responsive");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "collapse navbar-collapse pull-right nav-header");
        dom.setAttribute(el5, "id", "myNavbar");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("ul");
        dom.setAttribute(el6, "class", "nav navbar-nav");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("li");
        var el8 = dom.createElement("a");
        dom.setAttribute(el8, "href", "#section1");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("li");
        var el8 = dom.createElement("a");
        dom.setAttribute(el8, "href", "#section2");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("li");
        var el8 = dom.createElement("a");
        dom.setAttribute(el8, "href", "#section3");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("li");
        var el8 = dom.createElement("a");
        dom.setAttribute(el8, "href", "#section5");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("li");
        var el8 = dom.createElement("a");
        dom.setAttribute(el8, "href", "#");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1, 1, 3, 1, 1]);
        var element1 = dom.childAt(element0, [10, 0]);
        var morphs = new Array(6);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 0]), 0, 0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3, 0]), 0, 0);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [5, 0]), 0, 0);
        morphs[3] = dom.createMorphAt(dom.childAt(element0, [8, 0]), 0, 0);
        morphs[4] = dom.createElementMorph(element1);
        morphs[5] = dom.createMorphAt(element1, 0, 0);
        return morphs;
      },
      statements: [["inline", "t", ["whyXgram"], [], ["loc", [null, [16, 36], [16, 52]]], 0, 0], ["inline", "t", ["howItWorks"], [], ["loc", [null, [17, 36], [17, 54]]], 0, 0], ["inline", "t", ["orderStatus"], [], ["loc", [null, [18, 36], [18, 55]]], 0, 0], ["inline", "t", ["statistics"], [], ["loc", [null, [21, 36], [21, 54]]], 0, 0], ["element", "action", ["changeLanguage"], [], ["loc", [null, [22, 28], [22, 55]]], 0, 0], ["inline", "t", ["changeLanguage"], [], ["loc", [null, [22, 56], [22, 78]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/-how-section", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 45,
            "column": 10
          }
        },
        "moduleName": "xgram-frontend/templates/partials/-how-section.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("section");
        dom.setAttribute(el1, "class", "how-section");
        dom.setAttribute(el1, "id", "section2");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "section-bg");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "container-fluid");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-12");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "header  text-center");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h2");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-10 col-md-offset-1");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "row");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "col-md-3");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7, "class", "section-item text-center");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("img");
        dom.setAttribute(el8, "src", "../public../public/assets/img/document.png");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("h3");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("p");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "col-md-3");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7, "class", "section-item text-center");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("img");
        dom.setAttribute(el8, "src", "../public../public/assets/img/Paypal-icon.png");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("h3");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("p");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "col-md-3");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7, "class", "section-item text-center");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("img");
        dom.setAttribute(el8, "src", "../public../public/assets/img/analysis.png");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("h3");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("p");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "col-md-3");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7, "class", "section-item text-center");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("img");
        dom.setAttribute(el8, "src", "../public../public/assets/img/certificate.png");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("h3");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("p");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3, 1]);
        var element1 = dom.childAt(element0, [3, 1]);
        var element2 = dom.childAt(element1, [1, 1]);
        var element3 = dom.childAt(element1, [3, 1]);
        var element4 = dom.childAt(element1, [5, 1]);
        var element5 = dom.childAt(element1, [7, 1]);
        var morphs = new Array(9);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 1, 1]), 0, 0);
        morphs[1] = dom.createMorphAt(dom.childAt(element2, [3]), 0, 0);
        morphs[2] = dom.createMorphAt(dom.childAt(element2, [5]), 0, 0);
        morphs[3] = dom.createMorphAt(dom.childAt(element3, [3]), 0, 0);
        morphs[4] = dom.createMorphAt(dom.childAt(element3, [5]), 0, 0);
        morphs[5] = dom.createMorphAt(dom.childAt(element4, [3]), 0, 0);
        morphs[6] = dom.createMorphAt(dom.childAt(element4, [5]), 0, 0);
        morphs[7] = dom.createMorphAt(dom.childAt(element5, [3]), 0, 0);
        morphs[8] = dom.createMorphAt(dom.childAt(element5, [5]), 0, 0);
        return morphs;
      },
      statements: [["inline", "t", ["howSection.title"], [], ["loc", [null, [7, 14], [7, 38]]], 0, 0], ["inline", "t", ["howSection.fill_order_form.title"], [], ["loc", [null, [16, 18], [16, 58]]], 0, 0], ["inline", "t", ["howSection.fill_order_form.desc"], [], ["loc", [null, [17, 17], [17, 56]]], 0, 0], ["inline", "t", ["howSection.pay_with_paypal.title"], [], ["loc", [null, [23, 18], [23, 58]]], 0, 0], ["inline", "t", ["howSection.pay_with_paypal.desc"], [], ["loc", [null, [24, 17], [24, 56]]], 0, 0], ["inline", "t", ["howSection.track_order.title"], [], ["loc", [null, [30, 18], [30, 54]]], 0, 0], ["inline", "t", ["howSection.track_order.desc"], [], ["loc", [null, [31, 17], [31, 52]]], 0, 0], ["inline", "t", ["howSection.magic_happens.title"], [], ["loc", [null, [37, 18], [37, 56]]], 0, 0], ["inline", "t", ["howSection.magic_happens.desc"], [], ["loc", [null, [38, 17], [38, 54]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/-loader-cost", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 39
          }
        },
        "moduleName": "xgram-frontend/templates/partials/-loader-cost.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "loader-spinner-cost");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/-loader", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 34
          }
        },
        "moduleName": "xgram-frontend/templates/partials/-loader.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "loader-spinner");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/-notification", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 12,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/-notification.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "snakbar");
        dom.setAttribute(el1, "class", "snackbar show");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-4 col-xs-9");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "snackbar-text");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-2 col-xs-3 pull-right text-right");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4, "href", "#");
        dom.setAttribute(el4, "onclick", "closeSanckbar();");
        var el5 = dom.createElement("img");
        dom.setAttribute(el5, "src", "../public../public/assets/img/close.png");
        dom.setAttribute(el5, "alt", "close");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1, 1, 1, 1]), 0, 0);
        return morphs;
      },
      statements: [["content", "notification_text", ["loc", [null, [5, 14], [5, 35]]], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/-order-form", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "revision": "Ember@2.8.3",
              "loc": {
                "source": null,
                "start": {
                  "line": 12,
                  "column": 102
                },
                "end": {
                  "line": 13,
                  "column": 45
                }
              },
              "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
              dom.insertBoundary(fragment, 0);
              dom.insertBoundary(fragment, null);
              return morphs;
            },
            statements: [["inline", "t", ["selectService"], [], ["loc", [null, [13, 24], [13, 45]]], 0, 0]],
            locals: [],
            templates: []
          };
        })();
        var child1 = (function () {
          var child0 = (function () {
            return {
              meta: {
                "revision": "Ember@2.8.3",
                "loc": {
                  "source": null,
                  "start": {
                    "line": 13,
                    "column": 92
                  },
                  "end": {
                    "line": 14,
                    "column": 55
                  }
                },
                "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
              },
              isEmpty: false,
              arity: 0,
              cachedFragment: null,
              hasRendered: false,
              buildFragment: function buildFragment(dom) {
                var el0 = dom.createDocumentFragment();
                var el1 = dom.createComment("");
                dom.appendChild(el0, el1);
                return el0;
              },
              buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
                var morphs = new Array(1);
                morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
                dom.insertBoundary(fragment, 0);
                dom.insertBoundary(fragment, null);
                return morphs;
              },
              statements: [["content", "service.description", ["loc", [null, [14, 32], [14, 55]]], 0, 0, 0, 0]],
              locals: [],
              templates: []
            };
          })();
          return {
            meta: {
              "revision": "Ember@2.8.3",
              "loc": {
                "source": null,
                "start": {
                  "line": 13,
                  "column": 60
                },
                "end": {
                  "line": 15,
                  "column": 12
                }
              },
              "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
            },
            isEmpty: false,
            arity: 1,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode(" ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n            ");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var morphs = new Array(1);
              morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
              return morphs;
            },
            statements: [["block", "xs.option", [], ["value", ["subexpr", "@mut", [["get", "service.id", ["loc", [null, [14, 20], [14, 30]]], 0, 0, 0, 0]], [], [], 0, 0]], 0, null, ["loc", [null, [13, 92], [14, 69]]]]],
            locals: ["service"],
            templates: [child0]
          };
        })();
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 12,
                "column": 12
              },
              "end": {
                "line": 15,
                "column": 22
              }
            },
            "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode(" ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode(" ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode(" ");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(2);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            morphs[1] = dom.createMorphAt(fragment, 3, 3, contextualElement);
            return morphs;
          },
          statements: [["block", "xs.option", [["get", "disabled", ["loc", [null, [13, 14], [13, 22]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [12, 102], [13, 59]]]], ["block", "each", [["get", "services", ["loc", [null, [13, 68], [13, 76]]], 0, 0, 0, 0]], [], 1, null, ["loc", [null, [13, 60], [15, 21]]]]],
          locals: ["xs"],
          templates: [child0, child1]
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 11,
              "column": 10
            },
            "end": {
              "line": 16,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["block", "x-select", [], ["id", "sel1", "class", "form-control", "action", ["subexpr", "action", ["setSelectedService"], [], ["loc", [null, [12, 62], [12, 91]]], 0, 0]], 0, null, ["loc", [null, [12, 12], [15, 35]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 24,
              "column": 12
            },
            "end": {
              "line": 27,
              "column": 12
            }
          },
          "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("              ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "input", [], ["type", "text", "class", "form-control", "value", ["subexpr", "@mut", [["get", "username", ["loc", [null, [25, 61], [25, 69]]], 0, 0, 0, 0]], [], [], 0, 0], "key-up", "checkUsernameValidity", "placeholder", ["subexpr", "t", ["enterUserName"], [], ["loc", [null, [26, 34], [26, 53]]], 0, 0]], ["loc", [null, [25, 14], [26, 56]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 33,
              "column": 10
            },
            "end": {
              "line": 35,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1, "class", "btn btn-full");
          dom.setAttribute(el1, "type", "submit");
          dom.setAttribute(el1, "disabled", "");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          return morphs;
        },
        statements: [["inline", "t", ["browsePosts"], [], ["loc", [null, [34, 64], [34, 83]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 36,
                "column": 12
              },
              "end": {
                "line": 38,
                "column": 12
              }
            },
            "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "partial", ["partials/loader"], [], ["loc", [null, [37, 14], [37, 43]]], 0, 0]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        var child0 = (function () {
          return {
            meta: {
              "revision": "Ember@2.8.3",
              "loc": {
                "source": null,
                "start": {
                  "line": 39,
                  "column": 14
                },
                "end": {
                  "line": 42,
                  "column": 14
                }
              },
              "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
            },
            isEmpty: false,
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("button");
              dom.setAttribute(el1, "class", "btn btn-full");
              dom.setAttribute(el1, "type", "submit");
              var el2 = dom.createComment("");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element1 = dom.childAt(fragment, [1]);
              var morphs = new Array(2);
              morphs[0] = dom.createElementMorph(element1);
              morphs[1] = dom.createMorphAt(element1, 0, 0);
              return morphs;
            },
            statements: [["element", "action", ["openBrowsePostsModal"], [], ["loc", [null, [40, 59], [40, 92]]], 0, 0], ["inline", "t", ["browsePosts"], [], ["loc", [null, [40, 93], [41, 33]]], 0, 0]],
            locals: [],
            templates: []
          };
        })();
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 38,
                "column": 12
              },
              "end": {
                "line": 43,
                "column": 12
              }
            },
            "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
            dom.insertBoundary(fragment, 0);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [["block", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errors.browsePosts", ["loc", [null, [39, 47], [39, 65]]], 0, 0, 0, 0]], [], [], 0, 0]], 0, null, ["loc", [null, [39, 14], [42, 32]]]]],
          locals: [],
          templates: [child0]
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 35,
              "column": 10
            },
            "end": {
              "line": 44,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "isLoadingPosts", ["loc", [null, [36, 18], [36, 32]]], 0, 0, 0, 0]], [], 0, 1, ["loc", [null, [36, 12], [43, 19]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    var child4 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 52,
                "column": 12
              },
              "end": {
                "line": 55,
                "column": 12
              }
            },
            "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "input", [], ["type", "text", "class", "form-control", "placeholder", ["subexpr", "t", ["amount"], [], ["loc", [null, [54, 67], [54, 79]]], 0, 0], "value", ["subexpr", "@mut", [["get", "followersAmount", ["loc", [null, [54, 86], [54, 101]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [54, 14], [54, 103]]], 0, 0]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 55,
                "column": 12
              },
              "end": {
                "line": 59,
                "column": 12
              }
            },
            "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "input", [], ["type", "text", "class", "form-control", "placeholder", ["subexpr", "t", ["amount"], [], ["loc", [null, [57, 67], [57, 79]]], 0, 0], "value", ["subexpr", "@mut", [["get", "followersAmount", ["loc", [null, [57, 86], [57, 101]]], 0, 0, 0, 0]], [], [], 0, 0], "disabled", "disabled"], ["loc", [null, [57, 14], [58, 43]]], 0, 0]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 51,
              "column": 10
            },
            "end": {
              "line": 60,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["subexpr", "eq", [["get", "selectedService.serviceFamily", ["loc", [null, [52, 22], [52, 51]]], 0, 0, 0, 0], "followers"], [], ["loc", [null, [52, 18], [52, 64]]], 0, 0]], [], 0, 1, ["loc", [null, [52, 12], [59, 19]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    var child5 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 68,
                "column": 12
              },
              "end": {
                "line": 71,
                "column": 12
              }
            },
            "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("spna");
            dom.setAttribute(el1, "class", "currancy");
            var el2 = dom.createTextNode("1$");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "t", ["startingFrom"], [], ["loc", [null, [69, 14], [69, 34]]], 0, 0]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 71,
                "column": 12
              },
              "end": {
                "line": 76,
                "column": 12
              }
            },
            "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("b");
            var el2 = dom.createTextNode("\n                ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("spna");
            dom.setAttribute(el2, "class", "currancy");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode(" %");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n              ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n              ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("b");
            var el2 = dom.createTextNode("OFF");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1]), 0, 0);
            return morphs;
          },
          statements: [["content", "selectedService.salePercentage", ["loc", [null, [73, 39], [73, 73]]], 0, 0, 0, 0]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 67,
              "column": 10
            },
            "end": {
              "line": 77,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["subexpr", "eq", [["get", "selectedService.sale", ["loc", [null, [68, 22], [68, 42]]], 0, 0, 0, 0], 0], [], ["loc", [null, [68, 18], [68, 45]]], 0, 0]], [], 0, 1, ["loc", [null, [68, 12], [76, 19]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    var child6 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 77,
              "column": 10
            },
            "end": {
              "line": 80,
              "column": 10
            }
          },
          "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("spna");
          dom.setAttribute(el1, "class", "currancy");
          var el2 = dom.createTextNode("1$");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "t", ["startingFrom"], [], ["loc", [null, [78, 12], [78, 32]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child7 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 84,
              "column": 8
            },
            "end": {
              "line": 86,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "partial", ["partials/loader"], [], ["loc", [null, [85, 10], [85, 39]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child8 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 86,
              "column": 8
            },
            "end": {
              "line": 88,
              "column": 8
            }
          },
          "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1, "class", "btn btn-full");
          dom.setAttribute(el1, "type", "submit");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(element0, 0, 0);
          return morphs;
        },
        statements: [["element", "action", ["openCheckoutModal"], [], ["loc", [null, [87, 53], [87, 83]]], 0, 0], ["inline", "t", ["checkout"], [], ["loc", [null, [87, 84], [87, 100]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 92,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/-order-form.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-6 col-md-offset-6 col-lg-6 col-lg-offset-6");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "panel place-order-panel");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "panel-heading");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "header");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-sm-12");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "form-group");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-sm-7");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "form-group");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "ui icon input loading");
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-sm-5");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "form-group");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-xs-12");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "form-group");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-xs-4");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "page-no");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-xs-6 pull-right");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element2 = dom.childAt(fragment, [0, 1]);
        var element3 = dom.childAt(element2, [5]);
        var element4 = dom.childAt(element2, [9]);
        var morphs = new Array(7);
        morphs[0] = dom.createMorphAt(dom.childAt(element2, [1, 1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element2, [3, 1, 1]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(element3, [1, 1, 1]), 1, 1);
        morphs[3] = dom.createMorphAt(dom.childAt(element3, [3, 1]), 1, 1);
        morphs[4] = dom.createMorphAt(dom.childAt(element2, [7, 1, 1]), 1, 1);
        morphs[5] = dom.createMorphAt(dom.childAt(element4, [1, 1]), 1, 1);
        morphs[6] = dom.createMorphAt(dom.childAt(element4, [3]), 1, 1);
        return morphs;
      },
      statements: [["inline", "t", ["placeAnOrder"], [], ["loc", [null, [5, 8], [5, 28]]], 0, 0], ["block", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errors.service", ["loc", [null, [11, 43], [11, 57]]], 0, 0, 0, 0]], [], [], 0, 0]], 0, null, ["loc", [null, [11, 10], [16, 28]]]], ["block", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errors.username", ["loc", [null, [24, 45], [24, 60]]], 0, 0, 0, 0]], [], [], 0, 0]], 1, null, ["loc", [null, [24, 12], [27, 30]]]], ["block", "if", [["subexpr", "eq", [["get", "selectedService.serviceFamily", ["loc", [null, [33, 20], [33, 49]]], 0, 0, 0, 0], "followers"], [], ["loc", [null, [33, 16], [33, 62]]], 0, 0]], [], 2, 3, ["loc", [null, [33, 10], [44, 17]]]], ["block", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errors.followersAmount", ["loc", [null, [51, 43], [51, 65]]], 0, 0, 0, 0]], [], [], 0, 0]], 4, null, ["loc", [null, [51, 10], [60, 28]]]], ["block", "if", [["get", "selectedService", ["loc", [null, [67, 16], [67, 31]]], 0, 0, 0, 0]], [], 5, 6, ["loc", [null, [67, 10], [80, 17]]]], ["block", "if", [["get", "isLoadingCheckout", ["loc", [null, [84, 14], [84, 31]]], 0, 0, 0, 0]], [], 7, 8, ["loc", [null, [84, 8], [88, 15]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5, child6, child7, child8]
    };
  })());
});
define("xgram-frontend/templates/partials/-why-section", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 46,
            "column": 10
          }
        },
        "moduleName": "xgram-frontend/templates/partials/-why-section.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("section");
        dom.setAttribute(el1, "class", "why-section");
        dom.setAttribute(el1, "id", "section1");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "section-bg");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "container-fluid");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-12");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "header  text-center");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("h2");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("p");
        var el7 = dom.createComment("");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "col-md-10 col-md-offset-1");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "row");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "col-md-3");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7, "class", "section-item text-center");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("img");
        dom.setAttribute(el8, "src", "../public../public/assets/img/car.png");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("h3");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("p");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "col-md-3");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7, "class", "section-item text-center");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("img");
        dom.setAttribute(el8, "src", "../public../public/assets/img/wrench.png");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("h3");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("p");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "col-md-3");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7, "class", "section-item text-center");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("img");
        dom.setAttribute(el8, "src", "../public../public/assets/img/investments.png");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("h3");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("p");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6, "class", "col-md-3");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7, "class", "section-item text-center");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("img");
        dom.setAttribute(el8, "src", "../public../public/assets/img/protection.png");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("h3");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("p");
        var el9 = dom.createComment("");
        dom.appendChild(el8, el9);
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3, 1]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element0, [3, 1]);
        var element3 = dom.childAt(element2, [1, 1]);
        var element4 = dom.childAt(element2, [3, 1]);
        var element5 = dom.childAt(element2, [5, 1]);
        var element6 = dom.childAt(element2, [7, 1]);
        var morphs = new Array(10);
        morphs[0] = dom.createMorphAt(dom.childAt(element1, [1]), 0, 0);
        morphs[1] = dom.createMorphAt(dom.childAt(element1, [3]), 0, 0);
        morphs[2] = dom.createMorphAt(dom.childAt(element3, [3]), 0, 0);
        morphs[3] = dom.createMorphAt(dom.childAt(element3, [5]), 0, 0);
        morphs[4] = dom.createMorphAt(dom.childAt(element4, [3]), 0, 0);
        morphs[5] = dom.createMorphAt(dom.childAt(element4, [5]), 0, 0);
        morphs[6] = dom.createMorphAt(dom.childAt(element5, [3]), 0, 0);
        morphs[7] = dom.createMorphAt(dom.childAt(element5, [5]), 0, 0);
        morphs[8] = dom.createMorphAt(dom.childAt(element6, [3]), 0, 0);
        morphs[9] = dom.createMorphAt(dom.childAt(element6, [5]), 0, 0);
        return morphs;
      },
      statements: [["inline", "t", ["whySection.title"], [], ["loc", [null, [7, 14], [7, 38]]], 0, 0], ["inline", "t", ["whySection.desc"], [], ["loc", [null, [8, 13], [8, 36]]], 0, 0], ["inline", "t", ["whySection.speed.title"], [], ["loc", [null, [17, 18], [17, 48]]], 0, 0], ["inline", "t", ["whySection.speed.desc"], [], ["loc", [null, [18, 17], [18, 46]]], 0, 0], ["inline", "t", ["whySection.support.title"], [], ["loc", [null, [24, 18], [24, 50]]], 0, 0], ["inline", "t", ["whySection.support.desc"], [], ["loc", [null, [25, 17], [25, 48]]], 0, 0], ["inline", "t", ["whySection.privacy.title"], [], ["loc", [null, [31, 18], [31, 50]]], 0, 0], ["inline", "t", ["whySection.privacy.desc"], [], ["loc", [null, [32, 17], [32, 48]]], 0, 0], ["inline", "t", ["whySection.money_back_guarantee.title"], [], ["loc", [null, [38, 18], [38, 63]]], 0, 0], ["inline", "t", ["whySection.money_back_guarantee.desc"], [], ["loc", [null, [39, 17], [39, 61]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/main-section/browse-posts/-manual-links-index-checkout", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 8,
              "column": 2
            }
          },
          "moduleName": "xgram-frontend/templates/partials/main-section/browse-posts/-manual-links-index-checkout.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1, "class", "modal-item");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "col-lg-8 col-md-4");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("p");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode(" - ");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 1, 1]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(element0, 0, 0);
          morphs[1] = dom.createMorphAt(element0, 2, 2);
          return morphs;
        },
        statements: [["content", "link.link", ["loc", [null, [5, 11], [5, 24]]], 0, 0, 0, 0], ["content", "link.amount", ["loc", [null, [5, 27], [5, 42]]], 0, 0, 0, 0]],
        locals: ["link"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 9,
            "column": 5
          }
        },
        "moduleName": "xgram-frontend/templates/partials/main-section/browse-posts/-manual-links-index-checkout.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1, "class", "nav");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 1, 1);
        return morphs;
      },
      statements: [["block", "each", [["get", "links", ["loc", [null, [2, 10], [2, 15]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [2, 2], [8, 11]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("xgram-frontend/templates/partials/main-section/browse-posts/-manual-links-index", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 3,
                "column": 4
              },
              "end": {
                "line": 10,
                "column": 4
              }
            },
            "moduleName": "xgram-frontend/templates/partials/main-section/browse-posts/-manual-links-index.hbs"
          },
          isEmpty: false,
          arity: 1,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1, "class", "modal-item");
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2, "class", "col-lg-8 col-md-4");
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("p");
            var el4 = dom.createComment("");
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode(" - ");
            dom.appendChild(el3, el4);
            var el4 = dom.createComment("");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n        ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2, "type", "button");
            dom.setAttribute(el2, "class", "close");
            var el3 = dom.createTextNode("×");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [1, 1]);
            var element2 = dom.childAt(element0, [3]);
            var morphs = new Array(3);
            morphs[0] = dom.createMorphAt(element1, 0, 0);
            morphs[1] = dom.createMorphAt(element1, 2, 2);
            morphs[2] = dom.createElementMorph(element2);
            return morphs;
          },
          statements: [["content", "link.link", ["loc", [null, [6, 13], [6, 26]]], 0, 0, 0, 0], ["content", "link.amount", ["loc", [null, [6, 29], [6, 44]]], 0, 0, 0, 0], ["element", "action", ["removeLink", ["get", "link.id", ["loc", [null, [8, 66], [8, 73]]], 0, 0, 0, 0]], [], ["loc", [null, [8, 44], [8, 75]]], 0, 0]],
          locals: ["link"],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 11,
              "column": 2
            }
          },
          "moduleName": "xgram-frontend/templates/partials/main-section/browse-posts/-manual-links-index.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "each", [["get", "links", ["loc", [null, [3, 12], [3, 17]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [3, 4], [10, 13]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 12,
            "column": 5
          }
        },
        "moduleName": "xgram-frontend/templates/partials/main-section/browse-posts/-manual-links-index.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1, "class", "nav");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 1, 1);
        return morphs;
      },
      statements: [["block", "main-section/browse-posts/error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errors.links", ["loc", [null, [2, 61], [2, 73]]], 0, 0, 0, 0]], [], [], 0, 0]], 0, null, ["loc", [null, [2, 2], [11, 46]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("xgram-frontend/templates/partials/main-section/browse-posts/-manual-links-input", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 4
            },
            "end": {
              "line": 10,
              "column": 4
            }
          },
          "moduleName": "xgram-frontend/templates/partials/main-section/browse-posts/-manual-links-input.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "input", [], ["type", "number", "class", "form-control", "placeholder", "Amount", "value", ["subexpr", "@mut", [["get", "amount", ["loc", [null, [9, 76], [9, 82]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [9, 6], [9, 84]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 17,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/main-section/browse-posts/-manual-links-input.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-8");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-2");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-2");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3, "type", "button");
        dom.setAttribute(el3, "class", "btn btn-block");
        var el4 = dom.createTextNode("Add");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [4, 1, 1]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [2, 1]), 1, 1);
        morphs[2] = dom.createElementMorph(element0);
        return morphs;
      },
      statements: [["inline", "input", [], ["type", "text", "class", "form-control", "placeholder", "Enter Link", "value", ["subexpr", "@mut", [["get", "link", ["loc", [null, [3, 76], [3, 80]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [3, 4], [3, 82]]], 0, 0], ["block", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errors.errorMessage", ["loc", [null, [8, 37], [8, 56]]], 0, 0, 0, 0]], [], [], 0, 0]], 0, null, ["loc", [null, [8, 4], [10, 22]]]], ["element", "action", ["insertLink"], [], ["loc", [null, [15, 48], [15, 71]]], 0, 0]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("xgram-frontend/templates/partials/main-section/browse-posts/-photo-item", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 9,
                "column": 8
              },
              "end": {
                "line": 11,
                "column": 8
              }
            },
            "moduleName": "xgram-frontend/templates/partials/main-section/browse-posts/-photo-item.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "input", [], ["type", "number", "class", "form-control", "pattern", "[0-9]", "value", ["subexpr", "@mut", [["get", "photo.amount", ["loc", [null, [10, 75], [10, 87]]], 0, 0, 0, 0]], [], [], 0, 0], "disabled", "disabled"], ["loc", [null, [10, 10], [10, 109]]], 0, 0]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 11,
                "column": 8
              },
              "end": {
                "line": 13,
                "column": 8
              }
            },
            "moduleName": "xgram-frontend/templates/partials/main-section/browse-posts/-photo-item.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
            return morphs;
          },
          statements: [["inline", "input", [], ["type", "number", "class", "form-control", "pattern", "[0-9]", "value", ["subexpr", "@mut", [["get", "photo.amount", ["loc", [null, [12, 75], [12, 87]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [12, 10], [12, 89]]], 0, 0]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 4
            },
            "end": {
              "line": 15,
              "column": 4
            }
          },
          "moduleName": "xgram-frontend/templates/partials/main-section/browse-posts/-photo-item.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "post-content");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("img");
          dom.setAttribute(el2, "alt", "post");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("label");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var element2 = dom.childAt(element0, [6]);
          var morphs = new Array(5);
          morphs[0] = dom.createAttrMorph(element0, 'id');
          morphs[1] = dom.createAttrMorph(element1, 'src');
          morphs[2] = dom.createMorphAt(element0, 4, 4);
          morphs[3] = dom.createAttrMorph(element2, 'for');
          morphs[4] = dom.createMorphAt(element0, 8, 8);
          return morphs;
        },
        statements: [["attribute", "id", ["concat", ["div-", ["get", "photo.id", ["loc", [null, [4, 42], [4, 50]]], 0, 0, 0, 0]], 0, 0, 0, 0, 0], 0, 0, 0, 0], ["attribute", "src", ["get", "photo.imagePreview", ["loc", [null, [5, 19], [5, 37]]], 0, 0, 0, 0], 0, 0, 0, 0], ["inline", "input", [], ["type", "checkbox", "id", ["subexpr", "@mut", [["get", "photo.id", ["loc", [null, [7, 35], [7, 43]]], 0, 0, 0, 0]], [], [], 0, 0], "class", "checkbox styled-checkbox", "checked", ["subexpr", "@mut", [["get", "photo.isSelected", ["loc", [null, [7, 85], [7, 101]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [7, 8], [7, 103]]], 0, 0], ["attribute", "for", ["get", "photo.id", ["loc", [null, [8, 21], [8, 29]]], 0, 0, 0, 0], 0, 0, 0, 0], ["block", "if", [["subexpr", "eq", [["get", "selectedService.serviceFamily", ["loc", [null, [9, 18], [9, 47]]], 0, 0, 0, 0], "custom_comments"], [], ["loc", [null, [9, 14], [9, 66]]], 0, 0]], [], 0, 1, ["loc", [null, [9, 8], [13, 15]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 20,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/main-section/browse-posts/-photo-item.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-3");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "post-content-wrapper");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1]), 1, 1);
        return morphs;
      },
      statements: [["block", "main-section/browse-posts/error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "photo.errorMessage", ["loc", [null, [3, 63], [3, 81]]], 0, 0, 0, 0]], [], [], 0, 0]], 0, null, ["loc", [null, [3, 4], [15, 48]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("xgram-frontend/templates/partials/main-section/checkout/-follower-item", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 3,
            "column": 5
          }
        },
        "moduleName": "xgram-frontend/templates/partials/main-section/checkout/-follower-item.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("li");
        dom.setAttribute(el1, "class", "modal-item");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" × ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(element0, 0, 0);
        morphs[1] = dom.createMorphAt(element0, 2, 2);
        return morphs;
      },
      statements: [["content", "selectedService.description", ["loc", [null, [2, 5], [2, 36]]], 0, 0, 0, 0], ["content", "followersAmount", ["loc", [null, [2, 39], [2, 58]]], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/main-section/checkout/-paypal-form", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 7,
            "column": 7
          }
        },
        "moduleName": "xgram-frontend/templates/partials/main-section/checkout/-paypal-form.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1, "id", "postsForm");
        dom.setAttribute(el1, "method", "POST");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2, "id", "paynowBtn");
        dom.setAttribute(el2, "type", "submit");
        dom.setAttribute(el2, "class", "btn paynowBtn");
        var el3 = dom.createTextNode("Paynow");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [9]);
        var morphs = new Array(6);
        morphs[0] = dom.createAttrMorph(element0, 'action');
        morphs[1] = dom.createMorphAt(element0, 1, 1);
        morphs[2] = dom.createMorphAt(element0, 3, 3);
        morphs[3] = dom.createMorphAt(element0, 5, 5);
        morphs[4] = dom.createMorphAt(element0, 7, 7);
        morphs[5] = dom.createElementMorph(element1);
        return morphs;
      },
      statements: [["attribute", "action", ["get", "paypalFormAction", ["loc", [null, [1, 30], [1, 46]]], 0, 0, 0, 0], 0, 0, 0, 0], ["inline", "input", [], ["name", "service_id", "type", "hidden", "value", ["subexpr", "@mut", [["get", "selectedService.id", ["loc", [null, [2, 48], [2, 66]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [2, 2], [2, 69]]], 0, 0], ["inline", "input", [], ["name", "links", "type", "hidden", "value", ["subexpr", "@mut", [["get", "linksStr", ["loc", [null, [3, 43], [3, 51]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [3, 2], [3, 54]]], 0, 0], ["inline", "input", [], ["name", "amounts", "type", "hidden", "value", ["subexpr", "@mut", [["get", "amountsStr", ["loc", [null, [4, 45], [4, 55]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [4, 2], [4, 58]]], 0, 0], ["inline", "input", [], ["name", "custom_comments", "type", "hidden", "value", ["subexpr", "@mut", [["get", "commentsStr", ["loc", [null, [5, 53], [5, 64]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [5, 2], [5, 67]]], 0, 0], ["element", "action", ["enableIsLoading"], [], ["loc", [null, [6, 61], [6, 89]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/main-section/checkout/-photo-item", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 10,
              "column": 2
            }
          },
          "moduleName": "xgram-frontend/templates/partials/main-section/checkout/-photo-item.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "post-content checked");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("img");
          dom.setAttribute(el2, "alt", "post");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("input");
          dom.setAttribute(el2, "type", "checkbox");
          dom.setAttribute(el2, "class", "checkbox styled-checkbox");
          dom.setAttribute(el2, "checked", "true");
          dom.setAttribute(el2, "disabled", "");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("label");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          if (this.cachedFragment) {
            dom.repairClonedNode(dom.childAt(element0, [3]), [], true);
          }
          var element2 = dom.childAt(element0, [3]);
          var element3 = dom.childAt(element0, [5]);
          var morphs = new Array(5);
          morphs[0] = dom.createAttrMorph(element0, 'id');
          morphs[1] = dom.createAttrMorph(element1, 'src');
          morphs[2] = dom.createAttrMorph(element2, 'id');
          morphs[3] = dom.createAttrMorph(element3, 'for');
          morphs[4] = dom.createMorphAt(element0, 8, 8);
          return morphs;
        },
        statements: [["attribute", "id", ["concat", ["div-ch-", ["get", "photo.id", ["loc", [null, [3, 51], [3, 59]]], 0, 0, 0, 0]], 0, 0, 0, 0, 0], 0, 0, 0, 0], ["attribute", "src", ["get", "photo.imagePreview", ["loc", [null, [4, 17], [4, 35]]], 0, 0, 0, 0], 0, 0, 0, 0], ["attribute", "id", ["concat", ["ch-", ["get", "photo.id", ["loc", [null, [5, 38], [5, 46]]], 0, 0, 0, 0]], 0, 0, 0, 0, 0], 0, 0, 0, 0], ["attribute", "for", ["concat", ["ch-", ["get", "photo.id", ["loc", [null, [6, 23], [6, 31]]], 0, 0, 0, 0]], 0, 0, 0, 0, 0], 0, 0, 0, 0], ["inline", "input", [], ["type", "number", "class", "form-control", "pattern", "[0-9]", "value", ["subexpr", "@mut", [["get", "photo.amount", ["loc", [null, [8, 71], [8, 83]]], 0, 0, 0, 0]], [], [], 0, 0], "disabled", "disabled"], ["loc", [null, [8, 6], [8, 105]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 11,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/main-section/checkout/-photo-item.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-3");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 1, 1);
        return morphs;
      },
      statements: [["block", "main-section/browse-posts/error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "photo.errorMessage", ["loc", [null, [2, 61], [2, 79]]], 0, 0, 0, 0]], [], [], 0, 0]], 0, null, ["loc", [null, [2, 2], [10, 46]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("xgram-frontend/templates/partials/main-section/checkout/-stripe-form", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 6,
            "column": 7
          }
        },
        "moduleName": "xgram-frontend/templates/partials/main-section/checkout/-stripe-form.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        dom.setAttribute(el1, "id", "stripe-form");
        dom.setAttribute(el1, "method", "POST");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(5);
        morphs[0] = dom.createAttrMorph(element0, 'action');
        morphs[1] = dom.createMorphAt(element0, 1, 1);
        morphs[2] = dom.createMorphAt(element0, 3, 3);
        morphs[3] = dom.createMorphAt(element0, 5, 5);
        morphs[4] = dom.createMorphAt(element0, 7, 7);
        return morphs;
      },
      statements: [["attribute", "action", ["get", "stripeFormAction", ["loc", [null, [1, 32], [1, 48]]], 0, 0, 0, 0], 0, 0, 0, 0], ["inline", "input", [], ["name", "service_id", "type", "hidden", "value", ["subexpr", "@mut", [["get", "selectedService.id", ["loc", [null, [2, 48], [2, 66]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [2, 2], [2, 69]]], 0, 0], ["inline", "input", [], ["name", "links", "type", "hidden", "value", ["subexpr", "@mut", [["get", "linksStr", ["loc", [null, [3, 43], [3, 51]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [3, 2], [3, 54]]], 0, 0], ["inline", "input", [], ["name", "amounts", "type", "hidden", "value", ["subexpr", "@mut", [["get", "amountsStr", ["loc", [null, [4, 45], [4, 55]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [4, 2], [4, 58]]], 0, 0], ["inline", "input", [], ["name", "custom_comments", "type", "hidden", "value", ["subexpr", "@mut", [["get", "commentsStr", ["loc", [null, [5, 53], [5, 64]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [5, 2], [5, 67]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/main-section/custom-comments/-index", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 3,
                "column": 4
              },
              "end": {
                "line": 8,
                "column": 4
              }
            },
            "moduleName": "xgram-frontend/templates/partials/main-section/custom-comments/-index.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("      ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1, "class", "modal-item");
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("p");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2, "type", "button");
            dom.setAttribute(el2, "class", "close");
            var el3 = dom.createTextNode("×");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [3]);
            var morphs = new Array(2);
            morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 0, 0);
            morphs[1] = dom.createElementMorph(element1);
            return morphs;
          },
          statements: [["content", "comment.text", ["loc", [null, [5, 11], [5, 27]]], 0, 0, 0, 0], ["element", "action", ["removeComment", ["get", "comment.id", ["loc", [null, [6, 69], [6, 79]]], 0, 0, 0, 0]], [], ["loc", [null, [6, 44], [6, 81]]], 0, 0]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 9,
              "column": 2
            }
          },
          "moduleName": "xgram-frontend/templates/partials/main-section/custom-comments/-index.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["subexpr", "eq", [["get", "comment.photo.id", ["loc", [null, [3, 14], [3, 30]]], 0, 0, 0, 0], ["get", "photoId", ["loc", [null, [3, 31], [3, 38]]], 0, 0, 0, 0]], [], ["loc", [null, [3, 10], [3, 39]]], 0, 0]], [], 0, null, ["loc", [null, [3, 4], [8, 11]]]]],
        locals: ["comment"],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 10,
            "column": 5
          }
        },
        "moduleName": "xgram-frontend/templates/partials/main-section/custom-comments/-index.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1, "class", "nav");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 1, 1);
        return morphs;
      },
      statements: [["block", "each", [["get", "comments", ["loc", [null, [2, 10], [2, 18]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [2, 2], [9, 11]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define("xgram-frontend/templates/partials/main-section/custom-comments/-input-field", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 4,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/main-section/custom-comments/-input-field.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "form-group");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 2, 2);
        return morphs;
      },
      statements: [["inline", "input", [], ["type", "text", "class", "form-control", "placeholder", "Enter comment", "value", ["subexpr", "@mut", [["get", "text", ["loc", [null, [3, 77], [3, 81]]], 0, 0, 0, 0]], [], [], 0, 0], "enter", "insertComment"], ["loc", [null, [3, 2], [3, 117]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/news-section/-successfully-subscribed", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 4,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/news-section/-successfully-subscribed.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "newsletter-response newsletter-success");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2, "class", "glyphicon glyphicon-ok");
        dom.setAttribute(el2, "aria-hidden", "true");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        var el3 = dom.createTextNode("Successfully subscribed!");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/news-section/-unsuccessfully-subscribed", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 4,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/news-section/-unsuccessfully-subscribed.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "newsletter-response newsletter-error");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        dom.setAttribute(el2, "class", "glyphicon glyphicon-remove");
        dom.setAttribute(el2, "aria-hidden", "true");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("span");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 3]), 0, 0);
        return morphs;
      },
      statements: [["content", "errorMessage", ["loc", [null, [3, 8], [3, 24]]], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/package-section/limited/-checkout", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 18,
            "column": 8
          }
        },
        "moduleName": "xgram-frontend/templates/partials/package-section/limited/-checkout.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("table");
        dom.setAttribute(el1, "class", "table");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("thead");
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Username");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Package Type");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Posts count");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Likes count per post");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n  ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tbody");
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n  ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3, 1]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 0, 0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]), 0, 0);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [5]), 0, 0);
        morphs[3] = dom.createMorphAt(dom.childAt(element0, [7]), 0, 0);
        return morphs;
      },
      statements: [["content", "username", ["loc", [null, [12, 8], [12, 20]]], 0, 0, 0, 0], ["content", "selectedService.description", ["loc", [null, [13, 8], [13, 39]]], 0, 0, 0, 0], ["content", "posts", ["loc", [null, [14, 8], [14, 17]]], 0, 0, 0, 0], ["content", "likes", ["loc", [null, [15, 8], [15, 17]]], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/package-section/limited/-input-fields", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 4
            },
            "end": {
              "line": 5,
              "column": 4
            }
          },
          "moduleName": "xgram-frontend/templates/partials/package-section/limited/-input-fields.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "input", [], ["type", "text", "class", "form-control", "placeholder", "Enter your user name", "value", ["subexpr", "@mut", [["get", "username", ["loc", [null, [4, 88], [4, 96]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [4, 6], [4, 98]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 10,
              "column": 4
            },
            "end": {
              "line": 12,
              "column": 4
            }
          },
          "moduleName": "xgram-frontend/templates/partials/package-section/limited/-input-fields.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "input", [], ["type", "number", "class", "form-control", "placeholder", "Posts Number", "value", ["subexpr", "@mut", [["get", "posts", ["loc", [null, [11, 82], [11, 87]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [11, 6], [11, 89]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 17,
              "column": 4
            },
            "end": {
              "line": 19,
              "column": 4
            }
          },
          "moduleName": "xgram-frontend/templates/partials/package-section/limited/-input-fields.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "input", [], ["type", "number", "class", "form-control", "placeholder", "Likes Number", "value", ["subexpr", "@mut", [["get", "likes", ["loc", [null, [18, 82], [18, 87]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [18, 6], [18, 89]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 21,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/package-section/limited/-input-fields.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-6");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-3");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-3");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [2, 1]), 1, 1);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [4, 1]), 1, 1);
        return morphs;
      },
      statements: [["block", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errors.username", ["loc", [null, [3, 37], [3, 52]]], 0, 0, 0, 0]], [], [], 0, 0]], 0, null, ["loc", [null, [3, 4], [5, 22]]]], ["block", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errors.posts", ["loc", [null, [10, 37], [10, 49]]], 0, 0, 0, 0]], [], [], 0, 0]], 1, null, ["loc", [null, [10, 4], [12, 22]]]], ["block", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errors.likes", ["loc", [null, [17, 37], [17, 49]]], 0, 0, 0, 0]], [], [], 0, 0]], 2, null, ["loc", [null, [17, 4], [19, 22]]]]],
      locals: [],
      templates: [child0, child1, child2]
    };
  })());
});
define("xgram-frontend/templates/partials/package-section/limited/-package-header", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 15,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/package-section/limited/-package-header.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "total-items");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-2 col-sm-2 col-xs-5");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "price-content");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h3");
        var el6 = dom.createTextNode("10");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5, "class", "text");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5, "class", "currency");
        var el6 = dom.createTextNode("$");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-7 col-sm-7 col-xs-7 total-item");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("100 likes, 10 posts");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-3 col-sm-3 total-item");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4, "type", "button");
        dom.setAttribute(el4, "class", "btn btn-full");
        var el5 = dom.createTextNode("Change");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1, 5, 1]);
        var morphs = new Array(1);
        morphs[0] = dom.createElementMorph(element0);
        return morphs;
      },
      statements: [["element", "action", ["setSubscriptionType", "unlimited"], [], ["loc", [null, [12, 49], [12, 93]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/package-section/unlimited/-checkout", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 16,
            "column": 8
          }
        },
        "moduleName": "xgram-frontend/templates/partials/package-section/unlimited/-checkout.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("table");
        dom.setAttribute(el1, "class", "table");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("thead");
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Username");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Package Type");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("th");
        var el5 = dom.createTextNode("Likes count per post");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n  ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tbody");
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("tr");
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("td");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n  ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3, 1]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 0, 0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]), 0, 0);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [5]), 0, 0);
        return morphs;
      },
      statements: [["content", "username", ["loc", [null, [11, 8], [11, 20]]], 0, 0, 0, 0], ["content", "selectedService.description", ["loc", [null, [12, 8], [12, 39]]], 0, 0, 0, 0], ["content", "likes", ["loc", [null, [13, 8], [13, 17]]], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/package-section/unlimited/-input-fields", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 4
            },
            "end": {
              "line": 5,
              "column": 4
            }
          },
          "moduleName": "xgram-frontend/templates/partials/package-section/unlimited/-input-fields.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "input", [], ["type", "text", "class", "form-control", "placeholder", "Enter your user name", "value", ["subexpr", "@mut", [["get", "username", ["loc", [null, [4, 88], [4, 96]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [4, 6], [4, 98]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 10,
              "column": 4
            },
            "end": {
              "line": 12,
              "column": 4
            }
          },
          "moduleName": "xgram-frontend/templates/partials/package-section/unlimited/-input-fields.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "input", [], ["type", "number", "class", "form-control", "placeholder", "Likes Number", "value", ["subexpr", "@mut", [["get", "likes", ["loc", [null, [11, 82], [11, 87]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [11, 6], [11, 89]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 14,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/package-section/unlimited/-input-fields.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-6");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-6");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0, 1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [2, 1]), 1, 1);
        return morphs;
      },
      statements: [["block", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errors.username", ["loc", [null, [3, 37], [3, 52]]], 0, 0, 0, 0]], [], [], 0, 0]], 0, null, ["loc", [null, [3, 4], [5, 22]]]], ["block", "error-wrapper", [], ["attributeErrors", ["subexpr", "@mut", [["get", "errors.likes", ["loc", [null, [10, 37], [10, 49]]], 0, 0, 0, 0]], [], [], 0, 0]], 1, null, ["loc", [null, [10, 4], [12, 22]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define("xgram-frontend/templates/partials/package-section/unlimited/-package-header", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 15,
            "column": 6
          }
        },
        "moduleName": "xgram-frontend/templates/partials/package-section/unlimited/-package-header.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "total-items");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-2 col-sm-2 col-xs-5");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "price-content");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h3");
        var el6 = dom.createTextNode("50");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5, "class", "text");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5, "class", "currency");
        var el6 = dom.createTextNode("$");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-7 col-sm-7 col-xs-7 total-item");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("100 likes, Unlimited posts per month");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-3 col-sm-3 total-item");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4, "type", "button");
        dom.setAttribute(el4, "class", "btn btn-full");
        var el5 = dom.createTextNode("Change");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1, 5, 1]);
        var morphs = new Array(1);
        morphs[0] = dom.createElementMorph(element0);
        return morphs;
      },
      statements: [["element", "action", ["setSubscriptionType", "limited"], [], ["loc", [null, [12, 49], [12, 91]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("xgram-frontend/templates/partials/status-section/-follower-status", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 6
            },
            "end": {
              "line": 9,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-follower-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-default");
          var el2 = dom.createTextNode("placed");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 10,
              "column": 6
            },
            "end": {
              "line": 12,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-follower-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-primary");
          var el2 = dom.createTextNode("Processing....");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 6
            },
            "end": {
              "line": 15,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-follower-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-warning");
          var el2 = dom.createTextNode("pending");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 16,
              "column": 6
            },
            "end": {
              "line": 18,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-follower-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-danger");
          var el2 = dom.createTextNode("Failed");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 19,
              "column": 6
            },
            "end": {
              "line": 21,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-follower-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-success");
          var el2 = dom.createTextNode("Completed");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child5 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 22,
              "column": 6
            },
            "end": {
              "line": 24,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-follower-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-info");
          var el2 = dom.createTextNode("In Queue");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 27,
            "column": 5
          }
        },
        "moduleName": "xgram-frontend/templates/partials/status-section/-follower-status.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("li");
        dom.setAttribute(el1, "class", "modal-item");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-6 col-xs-6");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" × (");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(")");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-6 col-xs-6");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element0, [3]);
        var morphs = new Array(8);
        morphs[0] = dom.createMorphAt(element1, 0, 0);
        morphs[1] = dom.createMorphAt(element1, 2, 2);
        morphs[2] = dom.createMorphAt(element2, 1, 1);
        morphs[3] = dom.createMorphAt(element2, 2, 2);
        morphs[4] = dom.createMorphAt(element2, 3, 3);
        morphs[5] = dom.createMorphAt(element2, 4, 4);
        morphs[6] = dom.createMorphAt(element2, 5, 5);
        morphs[7] = dom.createMorphAt(element2, 6, 6);
        return morphs;
      },
      statements: [["content", "orderDetail.link", ["loc", [null, [4, 9], [4, 29]]], 0, 0, 0, 0], ["content", "orderDetail.amount", ["loc", [null, [4, 33], [4, 55]]], 0, 0, 0, 0], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [7, 16], [7, 34]]], 0, 0, 0, 0], "placed"], [], ["loc", [null, [7, 12], [7, 44]]], 0, 0]], [], 0, null, ["loc", [null, [7, 6], [9, 13]]]], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [10, 16], [10, 34]]], 0, 0, 0, 0], "processing"], [], ["loc", [null, [10, 12], [10, 48]]], 0, 0]], [], 1, null, ["loc", [null, [10, 6], [12, 13]]]], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [13, 16], [13, 34]]], 0, 0, 0, 0], "pending"], [], ["loc", [null, [13, 12], [13, 45]]], 0, 0]], [], 2, null, ["loc", [null, [13, 6], [15, 13]]]], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [16, 16], [16, 34]]], 0, 0, 0, 0], "failed"], [], ["loc", [null, [16, 12], [16, 44]]], 0, 0]], [], 3, null, ["loc", [null, [16, 6], [18, 13]]]], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [19, 16], [19, 34]]], 0, 0, 0, 0], "completed"], [], ["loc", [null, [19, 12], [19, 47]]], 0, 0]], [], 4, null, ["loc", [null, [19, 6], [21, 13]]]], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [22, 16], [22, 34]]], 0, 0, 0, 0], "in_queue"], [], ["loc", [null, [22, 12], [22, 46]]], 0, 0]], [], 5, null, ["loc", [null, [22, 6], [24, 13]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5]
    };
  })());
});
define("xgram-frontend/templates/partials/status-section/-index-status", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 6
            },
            "end": {
              "line": 9,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-index-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-default");
          var el2 = dom.createTextNode("placed");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 10,
              "column": 6
            },
            "end": {
              "line": 12,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-index-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-primary");
          var el2 = dom.createTextNode("Processing....");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 6
            },
            "end": {
              "line": 15,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-index-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-warning");
          var el2 = dom.createTextNode("pending");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 16,
              "column": 6
            },
            "end": {
              "line": 18,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-index-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-danger");
          var el2 = dom.createTextNode("Failed");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 19,
              "column": 6
            },
            "end": {
              "line": 21,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-index-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-success");
          var el2 = dom.createTextNode("Completed");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child5 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 22,
              "column": 6
            },
            "end": {
              "line": 24,
              "column": 6
            }
          },
          "moduleName": "xgram-frontend/templates/partials/status-section/-index-status.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1, "class", "status label label-info");
          var el2 = dom.createTextNode("In Queue");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 27,
            "column": 5
          }
        },
        "moduleName": "xgram-frontend/templates/partials/status-section/-index-status.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("li");
        dom.setAttribute(el1, "class", "modal-item");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-6 col-xs-6");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4, "class", "btn btn-modal");
        var el5 = dom.createTextNode("Link");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-6 col-xs-6");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element0, [3]);
        var morphs = new Array(7);
        morphs[0] = dom.createAttrMorph(element1, 'href');
        morphs[1] = dom.createMorphAt(element2, 1, 1);
        morphs[2] = dom.createMorphAt(element2, 2, 2);
        morphs[3] = dom.createMorphAt(element2, 3, 3);
        morphs[4] = dom.createMorphAt(element2, 4, 4);
        morphs[5] = dom.createMorphAt(element2, 5, 5);
        morphs[6] = dom.createMorphAt(element2, 6, 6);
        return morphs;
      },
      statements: [["attribute", "href", ["get", "orderDetail.link", ["loc", [null, [4, 38], [4, 54]]], 0, 0, 0, 0], 0, 0, 0, 0], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [7, 16], [7, 34]]], 0, 0, 0, 0], "placed"], [], ["loc", [null, [7, 12], [7, 44]]], 0, 0]], [], 0, null, ["loc", [null, [7, 6], [9, 13]]]], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [10, 16], [10, 34]]], 0, 0, 0, 0], "processing"], [], ["loc", [null, [10, 12], [10, 48]]], 0, 0]], [], 1, null, ["loc", [null, [10, 6], [12, 13]]]], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [13, 16], [13, 34]]], 0, 0, 0, 0], "pending"], [], ["loc", [null, [13, 12], [13, 45]]], 0, 0]], [], 2, null, ["loc", [null, [13, 6], [15, 13]]]], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [16, 16], [16, 34]]], 0, 0, 0, 0], "failed"], [], ["loc", [null, [16, 12], [16, 44]]], 0, 0]], [], 3, null, ["loc", [null, [16, 6], [18, 13]]]], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [19, 16], [19, 34]]], 0, 0, 0, 0], "completed"], [], ["loc", [null, [19, 12], [19, 47]]], 0, 0]], [], 4, null, ["loc", [null, [19, 6], [21, 13]]]], ["block", "if", [["subexpr", "eq", [["get", "orderDetail.status", ["loc", [null, [22, 16], [22, 34]]], 0, 0, 0, 0], "in_queue"], [], ["loc", [null, [22, 12], [22, 46]]], 0, 0]], [], 5, null, ["loc", [null, [22, 6], [24, 13]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5]
    };
  })());
});
define('xgram-frontend/utils/i18n/compile-template', ['exports', 'ember-i18n/utils/i18n/compile-template'], function (exports, _emberI18nUtilsI18nCompileTemplate) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nUtilsI18nCompileTemplate['default'];
    }
  });
});
define('xgram-frontend/utils/i18n/missing-message', ['exports', 'ember-i18n/utils/i18n/missing-message'], function (exports, _emberI18nUtilsI18nMissingMessage) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nUtilsI18nMissingMessage['default'];
    }
  });
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('xgram-frontend/config/environment', ['ember'], function(Ember) {
  var prefix = 'xgram-frontend';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("xgram-frontend/app")["default"].create({"name":"xgram-frontend","version":"0.0.0+c64d8519"});
}

/* jshint ignore:end */
//# sourceMappingURL=xgram-frontend.map
