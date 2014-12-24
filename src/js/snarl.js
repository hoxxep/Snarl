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

    /** Private functions */
    function addNotificationHTML(id) {
        if (Snarl.notifications[id] === undefined) {
            Snarl.notifications[id] = {};
        }
        if (Snarl.notifications[id].element === null || Snarl.notifications[id].element === undefined) {
            var notificationContent = '<h3 class="title"></h3><p class="text"></p>',
                notificationWrapper = document.createElement('div');
            notificationWrapper.innerHTML = notificationContent;
            notificationWrapper.className = 'snarl-notification';
            notificationWrapper.setAttribute('id', 'snarl-notification-' + id);
            Snarl.notifications[id].element = notificationWrapper;
        }
        if (Snarl.notifications[id].element.parentElement === null) {
            document.getElementById('snarl-wrapper').appendChild(Snarl.notifications[id].element);
        }
    }

    /** Public object */
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
            Snarl.count += 1;
            var id = Snarl.makeID();
            while (Snarl.notifications[id] !== undefined) {
                id = Snarl.makeID();
            }

            //TODO: merge default options

            addNotificationHTML(id);
            Snarl.editNotification(id, options);

            return id;  // allow 3rd party code to manipulate notification
        },

        editNotification: function(id, options) {
            addNotificationHTML(id);

            //TODO: renew timeout on option change (resetTimer())
            var element = Snarl.notifications[id].element;
            if (options.text !== undefined) {
                element.getElementsByClassName('text')[0].textContent = options.text;
            }
            if (options.title !== undefined) {
                element.getElementsByClassName('title')[0].textContent = options.title;
            }
            if (options.timeout !== undefined) {
                if (options.timer !== null) {
                    clearTimeout(Snarl.notifications[id].timer);
                }
                var timer = null;
                if (options.timeout === undefined) {
                    options.timeout = 5000;
                }
                if (options.timeout !== null) {
                    timer = setTimeout(function() {
                        //FUTURE: remove item from dictionary?
                        Snarl.removeNotification(id);
                    }, options.timeout);
                }
                Snarl.notifications[id].timer = timer;
                Snarl.notifications[id].timeout = options.timeout;
            }
            if (options.action !== undefined) {
                Snarl.notifications[id].action = options.action;
            }
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
            return Snarl.notifications[id].element.parentElement !== null;
        },

        setTitle: function(id, title) {
            Snarl.editNotification(id, {title: title});
        },

        setText: function(id, text) {
            Snarl.editNotification(id, {text: text});
        },

        setTimeout: function(id, timeout) {
            Snarl.editNotification(id, {timeout: timeout});
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
