import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# I will replace:
# return (
#    <ErrorBoundary fallback={<div>Error occurred</div>}>
# with
# return (
#    <ErrorBoundary fallback={<div>Error occurred</div>}>
#      <MusicPlayerProvider>
content = content.replace("<ErrorBoundary fallback={<div>Error occurred</div>}>", "<ErrorBoundary fallback={<div>Error occurred</div>}>\n      <MusicPlayerProvider>")

# And replace:
#      </div>
#    </ErrorBoundary>
#  );
# with
#      </div>
#      {role === 'user' && <MusicPlayerBar lang="en" themeColor="#6366f1" />}
#      </MusicPlayerProvider>
#    </ErrorBoundary>
#  );

content = content.replace("</ErrorBoundary>", "  {role === 'user' && <MusicPlayerBar lang=\"en\" themeColor=\"#6366f1\" />}\n      </MusicPlayerProvider>\n    </ErrorBoundary>")

with open("src/App.tsx", "w") as f:
    f.write(content)
