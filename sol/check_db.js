const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./leads.db');

db.all("SELECT * FROM gallery_photos", [], (err, rows) => {
    if (err) throw err;
    console.log(rows);
});
