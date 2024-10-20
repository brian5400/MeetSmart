from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
from collections import defaultdict
from supabase import create_client, Client

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Supabase client
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

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
        new_event = {
            "name": data['name'],
            "start_date": data['start_date'],
            "end_date": data['end_date'],
            "duration": data['duration'],
            "participants_count": data['participants_count']
        }
        response = supabase.table("events").insert(new_event).execute()
        print(f"Event committed to database with id: {response.data[0]['id']}")
        return jsonify({"message": "Event created successfully", "event_id": response.data[0]['id']}), 201
    except Exception as e:
        print(f"Error creating event: {str(e)}")
        return jsonify({"error": "Failed to create event"}), 500

@app.route('/api/event/<int:event_id>', methods=['GET'])
def get_event(event_id):
    response = supabase.table("events").select("*").eq("id", event_id).execute()
    event = response.data[0] if response.data else None
    
    if event:
        return jsonify({
            "eventid": event['id'],
            "name": event['name'],
            "start_date": event['start_date'],
            "end_date": event['end_date'],
            "duration": event['duration'],
            "participants_count": event['participants_count']
        })
    else:
        return jsonify({"error": "Event not found"}), 404

@app.route('/api/response/submit', methods=['POST'])
def submit_response():
    data = request.json
    print("Received response data:", data)

    try:
        # Process the availability data
        processed_availability = []
        for slot in data['availability']:
            start_datetime = datetime.strptime(slot['startTime'], "%Y-%m-%d %H:%M:%S")
            end_datetime = datetime.strptime(slot['endTime'], "%Y-%m-%d %H:%M:%S")
            processed_availability.append({
                'date': start_datetime.date().isoformat(),
                'startTime': start_datetime.time().isoformat(),
                'endTime': end_datetime.time().isoformat()
            })

        new_response = {
            "event_id": data['event_id'],
            "name": data['name'],
            "availability": processed_availability,
            "preference_gap": data['preference_gap'],
            "preference_day": data['preference_day'],
            "preference_time": data['preference_time']
        }
        response = supabase.table("responses").insert(new_response).execute()

        print("Saved response:", response.data)  # Debug print
        return jsonify({"message": "Response submitted successfully", "response_id": response.data[0]['id']}), 201

    except Exception as e:
        print("Error saving response:", str(e))  # Debug print
        return jsonify({"error": "Failed to save response", "details": str(e)}), 500

@app.route('/api/response/event/<int:event_id>', methods=['GET'])
def get_responses(event_id):
    response = supabase.table("responses").select("*").eq("event_id", event_id).execute()
    responses = response.data
    response_count = len(responses)
    return jsonify({
        "responses": responses,
        "response_count": response_count
    })

# (Other routes remain mostly unchanged)

if __name__ == '__main__':
    app.run(debug=True, port=5001)