/**
 * Created by ihula on 06.11.16.
 */
var emitter = Emitter.getInstance();

emitter.addEvent("event1", Date.now());
emitter.addEvent("event2", Date.now());
emitter.addEvent("event3", Date.now());

debugger;
emitter.removeEvent("event2");

class Event extends React.Component {
    render() {
        return(
            <div className="my-event">
                {this.props.eventName}, {this.props.date}
            </div>
        );
    }
}

class EventList extends React.Component {
    render() {
        console.log(this.props.data);
        var events = this.props.data.map(function (event) {
            return (
                <Event eventName={event.eventName} date={event.date} key={event.eventName} />
            );
        });

        return (
            <div className="my-event-list">
                {events}
            </div>
        );
    }
}

class EventBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {data: emitter.events};
    }

    render() {
        return (
            <div className="my-event-box">
                <h1>
                    Events
                </h1>
                <EventList data={this.state.data}/>
            </div>
        );
    }
}

ReactDOM.render(
    <EventBox />,
    document.getElementById('content')
);