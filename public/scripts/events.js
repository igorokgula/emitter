/**
 * Created by ihula on 06.11.16.
 */
var emitter = Emitter.getInstance();

const LOCAL_STORAGE_EVENTS_KEY = "events";

class Event extends React.Component {

    constructor (props) {
        super(props);
        this.state = {actionName: props.actionName};
    }

    componentDidMount() {
        if (this.state.actionName === "unsubscribe") {
            this.refs.inputDaysToCallbackBeforeEvent.style.display = "none";
        }
        if (Date.now() > this.props.date) {
            this.refs.eventRemove.disabled = true;
            this.refs.inputDaysToCallbackBeforeEvent.disabled = true;
            this.refs.eventAction.disabled = true;
        }
    }

    render() {
        return(
            <tr>
                <td>{this.props.eventName}</td>
                <td>{new Date(this.props.date).toString()}</td>
                <td><button ref="eventRemove" type="button" className="btn btn-danger" onClick={() => this.props.onEvent("remove")}>Remove</button></td>
                <td>
                    <div className="input-group">
                        <input ref="inputDaysToCallbackBeforeEvent" type="number" min="0" className="form-control" value={this.state.daysToCallbackBeforeEvent}
                               onChange={(e) => this.handleChangeDaysToCallbackBeforeEvent(e)} placeholder="Number of days to fire event before defined time"/>
                        <span className="input-group-btn">
                            <button ref="eventAction" type="button" className="btn btn-success" onClick={(e) => this.handleEventSubscribe(e)} >{this.state.actionName}</button>
                        </span>
                    </div>
                </td>
            </tr>
        );
    }

    handleChangeDaysToCallbackBeforeEvent (e) {
        this.setState({daysToCallbackBeforeEvent: e.target.value});
    }

    handleEventSubscribe(e) {
        if (this.state.actionName === "subscribe") {
            e.target.parentNode.previousSibling.style.display = "none";
            this.setState({actionName: "unsubscribe"});
            this.props.onEvent("subscribe", this.state.daysToCallbackBeforeEvent);
        } else {
            e.target.parentNode.previousSibling.style.display = "inline-block";
            this.setState({actionName: "subscribe"});
            this.props.onEvent("unsubscribe");
        }

    }
}

class EventList extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        var listProps = this.props;
        var events = this.props.data.map(function (event) {
            return (
                <Event eventName={event.eventName} date={event.date} key={event.eventName} actionName={event.subscriber ? "unsubscribe" : "subscribe"}
                       onEvent={(action, daysToCallbackBeforeEvent) => listProps.onEvent(event.eventName, action, daysToCallbackBeforeEvent)}
                />
            );
        });

        return (
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Remove</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {events}
                    </tbody>
                </table>
            </div>
        );
    }
}

class EventForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {eventName: '', date: Date.now()};
    }
    render() {
        return (
            <form className="eventForm form-inline" onSubmit={(e) => this.handleSubmit(e)}>
                <h3>Add new event </h3>
                <label htmlFor="eventName">Event Name</label>
                <div className="form-group">
                    <input
                        id="eventName"
                        type="text"
                        className="form-control"
                        placeholder="Event name"
                        value={this.state.eventName}
                        onChange={(e) => this.handleEventNameChange(e)}
                    />
                </div>
                <label htmlFor="eventDate">Event date</label>
                <div className="form-group">
                    <input
                        id="eventDate"
                        type="datetime-local"
                        className="form-control"
                        placeholder="Event date"
                        value={this.state.date}
                        onChange={(e) => this.handleEventDateChange(e)}
                    />
                </div>
                <input type="submit" className="btn btn-success" value="Add" />
            </form>
        );
    }

    handleEventNameChange(e) {
        this.setState({eventName: e.target.value});
    }

    handleEventDateChange(e) {
        this.setState({date: e.target.value});
    }

    handleSubmit(e) {
        e.preventDefault();
        var eventName = this.state.eventName.trim();
        var date = this.state.date;
        if (!eventName || !date) {
            return;
        }
        this.props.onEventSubmit({eventName: eventName, date: date});
        this.setState({eventName: '', date: Date.now()});
    }
}

class EventBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {data: emitter.events};
    }

    componentDidMount() {
        this.refs.newEvent.style.display = "none";
        var events = JSON.parse(localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY));
        if (events) {
            events.forEach(event => this.handleEventSubmit(event));
            events.filter(event => event.subscriber).forEach(event => this.handleEvent(event.eventName, "subscribe", event.subscriber.daysToCallbackBeforeEvent));
        }
    }

    render() {
        return (
            <div className="my-event-box">
                <div ref="newEvent" className="alert alert-success">
                    <strong>New event {this.state.newEvent}</strong>
                </div>
                <h2>
                    Missed events:
                </h2>
                <EventList data={this.state.data.filter(event => (event.date < Date.now() && event.isMissed))}
                           onEvent={(eventName, action, daysToCallbackBeforeEvent) => this.handleEvent(eventName, action, daysToCallbackBeforeEvent)} />
                <h2>
                    Future events:
                </h2>
                <EventList data={this.state.data.filter(event => event.date >= Date.now())}
                           onEvent={(eventName, action, daysToCallbackBeforeEvent) => this.handleEvent(eventName, action, daysToCallbackBeforeEvent)} />
                <EventForm onEventSubmit={(event) => this.handleEventSubmit(event)}/>
            </div>
        );
    }

    handleEvent(eventName, action, daysToCallbackBeforeEvent) {
        var event = emitter.events.find(event => event.eventName === eventName);
        var self = this;
        switch (action) {
            case "remove":
                emitter.removeEvent(eventName);
                break;
            case "subscribe":
                if (event.date > Date.now()) {
                    event.isMissed = true;
                }
                daysToCallbackBeforeEvent = (daysToCallbackBeforeEvent ? daysToCallbackBeforeEvent : 0);
                emitter.subscribe(eventName, function () {
                    emitter.events.find((e) => e.eventName === event.eventName).isMissed = false;
                    self.refs.newEvent.style.display = "inline-block";
                }, daysToCallbackBeforeEvent);
                break;
            case "unsubscribe":
                event.isMissed = false;
                emitter.unsubscribe(eventName);
        }
        localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(emitter.events));
        this.setState({data: emitter.events});
    }

    handleEventSubmit(event) {
        var date = new Date(event.date).getTime();
        emitter.addEvent(event.eventName, date);
        if (event.isMissed) {
            emitter.events.find((e) => e.eventName === event.eventName).isMissed = true;
        }
        var self = this;
        if (date - Date.now() > 0) {
            setTimeout(function () {
                self.setState({data: emitter.events});
            }, date - Date.now());
        }
        localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(emitter.events));
        this.setState({data: emitter.events});
    }
}

ReactDOM.render(
    <EventBox />,
    document.getElementById('content')
);