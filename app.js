const express = require('express');
const sql = require('mssql');

const app = express();

// הגדרות החיבור
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./presences.db');

// db.serialize(() => {
//     db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");

//     const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//     for (let i = 0; i < 10; i++) {
//         stmt.run("Ipsum " + i);
//     }
//     stmt.finalize();

//     db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
//         console.log(row.id + ": " + row.info);
//     });
// });

// db.close();
app.use(express.static('public'));
app.use(express.json());




app.get('/', (req, res) => {
    let output = '';
    db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        output += row.id + ": " + row.info + '<br>';
    }, () => {
        res.send(output); // This sends the output after all rows have been processed
    });
});


// workers CRUD

// get all workers
app.get('/workers', (req, res) => {
    db.all("SELECT * FROM workers", (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// add worker 
app.post('/add-worker', (req, res) => {
    const newWorker = req.body;
    // פה אנו צריכים להוסיף את הלוגיקה להוספת העובד למסד הנתונים
    // לדוגמה (בהנחה שאנו משתמשים בsqlite):
    db.run("INSERT INTO workers (id, firstName, lastName, identityNum) VALUES (?, ?, ?, ?)", 
           [newWorker.id, newWorker.firstName, newWorker.lastName, newWorker.identityNum], 
           function(err) {
               if (err) {
                   return res.status(500).json({error: err.message});
               }
               res.json({message: "Worker added successfully!", id: this.lastID}); // הוספנו בהצלחה
           });
});

// update worker
app.put('/worker/:id', (req, res) => {
  const workerId = req.params.id;
  const updatedWorker = req.body;

  const sql = `
    UPDATE workers  
    SET 
    firstName = ?, 
    lastName = ?, 
    identityNum = ?     
    WHERE id = ?
  `;

  db.run(sql, [updatedWorker.firstName, updatedWorker.lastName, updatedWorker.identityNum, workerId], (error) => {
    if (error) {
      res.json({ success: false, message: 'Failed to update worker.', error: error.message });
    } else {
      res.json({ success: true, message: 'Worker updated successfully.' });
    }
  });
});

// delete worker
  app.delete('/worker/:id', (req, res) => {
    const workerId = req.params.id;

    const query = `DELETE FROM workers WHERE id = ?`;

    db.run(query, [workerId], function (error) {
        if (error) {
            console.error(error);
            res.json({ success: false, message: 'Failed to delete worker.' });
        } else {
            if (this.changes > 0) {
                res.json({ success: true, message: 'Worker deleted successfully.' });
            } else {
                res.json({ success: false, message: 'Worker not found.' });
            }
        }
    });
});



// presence CRUD

// get all presences
app.get('/presences', (req, res) => {
  db.all("SELECT * FROM presences", (err, rows) => {
      if (err) {
          res.status(500).json({ "error": err.message });
          return;
      }
      res.json({
          "message": "success",
          "data": rows
      });
  });
});

// add presence 
app.post('/add-presence', (req, res) => {
    const newPresence = req.body;
    // פה אנו צריכים להוסיף את הלוגיקה להוספת העובד למסד הנתונים
    // לדוגמה (בהנחה שאנו משתמשים בsqlite):
    db.run("INSERT INTO presences (id, workerId, date, start, end) VALUES (?, ?, ?, ?,?)", 
           [newPresence.id, newPresence.workerId, newPresence.date, newPresence.start, newPresence.end], 
           function(err) {
               if (err) {
                   return res.status(500).json({error: err.message});
               }
               res.json({message: "Presence added successfully!", id: this.lastID}); // הוספנו בהצלחה
           });
});

// update presence
app.put('/presence/:id', (req, res) => {
    const presenceId = req.params.id;
    const updatedPresence = req.body;
    
    console.log('updatedPresence', updatedPresence);
    console.log('presenceId', presenceId);
    const sql = `
    UPDATE presences  
    SET
    workerId = ?, 
    date = ?,
    start = ?,
    end = ?      
    WHERE id = ?
`;
  
    db.run(sql, [updatedPresence.workerId, updatedPresence.date, updatedPresence.start, updatedPresence.end, presenceId], (error) => {
      if (error) {
        res.json({ success: false, message: 'Failed to update presence.', error: error.message });
        
      } else {
        res.json({ success: true, message: 'Presence updated successfully.' });
      }
    });
  });



  



app.listen(3000, () => {
    console.log('Server started on port 3000');
});


