import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { resolvePath } from "./util.js";

console.log("DB path:", resolvePath("db.sqlite"));

sqlite3.verbose();

// Open and initialize the database
const db = await open({
  filename: resolvePath("db.sqlite"),
  driver: sqlite3.Database,
});

await db.run("DROP TABLE IF EXISTS users");
await db.run("DROP TABLE IF EXISTS timeslots");
await db.run("DROP TABLE IF EXISTS student_groups");
await db.run("DROP TABLE IF EXISTS group_members");

// Create table 'users' if it doesn't already exist
await db.run(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin'))
  )
`);

// Create table 'timeslots' if it doesn't already exist
await db.run(`
  CREATE TABLE IF NOT EXISTS timeslots (
    timeslot_id INTEGER PRIMARY KEY,
    assistant_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    place TEXT NOT NULL,
    type TEXT NOT NULL,
    available_until TEXT,
    booked INTEGER NOT NULL DEFAULT 0,
    booked_by TEXT
  )
`);

// Create table 'student_groups' if it doesn't already exist
await db.run(`
  CREATE TABLE IF NOT EXISTS student_groups (
  group_id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_hash TEXT UNIQUE  -- Used to enforce uniqueness of member sets
)
`);

// Create table 'group_members' if it doesn't already exist
await db.run(`
  CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER,
    student_id TEXT,
    FOREIGN KEY (group_id) REFERENCES student_groups(group_id),
    FOREIGN KEY (student_id) REFERENCES users(username),
    PRIMARY KEY (group_id, student_id)
  );
`);

const username = "test1";
const password = "test1";
const role = "student";

const username1 = "test2";
const password1 = "test2";
const role1 = "admin";

const username2 = "test3";
const password2 = "test2";
const role2 = "student";

const username3 = "zest12";
const password3 = "test1";
const role3 = "student";

const testGroup = [username, username2, username3]

try {
  await db.run("INSERT INTO users VALUES (?, ?, ?)", [
    username,
    password,
    role,
  ]);
  console.log("Dummy user added successfully!");
} catch (error) {
  console.error("Error inserting dummy user:", error.message);
}

try {
  await db.run("INSERT INTO users VALUES (?, ?, ?)", [
    username1,
    password1,
    role1,
  ]);
  await db.run("INSERT INTO users VALUES (?, ?, ?)", [
    username2,
    password2,
    role2,
  ]);
  await db.run("INSERT INTO users VALUES (?, ?, ?)", [
    username3,
    password3,
    role3,
  ]);
  console.log("Dummy user 1 added successfully!");
} catch (error) {
  console.error("Error inserting dummy user:", error.message);
}

const timeslotId = 1;
const assistant_id = "Jacob1";
const date = "2025-05-14";
const time = "15:00";
const place = "E35";
const type = "muntlig redovisning"
const available_until = null //"2025-05-13";
const booked = 0;
const booked_by = null;

/*  // defaulting available_until to date or time:
await db.run(
  "INSERT INTO example (col1, col2) VALUES (?, COALESCE(?, ?))",
  [val1, val2, val1]
);
*/

try {
  await db.run("INSERT INTO timeslots VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, ?), ?, ?)", [
    timeslotId,
    assistant_id,
    date,
    time,
    place,
    type,
      available_until,
      date,
    booked,
    booked_by
  ]);
  console.log("Dummy timeslot added successfully!");
} catch (error) {
  console.error("Error inserting dummy timeslot:", error.message);
}

try {
  await db.run("INSERT INTO student_groups (group_hash) VALUES (?)", [
    testGroup.sort().join(",")
  ]);
  console.log("Dummy student group added successfully!");
} catch (error) {
  console.error("Error inserting dummy student group:", error.message);
}

try {
  testGroup.forEach(async member => {
    await db.run(`INSERT INTO group_members VALUES (
      (SELECT group_id FROM student_groups WHERE group_hash = ?), 
      ?
    )`, [
    testGroup.sort().join(","),
    member
  ]);
  console.log("Dummy group members added successfully!");
  })
  
} catch (error) {
  console.error("Error inserting dummy group members:", error.message);
}

export default db;
