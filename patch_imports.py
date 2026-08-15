import re

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace('import bcrypt from "bcrypt";', 'import * as bcrypt from "bcrypt";')

with open("server.ts", "w") as f:
    f.write(content)

