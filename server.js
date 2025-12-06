const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const passportJWT = require("passport-jwt");
dotenv.config();
const jwt = require("jsonwebtoken");
const userService = require("./user-service.js");

app.use(express.json());
app.use(cors());

const HTTP_PORT = process.env.PORT || 8080;

// JSON Web Token Setup
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

// Configure its options
let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey: process.env.JWT_SECRET
};

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log('payload received', jwt_payload);
  if (jwt_payload) {
    // The following will ensure that all routes using
    // passport.authenticate have a req.user._id, req.user.userName values
    // that matches the request payload data
    next(null, {
      _id: jwt_payload._id,
      userName: jwt_payload.userName,
    });
  } else {
    next(null, false);
  }
});

// tell passport to use our "strategy"
passport.use(strategy);

// add passport as application-level middleware
app.use(passport.initialize());

app.post("/api/user/register", async (req, res) => {
  try {
    await userService.connect();
    const msg = await userService.registerUser(req.body);
    res.json({ message: msg });
  } catch (msg) {
    res.status(422).json({ message: msg });
  }
});

app.post("/api/user/login", async (req, res) => {
  try {
    await userService.connect();
    const user = await userService.checkUser(req.body);
    let payload = {
      _id: user._id,
      userName: user.userName,
    };
    let token = jwt.sign(payload, process.env.JWT_SECRET);
    res.json({ message: "login successful", token: token });
  } catch (msg) {
    res.status(422).json({ message: msg });
  }
});

app.get("/api/user/favourites", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await userService.connect();
    const data = await userService.getFavourites(req.user._id);
    res.json(data);
  } catch (msg) {
    res.status(422).json({ error: msg });
  }
});

app.put("/api/user/favourites/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await userService.connect();
    const data = await userService.addFavourite(req.user._id, req.params.id);
    res.json(data);
  } catch (msg) {
    res.status(422).json({ error: msg });
  }
});

app.delete("/api/user/favourites/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await userService.connect();
    const data = await userService.removeFavourite(req.user._id, req.params.id);
    res.json(data);
  } catch (msg) {
    res.status(422).json({ error: msg });
  }
});

// Initialize connection on cold start
userService.connect().catch(err => {
  console.log("DB connection warning: " + err);
});

// Export the app for Vercel serverless
module.exports = app;