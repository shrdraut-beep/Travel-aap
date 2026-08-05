import re
import random

with open("server.ts", "r") as f:
    content = f.read()

def add_workload(match):
    latency_line = match.group(0)
    workload = random.randint(1, 45)
    return latency_line + f",\n      workload: '{workload}%'"

content = re.sub(r'latency:\s*\'[^\']+\'', add_workload, content)

with open("server.ts", "w") as f:
    f.write(content)

