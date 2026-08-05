import re

with open("server.ts", "r") as f:
    content = f.read()

# Define the updates for each API
updates = {
    'Duffel / RapidAPI Flight Booking API': {'status': 'Deactivated (Local Data)', 'workload': '0%', 'latency': 'N/A'},
    'IRCTC / RailRadar Train Tracker API': {'status': 'Deactivated (Local Data)', 'workload': '0%', 'latency': 'N/A'},
    'Live Railway Station Arrivals Board': {'status': 'Deactivated (Local Data)', 'workload': '0%', 'latency': 'N/A'},
    'MSRTC Bus & Ferry Transit API': {'status': 'Deactivated (Local Data)', 'workload': '0%', 'latency': 'N/A'}
}

for name, data in updates.items():
    # Regex to find the block for the specific API
    pattern = re.compile(rf"(name:\s*'{name}'.*?status:\s*')[^']+(\'.*?latency:\s*')[^']+(\'.*?workload:\s*')[^']+(\')", re.DOTALL)
    
    def replacer(match):
        return match.group(1) + data['status'] + match.group(2) + data['latency'] + match.group(3) + data['workload'] + match.group(4)
        
    content = pattern.sub(replacer, content)

with open("server.ts", "w") as f:
    f.write(content)

