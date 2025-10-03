// backend/routes/taskRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

// Create Task
import { createTask } from "../controllers/taskController.js"; 

// Get the Task
import { getTasks } from "../controllers/taskController.js";

// Delete Task Button
import { getTaskById, updateTask} from "../controllers/taskController.js";

// Delete Task Button
import { deleteTask } from "../controllers/taskController.js";

// Update Task Status Button
import { updateTaskStatus } from "../controllers/taskController.js"; 

// Change Priority of Task Button
import { changePriority } from "../controllers/taskController.js"; 



const router = express.Router();



// ROUTES FOR TASKS
// Create a task - POST (protected)
router.post("/", protect, createTask);

// See a TAsk - GET (protected)
router.get("/", protect, getTasks);

// Edit a TAsk - PUT/PATCH (protected)
router.get("/:id", protect, getTaskById);      // used later for edit page
router.put("/:id", protect, updateTask);       // used later for edit

// Delete a TAsk - DELETE (protected)
router.delete("/:id", protect, deleteTask);    // <-- new delete route

// Update the Status of the Task -- PATCH (protected)
router.patch("/:id/status", protect, updateTaskStatus);

// Update the Status of the Priority  -- PATCH (protected)
router.patch("/:id/priority", protect, changePriority);


// Later we'll add: router.get("/", protect, getTasks), router.get("/:id", protect, getTask), etc.

export default router;
