// backend/controllers/taskController.js
import Task from "../models/Task.js";
import User from "../models/User.js";

/**
 * POST /api/tasks
 * Protected route (requires JWT)
 * Body: { title, description, dueDate, priority, assignedTo (optional userId) }
 */
// export const createTask = async (req, res) => {
//   try {
//     const { title, description, dueDate, priority, assignedTo } = req.body;

//     if (!title || !dueDate) {
//       return res.status(400).json({ message: "title and dueDate are required" });
//     }

//     // If assignedTo not provided, assign to the requester
//     let assignee = assignedTo || req.user._id;

//     // If assignedTo provided, check that user exists
//     if (assignedTo) {
//       const userExists = await User.findById(assignedTo);
//       if (!userExists) return res.status(400).json({ message: "Assigned user not found" });
//     }

//     const task = await Task.create({
//       title,
//       description,
//       dueDate,
//       priority: priority || "medium",
//       assignedTo: assignee,
//       createdBy: req.user._id
//     });

//     return res.status(201).json(task);
//   } catch (err) {
//     console.error("createTask error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };
//  This is working fine, but i have to implement the RBAC so, new 

// New create task for RBAC
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, status, priority, assignedTo, createdBy } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: "title and dueDate are required" });
    }

    let assignee;

    if (assignedTo) {
      // Only admin can assign tasks to others
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admin can assign tasks to others" });
      }
      const userExists = await User.findById(assignedTo);
      if (!userExists) return res.status(400).json({ message: "Assigned user not found" });
      assignee = assignedTo;
    } else {
      // If no assignedTo, assign to creator
      assignee = req.user._id;
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      status,
      priority: priority || "medium",
    //   assignedTo: assignee || req.user.id,
      createdBy: req.user._id,
      dueDate: req.body.dueDate || null,
      assignedTo: req.body.assignedTo && req.body.assignedTo.trim() !== ""
    ? req.body.assignedTo
    : req.user.id,
    });

    return res.status(201).json(task);
  } catch (err) {
    console.error("createTask error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



// -----------------------------------------------------------------------------------------------
// GET /api/tasks -- OLD
// export const getTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({ user: req.user.id }); // fetch only logged-in user’s tasks
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch tasks", details: err.message });
//   }
// };

// I get a prblem
// In getTasks, we used:
// const tasks = await Task.find({ user: req.user.id });
// But in your Task schema, the field is actually: createdBy or assignedTo, not user. That means query always returns empty array.


// GET /api/tasks --NEW
// export const getTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({
//       $or: [
//         { createdBy: req.user.id },
//         { assignedTo: req.user.id }
//       ]
//     });

//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch tasks", details: err.message });
//   }
// };

// THis is doing great, but i have to implement the Pagination of the Tasks so we have to make changes to the GET 

// GET /api/tasks -- FOR PAGINATION 
// export const getTasks = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;     // current page
//     const limit = parseInt(req.query.limit) || 9;   // tasks per page
//     const skip = (page - 1) * limit;

//     const total = await Task.countDocuments({ createdBy: req.user.id });
//     const tasks = await Task.find({ createdBy: req.user.id })
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     res.json({
//       tasks,
//       total,
//       page,
//       pages: Math.ceil(total / limit)
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching tasks", error: err.message });
//   }
// };

// THis is doing great, but i have to implement the RBAC Feature of the Tasks so we have to make changes to the GET 
export const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.user.role !== "admin") {
      // Normal users: only see tasks they created or are assigned to
      query = {
        $or: [
          { createdBy: req.user._id },
          { assignedTo: req.user._id }
        ]
      };
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.json({
      tasks,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks", error: err.message });
  }
};




// -----------------------------------------------------------------------------------------------
// EDIT AND UPDATE TASKS
// GET /api/tasks/:id
// export const getTaskById = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: "Task not found" });
//     return res.json(task);
//   } catch (err) {
//     console.error("getTaskById error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };
// This is working fine, but now i have to create a dedicated page for every task so, we ahave to make changes to the view
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json(task);
  } catch (err) {
    console.error("getTaskById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};





// PUT /api/tasks/:id
// Only creator or admin can update (full edit)
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to edit this task" });
    }

    // Update only fields present in body
    const fields = ["title", "description", "dueDate", "status", "priority", "assignedTo"];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    const updated = await task.save();
    return res.json(updated);
  } catch (err) {
    console.error("updateTask error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// getTaskById returns the task for pre-filling the edit form. updateTask checks authorization then updates provided fields.






// -----------------------------------------------------------------------------------------------
// DELETE /api/tasks/:id -- BBUUTTOONN
// Only the creator of the task or an admin can delete
export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // allow if creator or admin
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    // await task.remove();
    await task.deleteOne();   // safer than .remove()
    return res.json({ message: "Task removed successfully" });
  } catch (err) {
    console.error("deleteTask error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};




// -----------------------------------------------------------------------------------------------
// PATCH /api/tasks/:id/status --- STATUS UPDATE BBUUTTOONN
// Allows assigned user, creator, or admin to toggle/set status
export const updateTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    

    const requesterId = req.user._id.toString();
    const isCreator = task.createdBy?.toString() === requesterId;
    const isAssignee = task.assignedTo?.toString() === requesterId;
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAssignee && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to change status" });
    }

    // If client provided a status, validate & use it; otherwise toggle
    const allowed = ["pending", "completed"];
    let newStatus;
    if (req.body && typeof req.body.status === "string") {
      if (!allowed.includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      newStatus = req.body.status;
    } else {
      // toggle
      newStatus = task.status === "completed" ? "pending" : "completed";
    }

    task.status = newStatus;
    const updated = await task.save();

    return res.json(updated);
  } catch (err) {
    console.error("updateTaskStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// This checks that the logged-in user is createdBy, assignedTo, or an admin. If the request body contains { status: "completed" } or { status: "pending" } it will set that explicitly; otherwise it toggles.



// ----------------------------------------------------------------------------------------------
// Cycle priorities
// Changing the priorities of the task -- BBUUTTOON

const priorities = ["low", "medium", "high"];

export const changePriority = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Find current index
    const currentIndex = priorities.indexOf(task.priority);
    // Calculate next index (cyclic)
    const nextIndex = (currentIndex + 1) % priorities.length;

    task.priority = priorities[nextIndex];
    await task.save();

    res.json({ message: "Priority updated", task });
  } catch (err) {
    res.status(500).json({ message: "Error updating priority", error: err.message });
  }
};



// -------------------------------------------------------------------------------------------------
