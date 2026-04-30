# AttendanceClock

A web-based employee attendance tracking system built with Node.js, Express, and SQLite. Supports Hebrew (RTL) interface.

## Features

- **Worker Management** — Add, edit, and delete employees
- **Attendance Reporting** — Clock in and clock out with live date/time display
- **Reports & Summaries** — View all shifts per employee with total hours calculated
- Fully RTL Hebrew UI powered by Bootstrap 5

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | SQLite (via sqlite3) |
| Frontend | HTML, CSS, Vanilla JS |
| UI Framework | Bootstrap 5.3 |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher

### Installation

```bash
git clone https://github.com/osayl12/AttendanceClock.git
cd AttendanceClock
npm install
```

### Database Setup

Create the SQLite database using the schema below (or use [DB Browser for SQLite](https://sqlitebrowser.org/)):

```sql
CREATE TABLE "workers" (
    "id"          NVARCHAR(255),
    "firstName"   NVARCHAR(50)  NOT NULL,
    "lastName"    NVARCHAR(50)  NOT NULL,
    "identityNum" NVARCHAR(50)  NOT NULL,
    PRIMARY KEY("id")
);

CREATE TABLE "presences" (
    "id"       NVARCHAR(255),
    "workerId" NVARCHAR(255) NOT NULL,
    "date"     BIGINT        NOT NULL,
    "start"    BIGINT        NOT NULL,
    "end"      BIGINT        NOT NULL,
    FOREIGN KEY("workerId") REFERENCES "workers"("id"),
    PRIMARY KEY("id")
);
```

### Run

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> To auto-restart on file changes during development, use `nodemon app.js` (install with `npm install -g nodemon`).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workers` | Get all workers |
| POST | `/add-worker` | Add a new worker |
| PUT | `/worker/:id` | Update a worker |
| DELETE | `/worker/:id` | Delete a worker |
| GET | `/presences` | Get all presence records |
| POST | `/add-presence` | Add a presence record |
| PUT | `/presence/:id` | Update a presence record (clock out) |
| DELETE | `/presence/:id` | Delete a presence record |

## Project Structure

```
AttendanceClock/
├── app.js              # Express server and API routes
├── presences.db        # SQLite database (auto-created, git-ignored)
├── package.json
├── public/
│   ├── index.html      # Main UI (Hebrew RTL)
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── index.js    # Frontend logic
└── SQL in TEXT.txt     # Database schema reference
```

## License

ISC
