from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os

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

@app.route('/api/event/create', methods=['POST'])
def create_event():
    data = request.json
    new_event = Event(
        name=data['name'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        duration=data['duration'],
        participants_count=data['participants_count']
    )
    db.session.add(new_event)
    db.session.commit()
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
    app.run(debug=True)