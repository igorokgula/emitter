/**
 * Created by ihula on 06.11.16.
 */
function CustomEmitter() {
    this.events = [];
}

function Event(eventName, date) {
    this.eventName = eventName;
    this.date = date;
    this.subscribers = [];
}

function Subscriber(subscriberName, callback, daysToCallbackBeforeEvent) {
    this.subscriberName = subscriberName;
    this.callback = callback;
    this.daysToCallbackBeforeEvent = daysToCallbackBeforeEvent;
}

CustomEmitter.prototype = {
    addEvent: function (eventName, date) {
        console.log(`addEvent: ${eventName}, ${date}`);
        var event = this.events.find(event => event.eventName === eventName);
        if (event) {
            event.date = date;
        } else {
            this.events.push(new Event(eventName, date));
        }
    },
    removeEvent: function (eventName) {
        console.log(`removeEvent: ${eventName}`);
        this.events = this.events.filter(event => event.eventName !== eventName);
    },
    subscribe: function (eventName, subscriberName, callback, daysToCallbackBeforeEvent) {
        console.log(`subscriber: ${eventName}, ${subscriberName}, ${callback}, ${daysToCallbackBeforeEvent}`);
        var event = this.events.find(event => event.eventName === eventName);
        if (!event)
            throw new Error(`No event present with name \'${eventName}\'`);
        var subscriber = event.subscribers.find(subscriber => subscriber.subscriberName === subscriberName);
        if (subscriber) {
            subscriber.callback = callback;
            subscriber.daysToCallbackBeforeEvent = daysToCallbackBeforeEvent;
        } else {
            event.subscribers.push(new Subscriber(subscriberName, callback, daysToCallbackBeforeEvent));
        }
    },
    unsubscribe: function (eventName, subscriberName) {
        console.log(`unsubscribe: ${eventName}, ${subscriberName}`);
        var event = this.events.find(event => event.eventName === eventName);
        if (event) {
            event.subscribers = event.subscribers.filter(subscriber => subscriber.subscriberName !== subscriberName);
        }
    }
};