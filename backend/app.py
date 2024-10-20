from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone

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
            date = slot['date']
            # Parse the ISO 8601 format times
            start_time = datetime.fromisoformat(slot['startTime'].replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(slot['endTime'].replace('Z', '+00:00'))
            
            # Convert to UTC if not already
            start_time = start_time.astimezone(timezone.utc)
            end_time = end_time.astimezone(timezone.utc)
            
            processed_availability.append({
                'date': date,
                'startTime': start_time.strftime("%H:%M:%S"),
                'endTime': end_time.strftime("%H:%M:%S")
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
    print(f"Finding common availability for {len(responses)} responses with event duration {event_duration} minutes")
    if not responses:
        print("No responses found")
        return []

    availability_by_date = {}
    for i, response in enumerate(responses):
        print(f"Processing response {i+1}:")
        for slot in response.availability:
            print(f"  Slot: {slot}")
            date = datetime.strptime(slot['date'], "%Y-%m-%d").date()
            start = datetime.strptime(f"{slot['date']}T{slot['startTime']}", "%Y-%m-%dT%H:%M:%S")
            end = datetime.strptime(f"{slot['date']}T{slot['endTime']}", "%Y-%m-%dT%H:%M:%S")
            
            if date not in availability_by_date:
                availability_by_date[date] = []
            availability_by_date[date].append((start, end))

    common_times = []
    for date, slots in availability_by_date.items():
        print(f"Processing date {date}:")
        slots.sort(key=lambda x: x[0])
        
        overlap_start = max(slot[0] for slot in slots)
        overlap_end = min(slot[1] for slot in slots)
        print(f"  Overlap: {overlap_start} to {overlap_end}")
        
        if overlap_end - overlap_start >= timedelta(minutes=event_duration):
            current = overlap_start
            while current + timedelta(minutes=event_duration) <= overlap_end:
                common_times.append(current)
                current += timedelta(minutes=15)

    print(f"Found {len(common_times)} common time slots")
    return common_times

def score_common_times(common_times, responses, event_duration):
    scores = {}
    for time in common_times:
        score = 0
        for response in responses:
            # Day preference
            if response.preference_day == "weekdays" and time.weekday() < 5:
                score += 1
            elif response.preference_day == "weekends" and time.weekday() >= 5:
                score += 1

            # Time preference
            hour = time.hour
            if response.preference_time == "morning" and 6 <= hour < 12:
                score += 1
            elif response.preference_time == "afternoon" and 12 <= hour < 17:
                score += 1
            elif response.preference_time == "evening" and 17 <= hour < 21:
                score += 1
            elif response.preference_time == "night" and (21 <= hour or hour < 2):
                score += 1

            # Check if the entire event duration fits within the preferred time
            event_end = time + timedelta(minutes=event_duration)
            if (response.preference_time == "morning" and event_end.hour < 12) or \
               (response.preference_time == "afternoon" and 12 <= event_end.hour < 17) or \
               (response.preference_time == "evening" and 17 <= event_end.hour < 21) or \
               (response.preference_time == "night" and (21 <= event_end.hour or event_end.hour < 2)):
                score += 1

        scores[time] = score

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
    
    for i, response in enumerate(responses):
        print(f"Response {i+1}:")
        print(f"  Name: {response.name}")
        print(f"  Availability: {response.availability}")
        print(f"  Day Preference: {response.preference_day}")
        print(f"  Time Preference: {response.preference_time}")
    
    common_times = find_common_availability(responses, event.duration)
    
    if not common_times:
        return jsonify({"message": "No common available times found", "best_times": []}), 200
    
    scores = score_common_times(common_times, responses, event.duration)
    
    if scores:
        max_score = max(scores.values())
        best_times = [{"time": time.isoformat(), "score": score} for time, score in scores.items() if score == max_score]
        best_times.sort(key=lambda x: x['time'])
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
