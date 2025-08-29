import { Router } from "express";
import db from "../db.js";
import model from "../model.js";

const publicRouter = Router();
const privateRouter = Router();

/**
 * requireAuth is a middleware function that limits access to an endpoint to authenticated users.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns {void}
 */

//  Gives a route for handling the login form submission
publicRouter.post("/signup", async (req, res) => {
  const { username, password, role} = req.body;

  const user = await db.get("Select * From users Where username = ?", [ username, ])
  if (user != null){
    return res.status(400).json({error: "The username already exists"})
  } 
    // Here we check the passowrds
    const validPassword =
        password &&
        password.length >= 3 &&
        /[a-zA-Z]/.test(password) &&
        /\d/.test(password);
    const validUsername =
        username &&
        username.length >= 3 &&
        /[a-zA-Z]/.test(username) &&
        /\d/.test(username);

    if (!validUsername) {
        return res.status(400).json({
        error:
            "Username must be at least 3 characters and contain at least one letter and one number",
        });
    }

    if (!validPassword) {
        return res.status(400).json({
        error:
            "Password must be at least 3 characters and contain at least one letter and one number",
        });
    }

    try {
      await db.run("Insert InTo users Values(?,?,?)", [username, password, role])

      return new Promise((resolve) => {
      req.session.save((err) => {
          if (err) {
          console.error(err);
          res.status(500).json({ error: "Failed to save session" });
          resolve();
          } else {
          console.debug(`Sign up successful: ${username}`);
          res.status(200).json({ signupSuccess: true});
          resolve();
          }
      });
      });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
    
});

// Logout route
publicRouter.post("/logout", (req, res) => {
  const { id } = req.session;

  // Check if user is authenticated
  if (!model.findAssistantById(id)) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  return new Promise((resolve) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        res.status(500).json({ error: "Failed to logout" });
      } else {
        res.status(200).json({ success: true });
      }
      resolve();
    });
  });
});

// Check authentication status
publicRouter.get("/auth/status", (req, res) => {
  const { id } = req.session;
  const username = model.findAssistantById(id);

  res.status(200).json({
    authenticated: username !== undefined,
    username: username || null,
  });
});

export default {
  publicRouter,
  privateRouter,
};
