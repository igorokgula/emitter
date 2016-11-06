/**
 * Created by ihula on 06.11.16.
 */

var Emitter = (function () {

    const DAY_TO_MILLISECOND = 24 * 60 * 60;

    var instance;

    function CustomEmitter() {
        this.events = [];
    }

    function Event(eventName, date) {
        this.eventName = eventName;
        this.date = date;
        this.subscribers = [];
    }

    function Subscriber(subscriberName, callback, delay) {
        this.subscriberName = subscriberName;
        this.timeout = setTimeout(callback, delay);
    }

    CustomEmitter.prototype = {
        addEvent: function (eventName, date) {
            var event = this.events.filter(event => event.eventName !== eventName);
            this.events.push(new Event(eventName, date));
        },
        removeEvent: function (eventName) {
            this.events.find(event => event.eventName === eventName).subscribers.forEach(subscriber => this.unsubscribe(eventName, subscriber.name));
            this.events = this.events.filter(event => event.eventName !== eventName);
        },
        subscribe: function (eventName, subscriberName, callback, daysToCallbackBeforeEvent) {
            var event = this.events.find(event => event.eventName === eventName);
            if (!event)
                throw new Error(`No event present with name \'${eventName}\'`);
            event.subscribers = event.subscribers.filter(subscriber => subscriber.subscriberName !== subscriberName);;
            var delay = event.date - Date.now() - daysToCallbackBeforeEvent * DAY_TO_MILLISECOND;
            event.subscribers.push(new Subscriber(subscriberName, callback, delay));
        },
        unsubscribe: function (eventName, subscriberName) {
            var event = this.events.find(event => event.eventName === eventName);
            if (event) {
                var subscriber = event.subscribers.find(subscriber => subscriber.subscriberName === subscriberName);
                if (subscriber) {
                    clearTimeout(subscriber.timeout);
                }
                event.subscribers = event.subscribers.filter(subscriber => subscriber.subscriberName !== subscriberName);
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