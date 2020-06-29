const express = require('express');
const app = express();
app.set("port", (process.env.PORT || 5000));

//Use this for req.body (query)
app.use(express.urlencoded({ extended: true }));

//Statics
app.use(express.static("public"));

//Configure views
app.set("views", "views");
app.set("view engine", "ejs");

//Database connection:
const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL || "postgres://clientuser1:123456@localhost:5432/project2"
const pool = new Pool({ connectionString: connectionString });


//Control

app.get("/", (req, res) => {
  console.log("receiving request for: " + req.url)
  res.render("pages/main");
});

app.post("/addStory", (req, res) => {
  console.log("receiving request for: " + req.url);

  insertStoryIntoDB(req, function (err, result) {
    console.log(JSON.stringify(result));
    
    let params = {};

    if (err) {
      console.log(err);
      params = { message: "Error: unable to insert to database" };

    }
    else {
      params = { message: "Add story successful!"};
    }
    res.render("pages/message", params);
  });
});

app.post("/viewStories", (req, res) => {
  console.log("receiving request for: " + req.url);

  getStoryFromDB(req, function (err, result) {
    let params = {};

    if (err) {
      console.log(err);
      params = {message: "Error: unable to query from DB"};  
    }
    else {
      let message = "Story found!";
      let story = result.rows[0];

      params = {message: message, story: story };
    }
    res.render("pages/message", params);
  });
});

app.listen(app.get("port"), () => { console.log("listening on port " + app.get("port")); });

//Model: Database interaction

function insertStoryIntoDB(req, callback) {
  console.log("Inserting story into db...");
  let story_date = req.body.story_date;
  let story_name = req.body.story_name;
  let story_description = req.body.story_description;

  console.log(story_date);
  console.log(story_name);
  console.log(story_description);

  let sqlCMD = "INSERT INTO story (story_date, story_name, story_description) VALUES ($1,$2,$3)"
  let params = [story_date, story_name, story_description];

  pool.query(sqlCMD, params, callback);

}

function getStoryFromDB(req, callback) {
  console.log("Retrieving story from database...");

  let id = req.body.story_id;
  console.log("Received ID is: " + id);

  let sqlCMD = "SELECT * FROM story WHERE id=$1::int";
  let params = [id];

  pool.query(sqlCMD, params, callback);
}
