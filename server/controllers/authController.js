const db = require("../config/db");

const login = (req, res) => {
  const { email, password, role } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPassword = String(password || "").trim();
  const requestedRole = String(role || "").trim().toLowerCase();

  db.query(
    "SELECT * FROM users WHERE email=? LIMIT 1",
    [normalizedEmail],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid Credentials"
        });
      }

      const user = result[0];
      const databaseRole = String(user.role || "admin").toLowerCase();
      const userRole = databaseRole === "cashier" ? "staff" : databaseRole;

      if (String(user.password || "") !== normalizedPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid Credentials"
        });
      }

      if (requestedRole && userRole !== requestedRole) {
        return res.status(403).json({
          success: false,
          message: `This account does not have ${requestedRole} access.`
        });
      }

      return res.json({
        success: true,
        user: { ...user, role: userRole }
      });
    }
  );
};

module.exports = { login };
