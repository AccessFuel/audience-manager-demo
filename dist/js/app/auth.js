var ADMIN_HASH = '433d524d180fe3925d1c2a93cfd45aad2d8edd1b313245554a57b7864eed2005';
var ADMIN_RECOVERY_HASH = '27c4545ba62da0ade6759bfcdacca48cc84356146487d772aa12af7bf676f925';

define(function (require) {
    var $ = require('jquery');
    var State = require('state');
    var SHA256 = require('crypto-js/sha256');
    
    var showConfirmation = function (message) {
        $('.js-auth-confirmation').html(message).prop('hidden', false);
        $('input').prop('disabled', true);
        $('button[type="submit"]').hide();
    };

    var showError = function(message) {
        $('.js-auth-error').html(message).prop('hidden', false);
    };

    var hideError = function () {
        $('.js-auth-error').empty().prop('hidden', true);
    };

    var initErrors = function () {
        $('input').on('input keyup change', hideError);
    };

    var initLogin = function () {
        initErrors();
        
        $('#loginForm').on('submit', function(e) {
            var authHash = SHA256($(this).serialize()).toString();
            
            if (authHash == ADMIN_HASH)  {
                State.set('isAuthorized', true);
            } else {
                showError('Sorry, the email and password you entered do not match. Please try again.');
                State.set('isAuthorized', false);
                e.preventDefault();
            }
        });        
    };

    var initForgot = function () {
        $('#forgotForm').on('submit', function (e) {
            var forgotFormHash = SHA256($(this).serialize()).toString();
            e.preventDefault();

            if (forgotFormHash == ADMIN_RECOVERY_HASH) {
                hideError();
                showConfirmation('Password recovery information has been sent to your email.');
            } else {
                showError('This email is not associated with any account. <br/><a href="./register.html">Create new account</a>');
            }
        });
    };

    var initRegister = function () {
        $('#registerForm').on('submit', function (e) {
            showError('Cannot create new account: the Access Token is incorrect.');
            e.preventDefault();
        });
    };

    return {
        login: initLogin,
        forgot: initForgot,
        register: initRegister
    }
});