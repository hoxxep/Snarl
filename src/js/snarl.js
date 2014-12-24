;(function (window, document) {
    'use strict';

    /**

    Options
    -------

    title: set title of notification
    text: description text
    timeout: time in ms | null; for no timeout
    action: string/url | function/callback; action when notification clicked

    */

    var Snarl = Snarl || {};

    Snarl = {
        count: 0,
        notifications: {},
        addNotification: function(options) {
            var notification = "<h3>" + options.title + "</h3><p>" + options.text + "</p>",
                notificationWrapper = document.createElement('div');

            notificationWrapper.className = 'snarl-notification';
            notificationWrapper.innerHTML = notification;

            Snarl.count += 1;
            var id = 'snarl-notification-' + Snarl.count;
            Snarl.notifications[id] = options.action;
            notificationWrapper.setAttribute('id', id);

            document.getElementById('snarl-wrapper').appendChild(notificationWrapper);

            if (options.timeout === undefined) {
                options.timeout = 5000;
            }
            if (options.timeout !== null) {
                setTimeout(function() {
                    //FUTURE: remove item from dictionary
                    //Snarl.notifications[noteClass]();
                    document.getElementById('snarl-wrapper').removeChild(notificationWrapper);
                }, options.timeout);
            }
        },

        clickNotification: function(event) {
            if (event.toElement.getAttribute('id') === 'snarl-wrapper') {
                return;
            }

            var maxDepth = 3,
                notification = event.toElement;
            while (notification.className.lastIndexOf('snarl-notification') === -1) {
                if (maxDepth > 0) {
                    notification = notification.parentElement;
                } else {
                    console.debug('Clicked inside #snarl-wrapper but no notification was found?');
                    return;
                }
            }

            var id = notification.getAttribute('id');
            id = id.match(/snarl-notification-[0-9]+/)[0];

            var action = Snarl.notifications[id];
            if (action === undefined || action === null) {
                return;
            } else if (action.isString) {
                window.location = action;
            } else if (action.isFunction) {
                action(); //TODO: add some info (what's clicked)
            }
        }
    };


    function snarlInitialize() {
        console.debug('Initialising Snarl...');
        var snarlWrapper = document.createElement('div');
        snarlWrapper.setAttribute('id', 'snarl-wrapper');

        // only one event handler thanks to bubbling
        snarlWrapper.addEventListener('click', Snarl.clickNotification);
        document.body.appendChild(snarlWrapper);
    }


    /*
     * If library is injected after page has loaded
     */

    (function () {
        if (document.readyState === "complete" || document.readyState === "interactive" && document.body) {
            snarlInitialize();
        } else {
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', function factorial() {
                    document.removeEventListener('DOMContentLoaded', null, false);
                    snarlInitialize();
                }, false);
            } else if (document.attachEvent) {
                document.attachEvent('onreadystatechange', function () {
                    if (document.readyState === 'complete') {
                        document.detachEvent('onreadystatechange', null);
                        snarlInitialize();
                    }
                });
            }
        }
    })();

    window.Snarl = Snarl;
})(window, document);
