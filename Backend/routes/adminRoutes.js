const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");
const verifyToken = require("../middleware/verifyToken");
const adminController = require("../controllers/adminController");

router.get("/employees", verifyToken, isAdmin, adminController.getEmployeeList);
router.get("/employees/attendance/records", verifyToken, isAdmin, adminController.getAttendanceRecords);
router.get("/employee/:employeeId", verifyToken, isAdmin, adminController.getEmployeeById);
router.put("/employee/:employeeId/toggle-status", verifyToken, isAdmin, adminController.toggleEmployeeStatus);
router.put("/employee/:employeeId", verifyToken, isAdmin, adminController.updateEmployee);
module.exports = router;
