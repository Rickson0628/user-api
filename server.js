const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const jwt = require("jsonwebtoken");
const userService = require("./user-service.js");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// -------------------------------------------------------
// JWT SETUP
// -------------------------------------------------------

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  secretOrKey: process.env.JWT_SECRET,
};

const strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
  console.log("payload received", jwt_payload);

  if (jwt_payload) {
    next(null, {
      _id: jwt_payload._id,
      userName: jwt_payload.userName,
      role: jwt_payload.role,
    });
  } else {
    next(null, false);
  }
});

passport.use(strategy);
app.use(passport.initialize());

// -------------------------------------------------------
// REGISTER
// MongoDB required
// -------------------------------------------------------

app.post("/api/user/register", async (req, res) => {
  try {
    await userService.connect();

    const msg = await userService.registerUser(req.body);

    res.json({
      message: msg,
    });
  } catch (msg) {
    res.status(422).json({
      message: msg,
    });
  }
});

// -------------------------------------------------------
// NORMAL LOGIN
// MongoDB required
// -------------------------------------------------------

app.post("/api/user/login", async (req, res) => {
  try {
    await userService.connect();

    const user = await userService.checkUser(req.body);

    const payload = {
      _id: user._id,
      userName: user.userName,
      role: "user",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({
      message: "login successful",
      token,
    });
  } catch (msg) {
    res.status(422).json({
      message: msg,
    });
  }
});

// -------------------------------------------------------
// DEMO LOGIN
// MongoDB NOT required
// -------------------------------------------------------

app.post("/api/user/demo-login", (req, res) => {
  const payload = {
    _id: "demo-user",
    userName: "Demo User",
    role: "demo",
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });

  res.json({
    message: "demo login successful",
    token,
  });
});

// -------------------------------------------------------
// GET FAVOURITES
// MongoDB required for normal users
// -------------------------------------------------------

app.get(
  "/api/user/favourites",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Demo users should not access MongoDB
      if (req.user.role === "demo") {
        return res.json([]);
      }

      await userService.connect();

      const data = await userService.getFavourites(req.user._id);

      res.json(data);
    } catch (msg) {
      res.status(422).json({
        error: msg,
      });
    }
  },
);

// -------------------------------------------------------
// ADD FAVOURITE
// MongoDB required for normal users
// -------------------------------------------------------

app.put(
  "/api/user/favourites/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Demo user does not use MongoDB
      if (req.user.role === "demo") {
        return res.json([req.params.id]);
      }

      await userService.connect();

      const data = await userService.addFavourite(
        req.user._id,
        req.params.id,
      );

      res.json(data);
    } catch (msg) {
      res.status(422).json({
        error: msg,
      });
    }
  },
);

// -------------------------------------------------------
// REMOVE FAVOURITE
// MongoDB required for normal users
// -------------------------------------------------------

app.delete(
  "/api/user/favourites/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Demo user does not use MongoDB
      if (req.user.role === "demo") {
        return res.json([]);
      }

      await userService.connect();

      const data = await userService.removeFavourite(
        req.user._id,
        req.params.id,
      );

      res.json(data);
    } catch (msg) {
      res.status(422).json({
        error: msg,
      });
    }
  },
);

// -------------------------------------------------------
// EXPORT FOR VERCEL
// -------------------------------------------------------

module.exports = app;