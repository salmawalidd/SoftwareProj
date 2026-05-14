const express = require("express");
const router = express.Router();
const controller = require("./issuesController");

router.post("/issues", controller.createIssue);
router.get("/issues", controller.getAllIssues);
router.get("/issues/my", controller.getMyIssues);
router.get("/issues/:id", controller.getIssueById);

module.exports = router;
