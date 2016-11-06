/**
 * Created by ihula on 06.11.16.
 */
var emitter = Emitter.getInstance();

emitter.addEvent("event1", Date.now());
emitter.addEvent("event2", Date.now());
emitter.addEvent("event3", Date.now());

emitter.removeEvent("event2");

emitter.subscribe("event1", "subscriber1", function () {
    console.log("SUBSCRIBE!1");
}, 2);

emitter.subscribe("event1", "subscriber2", function () {
    console.log("SUBSCRIBE!2");
}, 4);