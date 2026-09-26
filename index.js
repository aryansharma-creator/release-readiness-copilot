const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob',   email: 'bob@example.com' },
];
let nextId = 3;

// GET /users — return all users
app.get('/users', (req, res) => {
  res.json(users);
});

// GET /users/:id — return a single user by id
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id, 10));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// POST /users/:id/deactivate — mark a user as inactive
app.post('/users/:id/deactivate', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id, 10));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  user.active = false;
  res.json(user);
});

// POST /users — create a new user
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const user = { id: nextId++, name, email };
  users.push(user);
  res.status(201).json(user);
});

// GET /report — render release-readiness-report.md as styled HTML
app.get('/report', (req, res) => {
  const mdPath = path.join(__dirname, 'release-readiness-report.md');
  let md;
  try {
    md = fs.readFileSync(mdPath, 'utf8');
  } catch {
    return res.status(404).send('<p>Report file not found.</p>');
  }

  // Minimal markdown → HTML converter (covers the subset used in the report)
  function mdToHtml(text) {
    const lines = text.split('\n');
    const out = [];
    let inTable = false;
    let tableHead = true;
    let inList = false;

    const inline = (s) =>
      s
        // risk badge spans (emoji + word)
        .replace(/🔴\s*(High)/g,   '<span class="badge high">🔴 High</span>')
        .replace(/🟡\s*(Medium)/g, '<span class="badge medium">🟡 Medium</span>')
        .replace(/🟢\s*(Low)/g,    '<span class="badge low">🟢 Low</span>')
        // bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // arrows
        .replace(/→/g, '→');

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trimEnd();

      // Close list if we leave bullet context
      if (inList && !line.startsWith('- ') && line !== '') {
        out.push('</ul>'); inList = false;
      }

      // Horizontal rule
      if (/^---+$/.test(line)) { out.push('<hr>'); continue; }

      // Headings
      const h1 = line.match(/^#\s+(.*)/);   if (h1) { out.push(`<h1>${inline(h1[1])}</h1>`); continue; }
      const h2 = line.match(/^##\s+(.*)/);  if (h2) { out.push(`<h2>${inline(h2[1])}</h2>`); continue; }
      const h3 = line.match(/^###\s+(.*)/); if (h3) { out.push(`<h3>${inline(h3[1])}</h3>`); continue; }

      // Table row
      if (line.startsWith('|')) {
        const isSep = /^\|[-| :]+\|$/.test(line);
        if (!inTable) { out.push('<table><thead>'); inTable = true; tableHead = true; }
        if (isSep) { out.push('</thead><tbody>'); tableHead = false; continue; }
        const cells = line.split('|').slice(1, -1).map(c => inline(c.trim()));
        const tag = tableHead ? 'th' : 'td';
        out.push(`<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join('')}</tr>`);
        continue;
      }
      if (inTable) { out.push('</tbody></table>'); inTable = false; }

      // Bullet list
      if (line.startsWith('- ')) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push(`<li>${inline(line.slice(2))}</li>`);
        continue;
      }

      // Blank line
      if (line === '') { continue; }

      // Plain paragraph
      out.push(`<p>${inline(line)}</p>`);
    }

    if (inList)  out.push('</ul>');
    if (inTable) out.push('</tbody></table>');
    return out.join('\n');
  }

  const body = mdToHtml(md);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Release Readiness Report</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.65;
    color: #1f2328;
    background: #f7f8fa;
    padding: 2rem 1rem;
  }
  .card {
    max-width: 820px;
    margin: 0 auto;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 2.5rem 3rem;
  }
  h1 { font-size: 1.75rem; margin-bottom: 0.4rem; color: #1f2328; }
  h2 { font-size: 1.2rem; margin: 2rem 0 0.6rem; padding-bottom: 0.3rem;
       border-bottom: 1px solid #e5e7eb; color: #1f2328; }
  h3 { font-size: 1rem; margin: 1.4rem 0 0.4rem; color: #1f2328; }
  p  { margin: 0.6rem 0; color: #1f2328; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
  strong { font-weight: 600; }
  em     { font-style: italic; }
  code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.85em;
    background: #f0f1f3;
    border: 1px solid #e5e7eb;
    border-radius: 3px;
    padding: 0.1em 0.35em;
  }
  ul { margin: 0.5rem 0 0.5rem 1.5rem; }
  li { margin: 0.25rem 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.92rem;
  }
  th {
    background: #f0f1f3;
    text-align: left;
    font-weight: 600;
    padding: 0.5rem 0.75rem;
    border: 1px solid #e5e7eb;
  }
  td {
    padding: 0.45rem 0.75rem;
    border: 1px solid #e5e7eb;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #fafafa; }
  .badge {
    display: inline-block;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.15em 0.55em;
    border-radius: 4px;
    white-space: nowrap;
  }
  .badge.high   { background: #fde8e8; color: #b91c1c; border: 1px solid #fca5a5; }
  .badge.medium { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
  .badge.low    { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
  footer {
    text-align: center;
    margin-top: 2.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    font-size: 0.78rem;
    color: #57606a;
  }
</style>
</head>
<body>
<div class="card">
${body}
<footer>Generated by Users API · <code>GET /report</code></footer>
</div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Users API listening on port ${PORT}`));
}
