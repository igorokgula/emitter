/**
 * Created by ihula on 06.11.16.
 */

var Emitter = (function () {

    var instance;

    const DAY_TO_MILLISECOND = 24 * 60 * 60;

    function CustomEmitter() {
        this.events = [];
    }

    function Event(eventName, date) {
        this.eventName = eventName;
        this.date = date;
        this.isMissed = false;
    }

    function Subscriber(callback, delay) {
        this.timeout = setTimeout(callback, delay);
    }

    CustomEmitter.prototype = {
        addEvent: function (eventName, date) {
            var event = this.events.filter(event => event.eventName !== eventName);
            this.events.push(new Event(eventName, date));
        },
        removeEvent: function (eventName) {
            this.unsubscribe(eventName);
            this.events = this.events.filter(event => event.eventName !== eventName);
        },
        subscribe: function (eventName, callback, daysToCallbackBeforeEvent) {
            var event = this.events.find(event => event.eventName === eventName);
            if (!event)
                throw new Error(`No event present with name \'${eventName}\'`);
            var delay = event.date - Date.now() - daysToCallbackBeforeEvent * DAY_TO_MILLISECOND;
            event.subscriber = new Subscriber(callback, delay);
        },
        unsubscribe: function (eventName) {
            var event = this.events.find(event => event.eventName === eventName);
            if (event) {
                if (event.subscriber) {
                    clearTimeout(event.subscriber.timeout);
                }
                event.subscriber = undefined;
            }
        }
    };

    return {
        getInstance: function () {
            if (!instance) {
                instance = new CustomEmitter();
            }
            return instance;
        }
    };
})();