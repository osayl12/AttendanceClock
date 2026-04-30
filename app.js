const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./presences.db');

app.use(express.static('public'));
app.use(express.json());


// workers CRUD

app.get('/workers', (req, res) => {
    db.all("SELECT * FROM workers", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "success", data: rows });
    });
});

app.post('/add-worker', (req, res) => {
    const { id, firstName, lastName, identityNum } = req.body;
    if (!firstName || !lastName || !identityNum) {
        return res.status(400).json({ error: 'firstName, lastName, and identityNum are required.' });
    }
    db.run(
        "INSERT INTO workers (id, firstName, lastName, identityNum) VALUES (?, ?, ?, ?)",
        [id, firstName, lastName, identityNum],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Worker added successfully!", id: this.lastID });
        }
    );
});

app.put('/worker/:id', (req, res) => {
    const workerId = req.params.id;
    const { firstName, lastName, identityNum } = req.body;
    if (!firstName || !lastName || !identityNum) {
        return res.status(400).json({ error: 'firstName, lastName, and identityNum are required.' });
    }
    const query = `UPDATE workers SET firstName = ?, lastName = ?, identityNum = ? WHERE id = ?`;
    db.run(query, [firstName, lastName, identityNum, workerId], function (err) {
        if (err) {
            res.status(500).json({ success: false, message: 'Failed to update worker.', error: err.message });
        } else {
            res.json({ success: true, message: 'Worker updated successfully.' });
        }
    });
});

app.delete('/worker/:id', (req, res) => {
    const workerId = req.params.id;
    db.run("DELETE FROM workers WHERE id = ?", [workerId], function (err) {
        if (err) {
            res.status(500).json({ success: false, message: 'Failed to delete worker.' });
        } else if (this.changes > 0) {
            res.json({ success: true, message: 'Worker deleted successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'Worker not found.' });
        }
    });
});


// presence CRUD

app.get('/presences', (req, res) => {
    db.all("SELECT * FROM presences", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "success", data: rows });
    });
});

app.post('/add-presence', (req, res) => {
    const { id, workerId, date, start, end } = req.body;
    if (!workerId || !date || !start) {
        return res.status(400).json({ error: 'workerId, date, and start are required.' });
    }
    db.run(
        "INSERT INTO presences (id, workerId, date, start, end) VALUES (?, ?, ?, ?, ?)",
        [id, workerId, date, start, end],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Presence added successfully!", id: this.lastID });
        }
    );
});

app.put('/presence/:id', (req, res) => {
    const presenceId = req.params.id;
    const { workerId, date, start, end } = req.body;
    const query = `UPDATE presences SET workerId = ?, date = ?, start = ?, end = ? WHERE id = ?`;
    db.run(query, [workerId, date, start, end, presenceId], function (err) {
        if (err) {
            res.status(500).json({ success: false, message: 'Failed to update presence.', error: err.message });
        } else {
            res.json({ success: true, message: 'Presence updated successfully.' });
        }
    });
});

app.delete('/presence/:id', (req, res) => {
    const presenceId = req.params.id;
    db.run("DELETE FROM presences WHERE id = ?", [presenceId], function (err) {
        if (err) {
            res.status(500).json({ success: false, message: 'Failed to delete presence.' });
        } else if (this.changes > 0) {
            res.json({ success: true, message: 'Presence deleted successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'Presence not found.' });
        }
    });
});


app.listen(3000, () => {
    console.log('Server started on port 3000');
});
