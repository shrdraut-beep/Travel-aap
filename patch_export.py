import re

content = open("src/utils/exportUtils.ts", "r").read()
content = content.replace(
'''      const response = await fetch(img.src, { mode: 'cors' });
      const blob = await response.blob();''',
'''      const response = await fetch(img.src, { mode: 'cors' });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const blob = await response.blob();'''
)
open("src/utils/exportUtils.ts", "w").write(content)
