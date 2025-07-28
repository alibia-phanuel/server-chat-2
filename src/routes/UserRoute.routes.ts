import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/User";

const router = express.Router();
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.get("/users/:id", getUserById);
router.post("/users", createUser);

router.patch("/users/:id", updateUser);

export default router;
