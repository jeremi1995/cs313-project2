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
const { render } = require('ejs');
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

//go to sign up page
app.get("/signUp", (req, res)=> {
  console.log("receiving request for: " + req.url);
  res.render("pages/signUp");
});

//Receive sign up info
app.post("/signUp", (req, res)=> {
  console.log(req.body);
  //look for redundancy with database
  
  insertNewUser(req, function (err, result) {
    if (err) {
      console.log(err);
      if (err.code == '23505') {
        res.send({success: false, message: "Username has already been used!"});
      }
      else {
        res.send({success: false, message: "PSQL Database error code: " + err.code});
      }
    }
    else {
        res.send({success: true, message: 'Sign-up Successful!'});
    }
  });
  
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
        req.session.user_id = result.rows[0].id;

        console.log(result);

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
    let params = { loggedIn: false, first_name: 'N/A', last_name: 'N/A' };

    res.render("pages/home", params);
  }
});

app.get("/addStory", (req, res) => {
  if (req.session.user_name) {
    res.render("pages/addStory", { first_name: req.session.first_name, last_name: req.session.last_name });
  }
  else {
    res.status(400);
    res.send("Bad Request");
  }
});

app.post("/addStory", (req, res) => {
  console.log("receiving request for: " + req.url);

  if (req.session.user_name) {
    insertStoryIntoDB(req, function (err, result) {

      let params = {};

      if (err) {
        console.log(err);
        params = { message: "Error: unable to insert to database" };

      }
      else {
        params = { message: "Add story successful!", viewStories: true };
      }
      res.render("pages/message", params);
    });
  }
  else {
    res.status(400);
    res.send("Bad Request");
  }

});

app.get("/viewStories", (req, res) => {
  console.log("receiving request for: " + req.url);

  if (req.session.user_name) {
    getStoryFromDB(req, function (err, result) {
      let params = {};

      if (err) {
        console.log(err);
        params = { message: "Error: unable to query from DB" };
      }
      else {
        //Send an array of stories of the same user
        let stories = result.rows;
        params = { first_name: req.session.first_name, last_name: req.session.last_name, stories: stories };
      }
      res.render("pages/viewStories", params);
    });
  }
  else {
    res.status(400);
    res.send("Bad Request");
  }
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
  let user_id = req.session.user_id;

  let sqlCMD = "INSERT INTO story (story_date, story_name, story_description, user_id) VALUES ($1,$2,$3,$4)"
  let params = [story_date, story_name, story_description, user_id];

  pool.query(sqlCMD, params, callback);

}

function getStoryFromDB(req, callback) {
  console.log("Retrieving story from database...");

  let user_id = req.session.user_id;
  console.log("Received ID is: " + user_id);

  let sqlCMD = "SELECT * FROM story WHERE user_id=$1::int ORDER BY story_date DESC, id DESC";
  let params = [user_id];

  pool.query(sqlCMD, params, callback);
}

function insertNewUser(req, callback) {
  
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let user_name = req.body.user_name;
  let password = req.body.password;
  let date_of_birth = req.body.date_of_birth;

  console.log(user_name);

  let sqlCMD = "INSERT INTO users (first_name, last_name, user_name, password, date_of_birth) VALUES ($1, $2, $3, $4, $5)";
  let params = [first_name, last_name, user_name, password, date_of_birth];

  pool.query(sqlCMD, params, callback);
}