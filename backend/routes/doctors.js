const express = require("express");
const router = express.Router();

/**
 * POST /api/doctors/find
 * Body: { specialty: "Cardiologist", location: "Sivasagar" }
 * Returns mock data for testing
 */
router.post("/find", (req, res) => {
  const { specialty, location } = req.body;

  if (!specialty || !location) {
    return res.status(400).json({ message: "Specialty and location required" });
  }

  res.json({
    message: "Success",
    doctors: [
      { name: "Dr. Rahul Sharma", address: "123 Main St, Sivasagar", rating: 4.7 },
      { name: "Dr. Priya Singh", address: "45 Park Ave, Sivasagar", rating: 4.5 },
      { name: "Dr. Anil Kumar", address: "22 MG Road, Sivasagar", rating: 4.6 }
    ],
  });
});

module.exports = router;
