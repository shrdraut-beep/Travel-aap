const fs = require('fs');
let code = fs.readFileSync('src/components/views/MyTicketsView.tsx', 'utf8');

// Insert global helper
const safeDateFunc = `
function getSafeDate(d: any) {
  if (!d) return new Date();
  if (d.toDate) return d.toDate();
  if (d.seconds) return new Date(d.seconds * 1000);
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}
`;

code = code.replace(/export function MyTicketsView/, safeDateFunc + '\nexport function MyTicketsView');

code = code.replace(/const d = t\.createdAt \? new Date\(t\.createdAt\) : t\.date \? new Date\(t\.date\) : new Date\(\);/g, 'const d = getSafeDate(t.createdAt || t.date);');
code = code.replace(/const da = a\.createdAt \? new Date\(a\.createdAt\) : a\.date \? new Date\(a\.date\) : new Date\(0\);/g, 'const da = getSafeDate(a.createdAt || a.date);');
code = code.replace(/const db_date = b\.createdAt \? new Date\(b\.createdAt\) : b\.date \? new Date\(b\.date\) : new Date\(0\);/g, 'const db_date = getSafeDate(b.createdAt || b.date);');
code = code.replace(/const tDate = t\.date \? new Date\(t\.date\) : new Date\(\);/g, 'const tDate = getSafeDate(t.date || t.createdAt);');
code = code.replace(/new Date\(ticket\.date \|\| Date\.now\(\)\)/g, 'getSafeDate(ticket.date || ticket.createdAt)');
code = code.replace(/parseSafeDate/g, 'getSafeDate');

fs.writeFileSync('src/components/views/MyTicketsView.tsx', code);
