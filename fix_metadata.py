import json

with open("metadata.json", "r") as f:
    data = json.load(f)

data["description"] = "Plan group trips, scan bills using Gemini AI, and split expenses seamlessly with friends."

with open("metadata.json", "w") as f:
    json.dump(data, f, indent=2)

print("Updated metadata.json")
