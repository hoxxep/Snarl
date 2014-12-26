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

    //TODO: add errors when id not found (IndexError?)
    //TODO: add not dismissable option
    //TODO: merge addNotification and reopenNotification?
    // eg. when id supplied then attempt to reopen it?
    //FUTURE: optional sidebar with past/missed notifications

    var Snarl = Snarl || {};

    var snarlCloseSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve" height="100px" width="100px"><g><path d="M49.5,5c-24.9,0-45,20.1-45,45s20.1,45,45,45s45-20.1,45-45S74.4,5,49.5,5z M71.3,65.2c0.3,0.3,0.5,0.7,0.5,1.1   s-0.2,0.8-0.5,1.1L67,71.8c-0.3,0.3-0.7,0.5-1.1,0.5s-0.8-0.2-1.1-0.5L49.5,56.6L34.4,71.8c-0.3,0.3-0.7,0.5-1.1,0.5   c-0.4,0-0.8-0.2-1.1-0.5l-4.3-4.4c-0.3-0.3-0.5-0.7-0.5-1.1c0-0.4,0.2-0.8,0.5-1.1L43,49.9L27.8,34.9c-0.6-0.6-0.6-1.6,0-2.3   l4.3-4.4c0.3-0.3,0.7-0.5,1.1-0.5c0.4,0,0.8,0.2,1.1,0.5l15.2,15l15.2-15c0.3-0.3,0.7-0.5,1.1-0.5s0.8,0.2,1.1,0.5l4.3,4.4   c0.6,0.6,0.6,1.6,0,2.3L56.1,49.9L71.3,65.2z"/></g></svg>';

    /** Private functions */
    function addNotificationHTML(id) {
        if (Snarl.notifications[id] === undefined) {
            Snarl.notifications[id] = {};
        }
        if (Snarl.notifications[id].element === null || Snarl.notifications[id].element === undefined) {
            var notificationContent = '<h3 class="title"></h3><p class="text"></p><div class="snarl-close"><!--<i class="fa fa-close"></i>-->' + snarlCloseSVG + '</div>',
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
    
    /**
     * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
     */
    function mergeOptions(defaults, options) {
        var merged = {}, attrname;
        for (attrname in defaults) {merged[attrname] = defaults[attrname];}
        for (attrname in options) {merged[attrname] = options[attrname];}
        return merged;
    }

    /** Public object */
    Snarl = {
        count: 0,
        notifications: {},
        defaultOptions: {
            title: '',
            text: '',
            timeout: 3000,
            action: null
        },

        setDefaultOptions: function(options) {
            Snarl.defaultOptions = mergeOptions(Snarl.defaultOptions, options);
        },

        makeID: function() {
            var id = '';
            var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

            // check ID doesn't already exist and regen if needed
            do {
                id = '';
                for(var i=0; i<5; i++) {
                    id += possible.charAt(
                        Math.floor(Math.random() * possible.length)
                    );
                }
            } while (Snarl.notifications[id] !== undefined);

            return id;
        },

        addNotification: function(options) {
            Snarl.count += 1;
            var id = Snarl.makeID();

            addNotificationHTML(id);
            Snarl.editNotification(id, options);

            return id;  // allow 3rd party code to track notification
        },

        editNotification: function(id, options) {
            addNotificationHTML(id);

            options = options || {};

            // use default options for merging
            if (Snarl.notifications[id].options === undefined) {
                Snarl.notifications[id].options = Snarl.defaultOptions;
            }
            options = mergeOptions(Snarl.notifications[id].options, options);

            var element = Snarl.notifications[id].element;

            //** Title
            element.getElementsByClassName('title')[0].textContent = options.title;

            //** Text
            element.getElementsByClassName('text')[0].textContent = options.text;

            //** Timeout
            if (options.timer !== null) {
                clearTimeout(Snarl.notifications[id].timer);
            }
            var timer = null;
            if (options.timeout !== null) {
                timer = setTimeout(function() {
                    Snarl.removeNotification(id);
                }, options.timeout);
            }
            Snarl.notifications[id].timer = timer;

            //** Click Action/Callback
            Snarl.notifications[id].action = options.action;

            Snarl.notifications[id].options = options;
        },

        reOpenNotification: function(id) {
            Snarl.editNotification(id);
        },

        removeNotification: function(id) {
            if (Snarl.notifications[id].element.parentElement !== null) {
                var notification = document.getElementById('snarl-notification-' + id);
                notification.parentElement.removeChild(notification);
                clearTimeout(Snarl.notifications[id].timer);
                Snarl.notifications[id].active = false;
                return true;
            } else {
                return false;  //false if failed to remove
            }
        },

        clickNotification: function(event) {
            if (event.toElement.getAttribute('id') === 'snarl-wrapper') {
                return;
            }

            var maxDepth = 5,
                notification = event.toElement,
                close = false;
            while (notification.className.lastIndexOf('snarl-notification') === -1) {
                if (maxDepth > 0) {
                    if (notification.className.lastIndexOf('snarl-close') !== -1) {
                        close = true;
                    }
                    notification = notification.parentElement;
                } else {
                    console.debug('Clicked inside #snarl-wrapper but no notification was found?');
                    return;
                }
            }

            var id = notification.getAttribute('id');
            id = /snarl-notification-([a-zA-Z0-9]+)/.exec(id)[1];

            if (close) {
                Snarl.removeNotification(id);
            } else {
                var action = Snarl.notifications[id].action;
                //console.log('clicking: ' + close + ' ' + action);
                if (action === undefined || action === null) {
                    return;
                } else if (typeof action === "string") {
                    //TODO: do this better
                    window.location = action;
                } else if (typeof action === "function") {
                    action(); //TODO: add some cb info (what's clicked)
                }
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
