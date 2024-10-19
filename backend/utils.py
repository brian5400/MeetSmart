# utils.py
from datetime import datetime
from collections import defaultdict

def calculate_best_time (responses):
    time_counts = defaultdict(int)
    
    for response in responses:
        for time_str in response.availability:
            try:
                time_obj = datetime.fromisoformat(time_str)
                time_counts[time_obj] += 1
            except ValueError:
                continue  # Skip invalid datetime formats
    
    if not time_counts:
        return None
    
    # Find the time with the highest count
    best_time = max(time_counts, key=time_counts.get)
    return best_time.isoformat()
