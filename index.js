const express = require('express');
const session = require('express-session');
const app = express();

//Use the session module to handle the user's session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

//Set the port the app will be listening at
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
  console.log("receiving request for: " + req.url);
  let params = {};
  if (req.session.user_name) {
    params = { loggedIn: true, first_name: req.session.first_name, last_name: req.session.last_name };
  }
  else {
    params = { loggedIn: false, first_name: 'N/A', last_name: 'N/A' };
  }

  res.render("pages/home", params);
});

//This endpoint is to handle login, logout request
app.post("/", (req, res) => {
  console.log("receiving request for: " + req.url);

  if (req.body.login) {
    logIn(req, function (err, result) {
      let params = {};

      if (!err && result.rows.length != 0) {
        req.session.user_name = result.rows[0].user_name;
        req.session.first_name = result.rows[0].first_name;
        req.session.last_name = result.rows[0].last_name;
        req.session.date_of_birth = result.rows[0].date_of_birth;
        params = { loggedIn: true, first_name: req.session.first_name, last_name: req.session.last_name }

      }
      else {
        console.log(err);
        params = { loggedIn: false, first_name: 'N/A', last_name: 'N/A', messageFromServer: 'Cannot find credential' };
      }

      res.render("pages/home", params);
    });
  }
  if (req.body.logout) {
    req.session.destroy();
    let params = { loggedIn: false, first_name: 'N/A', last_name: 'N/A'};

    res.render("pages/home", params);
  }
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
      params = { message: "Add story successful!" };
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
      params = { message: "Error: unable to query from DB" };
    }
    else {
      let message = "Story found!";
      let story = result.rows[0];

      params = { message: message, story: story };
    }
    res.render("pages/message", params);
  });
});

//This part is just to test the functionality of the session
app.get("/justDisplayMessage", (req, res) => {
  console.log("receiving request for: " + req.url);
  if (!req.session.viewCount) {
    req.session.viewCount = 1;
  }
  else {
    req.session.viewCount += 1;
  }
  let params = { message: req.session.viewCount };
  res.render("pages/message", params);
});

app.listen(app.get("port"), () => { console.log("listening on port " + app.get("port")); });

//Model: Database interaction

function logIn(req, callback) {
  console.log("looking for username and password");
  let user_name = req.body.user_name;
  let password = req.body.password;
  console.log(user_name);
  console.log(password);
  let sqlCMD = "SELECT * FROM users WHERE user_name=$1 AND password=$2"
  let params = [user_name, password];

  pool.query(sqlCMD, params, callback);

}

function insertStoryIntoDB(req, callback) {
  console.log("Inserting story into db...");
  let story_date = req.body.story_date;
  let story_name = req.body.story_name;
  let story_description = req.body.story_description;

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
