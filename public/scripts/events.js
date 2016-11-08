/**
 * Created by ihula on 06.11.16.
 */
var emitter = Emitter.getInstance();

emitter.addEvent("event1", Date.now());
emitter.addEvent("event2", Date.now());
emitter.addEvent("event3", Date.now() + 60000);

class Event extends React.Component {

    constructor (props) {
        super(props);
        this.state = {actionName: "subscribe"};
    }

    componentDidMount() {
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
                            <button ref="eventAction" type="button" className="btn btn-success" onClick={(e) => this.handleEventSubscribe(e)}>{this.state.actionName}</button>
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
                <Event eventName={event.eventName} date={event.date} key={event.eventName}
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

    render() {
        return (
            <div className="my-event-box">
                <h2>
                    Missed events:
                </h2>
                <EventList data={this.state.data.filter(event => (event.date < Date.now() && event.isMissed))}
                           onEvent={(eventName, action, daysToCallbackBeforeEvent) => this.handleEvent(eventName, action, daysToCallbackBeforeEvent)} />
                <h1>
                    Events
                </h1>
                <EventList data={this.state.data.filter(event => event.date >= Date.now())} onEvent={(eventName, action, daysToCallbackBeforeEvent) => this.handleEvent(eventName, action, daysToCallbackBeforeEvent)} />
                <EventForm onEventSubmit={(event) => this.handleEventSubmit(event)}/>
            </div>
        );
    }

    handleEvent(eventName, action, daysToCallbackBeforeEvent) {
        debugger;
        switch (action) {
            case "remove":
                emitter.removeEvent(eventName);
                break;
            case "subscribe":
                var event = emitter.events.find(event => event.eventName === eventName);
                event.isMissed = true;
                emitter.subscribe(eventName, function () {
                    event.isMissed = false;
                    console.log(`Event ${eventName} hapened`);
                }, daysToCallbackBeforeEvent);
                break;
            case "unsubscribe":
                event.isMissed = false;
                emitter.unsubscribe(eventName);
        }
        this.setState({data: emitter.events});
    }

    handleEventSubmit(event) {
        emitter.addEvent(event.eventName, new Date(event.date).getTime());
        this.setState({data: emitter.events});
    }
}

ReactDOM.render(
    <EventBox />,
    document.getElementById('content')
);