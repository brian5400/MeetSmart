from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone
from dateutil import parser
from collections import defaultdict

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///instance/meetsmart.db')
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
    preference_day = db.Column(db.String(20), nullable=False)
    preference_time = db.Column(db.String(20), nullable=False)

@app.route('/')
def home():
    return "Welcome to MeetSmart API"

@app.route('/api/event/create', methods=['POST'])
def create_event():
    data = request.json
    print(f"Received data: {data}")
    
    # Validate required fields
    required_fields = ['name', 'start_date', 'end_date', 'duration', 'participants_count']
    for field in required_fields:
        if field not in data or data[field] is None:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    try:
        new_event = Event(
            name=data['name'],
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
            duration=int(data['duration']),
            participants_count=int(data['participants_count'])
        )
        db.session.add(new_event)
        db.session.commit()
        print(f"Event committed to database with id: {new_event.id}")
        return jsonify({"message": "Event created successfully", "event_id": new_event.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating event: {str(e)}")
        return jsonify({"error": "Failed to create event"}), 500

@app.route('/api/event/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    return jsonify({
        "eventid": event.id,
        "name": event.name,
        "start_date": event.start_date.isoformat(),
        "end_date": event.end_date.isoformat(),
        "duration": event.duration,
        "participants_count": event.participants_count  # Ensure this is included
    })

@app.route('/api/response/submit', methods=['POST'])
def submit_response():
    data = request.json
    print("Received response data:", data)  # Debug print

    try:
        # Process the availability data
        processed_availability = []
        for slot in data['availability']:
            # Parse the date and time strings
            start_datetime = datetime.strptime(slot['startTime'], "%Y-%m-%d %H:%M:%S")
            end_datetime = datetime.strptime(slot['endTime'], "%Y-%m-%d %H:%M:%S")
            
            processed_availability.append({
                'date': start_datetime.date().isoformat(),
                'startTime': start_datetime.time().isoformat(),
                'endTime': end_datetime.time().isoformat()
            })

        new_response = Response(
            event_id=data['event_id'],
            name=data['name'],
            availability=processed_availability,
            preference_gap=data['preference_gap'],
            preference_day=data['preference_day'],
            preference_time=data['preference_time']
        )
        db.session.add(new_response)
        db.session.commit()

        print("Saved response:", new_response.availability)  # Debug print
        print("Response ID:", new_response.id)  # Print the ID of the saved response

        return jsonify({"message": "Response submitted successfully", "response_id": new_response.id}), 201

    except Exception as e:
        db.session.rollback()
        print("Error saving response:", str(e))  # Debug print
        return jsonify({"error": "Failed to save response", "details": str(e)}), 500

@app.route('/api/response/event/<int:event_id>', methods=['GET'])
def get_responses(event_id):
    responses = Response.query.filter_by(event_id=event_id).all()
    response_count = len(responses)  # Count the number of responses
    return jsonify({
        "responses": [{
            "response_id": r.id,
            "name": r.name,
            "availability": r.availability,
            "preference_gap": r.preference_gap,
            "preference_time": r.preference_time,
            "preference_day": r.preference_day
        } for r in responses],
        "response_count": response_count  # Return the count of responses
    })


def find_common_availability(responses, event_duration):
    if len(responses) < 2:
        return []

    # Group slots by date and user
    slots_by_date_and_user = defaultdict(lambda: defaultdict(list))
    for response in responses:
        for slot in response.availability:
            date = slot['date']
            start = datetime.strptime(f"{date} {slot['startTime']}", "%Y-%m-%d %H:%M:%S")
            end = datetime.strptime(f"{date} {slot['endTime']}", "%Y-%m-%d %H:%M:%S")
            slots_by_date_and_user[date][response.id].append((start, end))

    print("Slots by date and user:", dict(slots_by_date_and_user))  # Debugging output

    common_times = []

    for date, user_slots in slots_by_date_and_user.items():
        if len(user_slots) < len(responses):
            continue  # Skip dates where not all users have availability

        # Find overlapping times across all users
        overlaps = []
        for user_id, slots in user_slots.items():
            user_overlap = []
            for start, end in slots:
                current = start
                while current + timedelta(minutes=event_duration) <= end:
                    user_overlap.append((current, current + timedelta(minutes=event_duration)))
                    current += timedelta(minutes=10)  # 10-minute intervals
            overlaps.append(set(user_overlap))

        # Find common times across all users
        common = set.intersection(*overlaps)
        common_times.extend(list(common))

    print("Common times found:", common_times)  # Debugging output
    return common_times

def score_common_times(common_times, responses):
    scores = {}
    for start_time, end_time in common_times:
        score = 0
        for response in responses:
            # Day preference
            if response.preference_day == "weekends" and start_time.weekday() >= 5:
                score += 1
            elif response.preference_day == "weekdays" and start_time.weekday() < 5:
                score += 1

            # Time preference
            hour = start_time.hour
            if response.preference_time == "morning" and 6 <= hour < 12:
                score += 1
            elif response.preference_time == "afternoon" and 12 <= hour < 17:
                score += 1
            elif response.preference_time == "evening" and 17 <= hour < 21:
                score += 1
            elif response.preference_time == "night" and (21 <= hour or hour < 2):
                score += 1

        scores[(start_time, end_time)] = score

    return scores

# need to CHANGE AT SOME POINT, IT SHOULD BE WRITING 
# THE DATA TO THE BEST MEETING TIME DISPLAY RATHER THAN A NEW PAGE
@app.route('/api/event/common_availability/<int:event_id>', methods=['GET'])
def common_availability(event_id):
    responses = Response.query.filter_by(event_id=event_id).all()
    common_availability = find_common_availability(responses)  # This should return the new JSON format
    
    # Calculate scores for each common time
    scores = score_common_times(common_availability, responses)
    
    return jsonify({
        "common_availability": common_availability,
        "scores": scores
    })

@app.route('/api/event/best_time/<int:event_id>', methods=['GET'])
def best_time(event_id):
    event = Event.query.get_or_404(event_id)
    responses = Response.query.filter_by(event_id=event_id).all()
    
    print(f"Event: {event.name}, Duration: {event.duration}")
    print(f"Number of responses: {len(responses)}")
    
    common_times = find_common_availability(responses, event.duration)
    print(f"Common times found: {len(common_times)}")
    
    if not common_times:
        return jsonify({"message": "No common available times found", "best_times": []}), 200
    
    scores = score_common_times(common_times, responses)
    print(f"Scores: {scores}")  # Debugging output
    
    if scores:
        max_score = max(scores.values())
        best_times = [
            {
                "time": f"{start_time.strftime('%Y-%m-%d %H:%M')}~{end_time.strftime('%Y-%m-%d %H:%M')}",
                "score": score
            }
            for (start_time, end_time), score in scores.items()
            if score == max_score
        ]
        
        # Check best_times for validity
        print(f"Best times before sorting: {best_times}")
        
        best_times.sort(key=lambda x: x['time'])  # Sort by time
    else:
        best_times = []

    print(f"Best times found: {len(best_times)}")
    return jsonify({"best_times": best_times})

if __name__ == '__main__':
    if not os.path.exists('instance'):
        os.makedirs('instance')

    db_path = os.path.join('instance', 'meetsmart.db')
    
    with app.app_context():
        db.create_all()

    app.run(debug=True, port=5001)