const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Madhan123',
  database: 'clothing_pos'
});

const needed = [
  { field: 'entry_month', sql: 'VARCHAR(7) NULL' },
  { field: 'rent', sql: 'DECIMAL(10,2) NULL' },
  { field: 'electricity', sql: 'DECIMAL(10,2) NULL' },
  { field: 'staff_salary', sql: 'DECIMAL(10,2) NULL' },
  { field: 'created_at', sql: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' }
];

db.query('SHOW COLUMNS FROM expenses', (err, results) => {
  if (err) {
    console.error('SHOW COLUMNS failed:', err.message || err);
    process.exit(1);
  }

  const existing = new Set(results.map((row) => row.Field));
  const tasks = needed.filter((item) => !existing.has(item.field));

  if (tasks.length === 0) {
    console.log('No schema changes needed.');
    db.end();
    return;
  }

  const runNext = () => {
    if (tasks.length === 0) {
      console.log('Schema update complete.');
      db.end();
      return;
    }

    const item = tasks.shift();
    const sql = `ALTER TABLE expenses ADD COLUMN ${item.field} ${item.sql}`;
    db.query(sql, (alterErr) => {
      if (alterErr) {
        console.error(`Failed to add ${item.field}:`, alterErr.message || alterErr);
        process.exit(1);
      }
      console.log(`Added ${item.field}`);
      runNext();
    });
  };

  runNext();
});
