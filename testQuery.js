const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 5000

const connectionString = 'postgres://vefbqmiqbnatrt:8b0233411bc9aee830da289a43dcbbf66fb51135cdfd1646975385e37d8cf070@ec2-50-17-90-177.compute-1.amazonaws.com:5432/d83nlitmnnjtqi?ssl=true';
const pool = new Pool({connectionString: connectionString});


app.get("/", (req, res)=>{
  console.log("receiving request for: " + req.url)
  
  getTimeFromDB(req.url, (error, result)=> {
      console.log("Back with the result: ", result);
  });

  res.send("Done.");
});

function getTimeFromDB(url, callback) {
    console.log("getTimeFromDB with url = " + url);
    var sql = "SELECT NOW()";
    var params = [url];

    pool.query(sql, params, function(err, result) {
        if (err) {
            console.log("An error with the database occured");
            console.log(err);
            callback(err, null);
        }

        console.log("Found result: " + JSON.stringify(result.rows));
        callback(null, result.rows);
    });

}


app.listen(PORT, ()=>{console.log("listening on port " + PORT);});