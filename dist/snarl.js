;(function (window, document) {
    'use strict';

    /**

    Options
    -------

    title: set title of notification
    text: description text
    timeout: time in ms | null; for no timeout
    action: string/url | function/callback; action when notification clicked

    Plan
    ----

    addNotification(options): regular
    addNotificationHTML(id): run on every edit/set? (check and add base html if necessary)
    editNotification(id, options): edit existing option
    formatOptions: (?) checks options and adds defaults

    add errors when id not found (IndexError?)

    */

    var Snarl = Snarl || {};

    Snarl = {
        count: 0,
        notifications: {},

        makeID: function() {
            var text = '';
            var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

            for(var i=0; i<5; i++) {
                text += possible.charAt(
                    Math.floor(Math.random() * possible.length)
                );
            }

            return text;
        },

        addNotification: function(options) {
            var notificationText = '<h3 class="title">' + options.title + '</h3><p class="text">' + options.text + '</p>',
                notificationWrapper = document.createElement('div'),
                notification = {};

            notificationWrapper.className = 'snarl-notification';
            notificationWrapper.innerHTML = notificationText;

            Snarl.count += 1;
            var id = Snarl.makeID();
            while (Snarl.notifications[id] !== undefined) {
                id = Snarl.makeID();
            }
            notificationWrapper.setAttribute('id', 'snarl-notification-' + id);

            document.getElementById('snarl-wrapper').appendChild(notificationWrapper);

            var timer = null;
            if (options.timeout === undefined) {
                options.timeout = 5000;
            }
            if (options.timeout !== null) {
                timer = setTimeout(function() {
                    //FUTURE: remove item from dictionary
                    //document.getElementById('snarl-wrapper').removeChild(notificationWrapper);
                    Snarl.removeNotification(id);
                }, options.timeout);
            }

            notification.timeout = options.timeout;
            notification.action = options.action;
            notification.timer = timer;
            notification.active = true;
            Snarl.notifications[id] = notification;

            return id;  // allow 3rd party code to manipulate notification
        },

        removeNotification: function(id) {
            //NOTE: call callback?
            var notification = document.getElementById('snarl-notification-' + id);
            notification.parentElement.removeChild(notification);
            clearTimeout(Snarl.notifications[id].timer);
            Snarl.notifications[id].active = false;
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
            id = /snarl-notification-([a-zA-Z0-9]+)/.exec(id)[1];

            var action = Snarl.notifications[id];
            if (action === undefined || action === null) {
                return;
            } else if (action.isString) {
                window.location = action;
            } else if (action.isFunction) {
                action(); //TODO: add some info (what's clicked)
            }
        },

        isDismissed: function(id) {
            return Snarl.notifications[id].active;
        },

        setTitle: function(id, title) {
            document.getElementById('snarl-notification-' + id).getElementsByClassName('title')[0].textContent = title;
        },

        setText: function(id, text) {
            document.getElementById('snarl-notification-' + id).getElementsByClassName('text')[0].textContent = text;
        },

        setTimeout: function(id, timeout) {
            var timer = Snarl.notifications[id].timer;
            if (timer !== null) {
                clearTimeout(timer);
            }
            timer = null;
            if (timeout !== null) {
                timer = setTimeout(function() {
                    Snarl.removeNotification(id);
                }, timeout);
            }
            Snarl.notifications[id].timer = timer;
            Snarl.notifications[id].timeout = timeout;

            if (!Snarl.notifications[id].active) {
                //TODO: if is dismissed re-show notification
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
        if (document.readyState === 'complete' || document.readyState === 'interactive' && document.body) {
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
