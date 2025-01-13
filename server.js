const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const port = 3001;

// Middleware to parse JSON bodies and handle CORS
app.use(express.json());

// Configure CORS to allow requests from your frontend
const corsOptions = {
    origin: 'http://localhost:3000', 
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Connect to SQLite database or create it if it doesn't exist
const db = new sqlite3.Database("./game_results.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    }
    else {
        console.log("Connected to SQLite database.");
    }
});

// Create the GameResults table if it doesn't exist
db.run(
    `CREATE TABLE IF NOT EXISTS GameResults (
        username TEXT,
        score INTEGER,
        won TEXT,
        finished_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        }
        else {
            console.log("GameResults table is ready.");
        }
    }
);

// Endpoint to save game results
app.post("/save-game-result", (req, res) => {
    const { username, score, won } = req.body;

    const query = `INSERT INTO GameResults (username, score, won) VALUES (?, ?, ?)`;

    db.run(query, [username, score, won], function (err) {
        if (err) {
            console.error("Error inserting game result:", err.message);
            res.status(500).json({ error: "Failed to save game result" });
        }
        else {
            console.log("Game result inserted successfully");

            // Retrieve the 'finished_at' timestamp for the inserted row
            const selectQuery = `SELECT finished_at FROM GameResults WHERE rowid = ?`;
            const lastInsertRowId = this.lastID;

            db.get(selectQuery, [lastInsertRowId], (err, row) => {
                if (err) {
                    console.error("Error retrieving finished_at:", err.message);
                    res.status(500).json({ error: "Failed to retrieve game result timestamp" });
                } else {
                    res.json({ message: "Game result saved successfully", finished_at: row.finished_at });
                }
            });
        }
    });
});

// Endpoint to get global leaderboard data
app.get('/leaderboard/global', (req, res) => {
    const topN = parseInt(req.query.topN) || 10; // Default to top 10

    const query = `
        SELECT username, score, won, finished_at
        FROM GameResults
        ORDER BY score DESC, finished_at ASC
        LIMIT ?
    `;
    db.all(query, [topN], (err, rows) => {
        if (err) {
            console.error("Error retrieving global leaderboard data:", err.message);
            res.status(500).json({ error: "Failed to retrieve global leaderboard data" });
        } else {
            res.json(rows);
        }
    });
});

// Endpoint to get personal leaderboard data
app.get('/leaderboard/personal', (req, res) => {
    const username = req.query.username;
    const topN = parseInt(req.query.topN) || 10;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    const query = `
        SELECT username, score, won, finished_at
        FROM GameResults
        WHERE username = ?
        ORDER BY score DESC, finished_at ASC
        LIMIT ?
    `;
    db.all(query, [username, topN], (err, rows) => {
        if (err) {
            console.error("Error retrieving personal leaderboard data:", err.message);
            res.status(500).json({ error: "Failed to retrieve personal leaderboard data" });
        } else {
            res.json(rows);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
