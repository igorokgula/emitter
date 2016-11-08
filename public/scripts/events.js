/**
 * Created by ihula on 06.11.16.
 */
var emitter = Emitter.getInstance();

emitter.addEvent("event1", Date.now());
emitter.addEvent("event2", Date.now());
emitter.addEvent("event3", Date.now());

emitter.removeEvent("event2");

class Event extends React.Component {
    render() {
        return(
            <tr>
                <td>{this.props.eventName}</td>
                <td>{this.props.date}</td>
                <td><button type="button" className="btn btn-danger" onClick={this.props.onEventRemove}>Remove</button></td>
            </tr>
        );
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
                <Event eventName={event.eventName} date={event.date} key={event.eventName} onEventRemove={() => listProps.onEventRemove(event.eventName)}/>
            );
        });

        return (
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
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
                <h1>
                    Events
                </h1>
                <EventList data={this.state.data} onEventRemove={(eventName) => this.handleEventRemove(eventName)}/>
                <EventForm onEventSubmit={(event) => this.handleEventSubmit(event)}/>
            </div>
        );
    }

    handleEventRemove(eventName) {
        emitter.removeEvent(eventName);
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