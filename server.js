// /api/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const jwt = require("jsonwebtoken");
const serverless = require("serverless-http");
const userService = require("./user-service.js"); // adjust path if needed

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ---------------- JWT Setup ----------------
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Use Bearer token
  secretOrKey: process.env.JWT_SECRET,
};

let strategy = new JwtStrategy((jwt_payload, next) => {
  if (jwt_payload) {
    next(null, { _id: jwt_payload._id, userName: jwt_payload.userName });
  } else {
    next(null, false);
  }
});

passport.use(strategy);
app.use(passport.initialize());

// ---------------- Routes ----------------

// Test environment variables
app.get("/api/env-test", (req, res) => {
  res.json({
    MONGO_URL: process.env.MONGO_URL ? "SET" : "NOT SET",
    JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
  });
});

app.post("/api/user/register", (req, res) => {
  userService
    .registerUser(req.body)
    .then((msg) => {
      res.json({ message: msg });
    })
    .catch((msg) => {
      res.status(422).json({ message: msg });
    });
});
app.post("/api/user/login", (req, res) => {
  userService
    .checkUser(req.body)
    .then((user) => {
      let payload = { _id: user._id, userName: user.userName };
      let token = jwt.sign(payload, process.env.JWT_SECRET);
      res.json({ message: "login successful", token: token });
    })
    .catch((msg) => {
      res.status(422).json({ message: msg });
    });
});
app.get(
  "/api/user/favourites",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    userService
      .getFavourites(req.user._id)
      .then((data) => {
        res.json(data);
      })
      .catch((msg) => {
        res.status(422).json({ error: msg });
      });
  }
);
app.put(
  "/api/user/favourites/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    userService
      .addFavourite(req.user._id, req.params.id)
      .then((data) => {
        res.json(data);
      })
      .catch((msg) => {
        res.status(422).json({ error: msg });
      });
  }
);
app.delete(
  "/api/user/favourites/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    userService
      .removeFavourite(req.user._id, req.params.id)
      .then((data) => {
        res.json(data);
      })
      .catch((msg) => {
        res.status(422).json({ error: msg });
      });
  }
);

// ---------------- MongoDB Connection ----------------
// Connect once when function loads
let connPromise = userService.connect();

// ---------------- Export for Vercel ----------------
module.exports.handler = serverless(app);
