// Ensure token exists
const token = localStorage.getItem("token");
const userRole = localStorage.getItem("role");
if (!token) {
  alert("Please login first!");
  window.location.href = "/views/login.html";
}

let currentPage = 1;
const limit = 6; // tasks per page

async function fetchTasks(page = 1) {
  try {
    const url = `/api/tasks?page=${page}&limit=${limit}`;
    const res = await fetch(url, {
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await res.json();

    // Get columns safely
    const lowEl = document.getElementById("lowTasks");
    const medEl = document.getElementById("mediumTasks");
    const highEl = document.getElementById("highTasks");

    if (lowEl) lowEl.innerHTML = "";
    if (medEl) medEl.innerHTML = "";
    if (highEl) highEl.innerHTML = "";

    data.tasks.forEach(task => {
      let priorityClass = "";
      if (task.priority === "low") priorityClass = "bg-info";
      if (task.priority === "medium") priorityClass = "bg-warning";
      if (task.priority === "high") priorityClass = "bg-danger text-white";

      const card = document.createElement("div");
      card.className = "card " + priorityClass + " shadow-sm";

      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">Title: ${task.title}</h5>
          <p class="card-text"><strong>Desc:</strong> ${task.description || ""}</p>
          <p class="card-text"><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toDateString() : "N/A"}</p>
          <p class="card-text"><strong>Status:</strong> 
            <span class="badge ${task.status === 'completed' ? 'bg-success' : 'bg-secondary'}">${task.status}</span>
          </p>
          <p class="card-text"><strong>Priority:</strong> ${task.priority}</p>
          <p class="card-text"><strong>Created By:</strong> ${task.createdBy}</p>
          <p class="card-text"><strong>Assigned To:</strong> ${task.assignedTo}</p>

          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-sm btn-outline-info" onclick="viewDetails('${task._id}')">View</button>
            <button class="btn btn-sm btn-outline-primary" onclick="goToEdit('${task._id}')">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${task._id}')">Delete</button>
            <button class="btn btn-sm ${task.status === 'completed' ? 'btn-warning' : 'btn-success'}"
                    onclick="toggleStatus('${task._id}', '${task.status}')">
              ${task.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
            </button>
            <button class="btn btn-sm btn-outline-secondary" onclick="changePriority('${task._id}')">Change Priority</button>
          </div>
        </div>
      `;

      if (task.priority === "low" && lowEl) lowEl.appendChild(card);
      if (task.priority === "medium" && medEl) medEl.appendChild(card);
      if (task.priority === "high" && highEl) highEl.appendChild(card);
    });

    // Hide admin-only buttons if user is not admin
    if (userRole !== "admin") {
      document.querySelectorAll(".adminOnly").forEach(el => el.style.display = "none");
    }

    renderPagination(data.page, data.pages);

  } catch (err) {
    alert("Error: " + err.message);
  }
}

// Button functions
function goToEdit(taskId) { window.location.href = `/views/edit-task.html?id=${taskId}`; }
function viewDetails(taskId) { window.location.href = `/views/task-details.html?id=${taskId}`; }

async function deleteTask(taskId) {
  if (!confirm("Are you sure you want to delete this task?")) return;
  try {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE", headers: { "Authorization": "Bearer " + token } });
    fetchTasks(currentPage);
  } catch (err) { alert("Error: " + err.message); }
}

async function toggleStatus(taskId, currentStatus) {
  const newStatus = currentStatus === "completed" ? "pending" : "completed";
  try {
    await fetch(`/api/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({ status: newStatus })
    });
    fetchTasks(currentPage);
  } catch (err) { alert("Error: " + err.message); }
}

async function changePriority(taskId) {
  try {
    await fetch(`/api/tasks/${taskId}/priority`, { method: "PATCH", headers: { "Authorization": "Bearer " + token } });
    fetchTasks(currentPage);
  } catch (err) { alert("Error: " + err.message); }
}

// Pagination
function renderPagination(page, pages) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;
  pagination.innerHTML = "";
  if (pages <= 1) return;

  for (let i = 1; i <= pages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === page ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.onclick = (e) => { e.preventDefault(); currentPage = i; fetchTasks(currentPage); };
    pagination.appendChild(li);
  }
}

// Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/views/login.html";
}

// Auto-load tasks after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  fetchTasks(currentPage);

  // Hide admin buttons if user is not admin (extra safety)
  if (userRole !== "admin") {
    document.querySelectorAll(".adminOnly").forEach(el => el.style.display = "none");
  }
});
