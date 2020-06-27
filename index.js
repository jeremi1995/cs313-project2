const express = require('express')
const app = express();
const PORT = process.env.PORT || 5000

app.get("/", (req, res)=>{
  console.log("receiving request for: " + req.url)
  res.send("Hello Project2");
});

app.listen(PORT, ()=>{console.log("listening on port " + PORT);});