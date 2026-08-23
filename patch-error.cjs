const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add import
  if (!content.includes('DebugErrorAlert')) {
    content = content.replace(/import { (motion, AnimatePresence) } from 'framer-motion';/, "import { $1 } from 'framer-motion';\nimport { DebugErrorAlert } from '../components/ui/DebugErrorAlert';");
  }

  // Update fetch logic to use details
  content = content.replace(
    /setError\(data\.error \|\| "([^"]+)"\);/g,
    'setError(data.details || data.error || "$1");'
  );
  content = content.replace(
    /setError\("Network error occurred\."\);/g,
    'setError(err instanceof Error ? err.message : "Network error occurred.");'
  );

  // Update the render part
  content = content.replace(
    /<motion\.div key="error"(.+?)>([\s\S]*?)<div className="mt-4"><button onClick=\{handleGoBack\} className="text-blue-600 hover:underline">Go back and try again<\/button><\/div>([\s\S]*?)<\/motion\.div>/g,
    `<motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mt-10">
              <DebugErrorAlert error={error} onRetry={handleGoBack} />
            </motion.div>`
  );
  
  // Stays exception where {error || "Property not found"} is used
  content = content.replace(
    /<motion\.div key="error"(.+?)>([\s\S]*?)\{error \|\| "Property not found"\}\s*<div className="mt-4"><button onClick=\{handleGoBack\} className="text-blue-600 hover:underline">Go back and try again<\/button><\/div>([\s\S]*?)<\/motion\.div>/g,
    `<motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mt-10">
              <DebugErrorAlert error={error || "Property not found"} onRetry={handleGoBack} />
            </motion.div>`
  );

  fs.writeFileSync(file, content);
}

patchFile('src/pages/FlightsResultsPage.tsx');
patchFile('src/pages/StaysDetailsPage.tsx');
patchFile('src/pages/CarsResultsPage.tsx');
