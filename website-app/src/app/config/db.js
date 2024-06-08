const mysql = require("mysql");

const db = mysql.createConnection({
  host: "34.101.241.181",
  user: "elvanromp",
  password: "wwy982vr88",
  database: "rekomenin"
});

db.connect(err => {
  if (err) {
    console.errorA("Error connecting to MySQL database:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

module.exports = db;