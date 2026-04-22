using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;
using TaskManager.API.Models.DTOs;

namespace TaskManager.API.Controllers
{
    /// <summary>
    /// RESTful controller for task CRUD operations.
    /// All endpoints require Firebase authentication — unauthorized requests return 401.
    /// All data is automatically scoped to the authenticated user's UID.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TasksController> _logger;

        public TasksController(AppDbContext context, ILogger<TasksController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ─────────────────────────────────────────────────────────────
        // Helper: Get the authenticated user's UID from JWT claims.
        // Returns null if the request is unauthenticated.
        // ─────────────────────────────────────────────────────────────
        private string? GetUserId() => User.FindFirst("uid")?.Value;

        // ─────────────────────────────────────────────────────────────
        // GET /api/tasks
        // Returns all tasks for the authenticated user.
        // Optional query param: ?filter=all|completed|pending
        // ─────────────────────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetTasks([FromQuery] string filter = "all")
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Authentication required." });

            var query = _context.Tasks.Where(t => t.UserId == userId);

            // Apply optional filter for bonus feature
            query = filter.ToLower() switch
            {
                "completed" => query.Where(t => t.IsCompleted),
                "pending"   => query.Where(t => !t.IsCompleted),
                _           => query  // "all" — no additional filter
            };

            var tasks = await query
                .OrderByDescending(t => t.CreatedAt) // Newest first
                .ToListAsync();

            _logger.LogInformation("User {UserId} fetched {Count} tasks (filter: {Filter})", userId, tasks.Count, filter);
            return Ok(tasks);
        }

        // ─────────────────────────────────────────────────────────────
        // POST /api/tasks
        // Creates a new task for the authenticated user.
        // ─────────────────────────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Authentication required." });

            // ModelState validation catches [Required] and [MaxLength] annotations
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var task = new TaskItem
            {
                Title       = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                IsCompleted = false,
                UserId      = userId,
                CreatedAt   = DateTime.UtcNow,
                UpdatedAt   = DateTime.UtcNow
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} created task: {TaskId}", userId, task.Id);

            // Return 201 Created with Location header pointing to the new resource
            return CreatedAtAction(nameof(GetTasks), new { id = task.Id }, task);
        }

        // ─────────────────────────────────────────────────────────────
        // PUT /api/tasks/{id}
        // Updates an existing task. Partial updates are supported.
        // ─────────────────────────────────────────────────────────────
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Authentication required." });

            // Fetch the task and verify ownership in a single query
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
                return NotFound(new { message = $"Task with ID {id} not found." });

            // Only update fields that were provided (partial update pattern)
            if (dto.Title != null)       task.Title       = dto.Title.Trim();
            if (dto.Description != null) task.Description = dto.Description?.Trim();
            if (dto.IsCompleted != null) task.IsCompleted = dto.IsCompleted.Value;

            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} updated task: {TaskId}", userId, task.Id);
            return Ok(task);
        }

        // ─────────────────────────────────────────────────────────────
        // DELETE /api/tasks/{id}
        // Permanently deletes a task. Verifies ownership before deletion.
        // ─────────────────────────────────────────────────────────────
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { message = "Authentication required." });

            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
                return NotFound(new { message = $"Task with ID {id} not found." });

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} deleted task: {TaskId}", userId, task.Id);
            return NoContent(); // 204 — success, no content to return
        }
    }
}
