import express from "express";

import {
  createIssue,
  getIssues,
  getMyIssues,
  getIssueById,
  assignIssue,
  updateIssueStatus,
  closeIssue,
  getAssignedIssues,
  addIssueComment,
  uploadCompletionPhoto,
  deleteIssue,
} from "../controllers/issueController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createIssue);

router.get("/", protect, getIssues);

router.get("/my", protect, getMyIssues);

router.get("/assigned", protect, getAssignedIssues);

router.get("/:id", protect, getIssueById);

router.put("/:id/assign", protect, assignIssue);

router.put("/:id/status", protect, updateIssueStatus);

router.put("/:id/close", protect, closeIssue);

router.post("/:id/comments", protect, addIssueComment);

router.post("/:id/photo", protect, uploadCompletionPhoto);

router.delete("/:id", protect, deleteIssue);

export default router;