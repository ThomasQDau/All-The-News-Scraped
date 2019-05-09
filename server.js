var express = require("express");
// var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = process.env.PORT || 3000;
var app = express();
// app.use(logger("dev"));
var exphbs = require("express-handlebars");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines", { useNewUrlParser: true });
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/scrape", function (req, res) {
  axios.get("https://boards.na.leagueoflegends.com/en/").then(function (response) {
    var $ = cheerio.load(response.data);
    $(".discussion-list-item").each(function (i, element) {
      var result = {
          title: $(this).children('.title').children('.discussion-title').children().children().text(),
          body: $(this).children('.title').children('.discussion-title').children('.title-link').children('.title-span').attr('title'),
          link: 'https://boards.na.leagueoflegends.com' + $(this).attr('data-href')
      };
      db.Articles.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});

app.get("/", function (req, res) {
  db.Articles.find({}).populate('notes').then(function (data) {
    console.log(data[0]);
    res.render("index", {
        Articles: data
    });
  })
});

// app.get("/articles/:id", function (req, res) {
//   db.Article.findOne({ _id: req.params.id}).populate('note').then(function (data) {
//     res.json(data);
//   })
// });

app.post("/", function (req, res) {
  db.Notes.create({body: req.body.note}).then(function (data) {
    console.log('Data 1: ', data);
    console.log(req.body.id);
    db.Articles.updateOne({_id: req.body.id}, {$set: {notes: data._id}}).then(function(data2) {
      console.log('Data 2: ', data2);
      res.end();  
    })
  })
});

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
