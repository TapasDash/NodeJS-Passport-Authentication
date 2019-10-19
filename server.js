if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const intializePassport = require("./passport-config");
intializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

const users = [];

app.set("view-engine", "ejs"); //so tht we can use ejs templating engine in views
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, //we don't want to resave if nothing is changed
    saveUninitialize: false
  })
);
app.use(passport.initialize()); //gonna set up some basic stuf for passport authentication
app.use(passport.session()); //it enabls us to store the values of a user which gonna be persistent around whole session
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
  //here checkAuthenticated will be called first, if user got authenticated sucessfully then only the next function gonna be called
  res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true //it enables to show the flash message which eqv. to these kind of messages like {messaages : } in passport-config
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    res.redirect("/login"); //so that after getting registered...he may able to login now
  } catch (error) {
    res.redirect("/resgister");
  }
  console.log(users);
});

app.delete("/logout", (req, res) => {
  req.logOut(); // logOut() is been set by passport automatically by vlearing the sessions to log our user out
  res.redirect("/login");
});

app.listen(3000);

function checkAuthenticated(req, res, next) {
  //next is a middleware function which gonna be called when we are done with authentication
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  //next is a middleware function which gonna be called when we are done with authentication
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

//now we can add in the code for passport authentication here but it would be too bloated , ugly and hard to mantain
