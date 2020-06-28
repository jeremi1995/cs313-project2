const express = require('express');
const app = express();

//Database connection:
const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL || "postgres://clientuser1:123456@localhost:5432/familyhistorydemo"
const pool = new Pool({connectionString: connectionString});

app.set("port", (process.env.PORT || 5000));

app.get("/", (req, res)=>{
  console.log("receiving request for: " + req.url)
  res.send("Hello Project2");
});

app.get("/getPerson", getPerson);

app.listen(app.get("port"), ()=>{console.log("listening on port " + app.get("port"));});


function getPerson(req, res) {
  console.log("getting person information");
  
  var id = req.query.id;
  console.log("Retrieving person with id #" + id);

  getPersonFromDB(id, function (error, result) {
    if (error) {
      console.log("There is an error with the database");
      console.log(error);
    }
    else {
      res.json(result.rows);
      console.log("Back from with result: ", JSON.stringify(result.rows));
    }
  });

  //var result = {id: 238, first: "John", last: "Smith", birthdate: "1950-02-05"};
  //res.send(result);
}

function getPersonFromDB(id, callback) {
  console.log("getPersonFromDB called with id: ", id);
  
  var sql = "SELECT id, first, last, birthdate FROM person WHERE id = $1::int";
  var params = [id];

  pool.query(sql, params, callback);
}