const db = require("../config/db");

const login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length > 0) {
        return res.json({
          success: true,
          user: result[0]
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid Credentials"
      });
    }
  );
};

module.exports = { login };