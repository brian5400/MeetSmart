from flask import Flask, request, jsonify, current_app
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
from sqlalchemy import text

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///meetsmart.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    participants_count = db.Column(db.Integer, nullable=False)

class Response(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    availability = db.Column(db.JSON, nullable=False)
    preference_gap = db.Column(db.Integer, nullable=False)
    preference_time = db.Column(db.String(20), nullable=False)
    preference_day = db.Column(db.String(20), nullable=False)

@app.route('/')
def home():
    return "Welcome to MeetSmart API"

@app.route('/api/event/create', methods=['POST'])
def create_event():
    data = request.json
    print(f"Received data: {data}")  # Add this line
    new_event = Event(
        name=data['name'],
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
        duration=data['duration'],
        participants_count=data['participants_count']
    )
    print(f"Created event: {new_event}")  # Add this line
    db.session.add(new_event)
    db.session.commit()

    # Force a database file sync
    db.session.execute(text('PRAGMA wal_checkpoint(FULL)'))
    
    # Get the database connection and call the sync method
    connection = db.engine.raw_connection()
    connection.execute(text('PRAGMA wal_checkpoint(FULL)'))
    connection.close()

    print(f"Event committed to database with id: {new_event.id}")
    
    # Print the database file location
    db_path = current_app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
    print(f"Database file location: {os.path.abspath(db_path)}")
    
    # Print the number of events in the database
    event_count = Event.query.count()
    print(f"Total number of events in database: {event_count}")
    
    # Check SQLite journal mode
    journal_mode = db.session.execute(text('PRAGMA journal_mode')).fetchone()[0]
    print(f"SQLite journal mode: {journal_mode}")
    
    return jsonify({"message": "Event created successfully", "event_id": new_event.id}), 201

@app.route('/api/event/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify({
        "id": event.id,
        "name": event.name,
        "start_date": event.start_date.isoformat(),
        "end_date": event.end_date.isoformat(),
        "duration": event.duration,
        "participants_count": event.participants_count
    })

@app.route('/api/response/submit', methods=['POST'])
def submit_response():
    data = request.json
    new_response = Response(
        event_id=data['event_id'],
        name=data['name'],
        availability=data['availability'],
        preference_gap=data['preference_gap'],
        preference_time=data['preference_time'],
        preference_day=data['preference_day']
    )
    db.session.add(new_response)
    db.session.commit()
    return jsonify({"message": "Response submitted successfully"}), 201

@app.route('/api/response/event/<int:event_id>', methods=['GET'])
def get_responses(event_id):
    responses = Response.query.filter_by(event_id=event_id).all()
    return jsonify([{
        "id": r.id,
        "name": r.name,
        "availability": r.availability,
        "preference_gap": r.preference_gap,
        "preference_time": r.preference_time,
        "preference_day": r.preference_day
    } for r in responses])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001) 
    app.run(debug=True)
