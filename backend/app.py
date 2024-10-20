from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime

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

def find_common_availability(responses):
    if not responses:
        return []

    # Start with the availability of the first responder
    common_times = set(responses[0].availability)

    # Intersect with the availability of each subsequent responder
    for response in responses[1:]:
        common_times.intersection_update(response.availability)

    return list(common_times)

def score_common_times(common_availability, responses):
    scores = {}
    
    # Extract all available times from the common availability structure
    all_common_times = []
    for entry in common_availability:
        all_common_times.extend(entry['times'])  # Flatten the list of times

    for time in all_common_times:
        total_score = 0
        
        # Convert the time string to a datetime object for comparison
        time_obj = datetime.strptime(time, '%H:%M').time()  # Assuming time is in 'HH:MM' format
        
        for response in responses:
            # Example scoring logic for time preference
            if response.preference_time == "morning":
                if time_obj >= datetime.strptime("06:00", '%H:%M').time() and time_obj < datetime.strptime("12:00", '%H:%M').time():
                    total_score += 1
            
            elif response.preference_time == "afternoon":
                if time_obj >= datetime.strptime("12:00", '%H:%M').time() and time_obj < datetime.strptime("17:00", '%H:%M').time():
                    total_score += 1
            
            elif response.preference_time == "evening":
                if time_obj >= datetime.strptime("17:00", '%H:%M').time() and time_obj < datetime.strptime("21:00", '%H:%M').time():
                    total_score += 1 
            
            elif response.preference_time == "night":
                if (time_obj >= datetime.strptime("21:00", '%H:%M').time() or time_obj < datetime.strptime("02:00", '%H:%M').time()):
                    total_score += 1
            
            # Scoring logic for day preference
            # Assuming the date is part of the common availability structure
            for entry in common_availability:
                date_str = entry['date']  # Get the date string
                date_obj = datetime.strptime(date_str, '%Y-%m-%d')  # Convert to datetime object
                
                # Check if the date is a weekday or weekend
                if response.preference_day == "weekdays":
                    if date_obj.weekday() < 5:  # Monday to Friday are weekdays (0-4)
                        total_score += 1
                elif response.preference_day == "weekends":
                    if date_obj.weekday() >= 5:  # Saturday and Sunday are weekends (5-6)
                        total_score += 1
            
            # You can add more scoring criteria based on other preferences
            
        scores[time] = total_score
    
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
    responses = Response.query.filter_by(event_id=event_id).all()
    common_availability = find_common_availability(responses)  # Get common availability
    scores = score_common_times(common_availability, responses)  # Score the common times

    # Find the highest score
    if scores:
        max_score = max(scores.values())  # Get the maximum score
        best_times = [{"time": time, "score": score} for time, score in scores.items() if score == max_score]  # Get all times with the highest score
    else:
        best_times = []  # Handle case with no scores

    return jsonify({"best_times": best_times})

if __name__ == '__main__':
    if not os.path.exists('instance'):
        os.makedirs('instance')

    db_path = os.path.join('instance', 'meetsmart.db')
    
    with app.app_context():
        db.create_all()

    app.run(debug=True, port=5001)
