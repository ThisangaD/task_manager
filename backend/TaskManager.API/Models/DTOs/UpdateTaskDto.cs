using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models.DTOs
{
    /// <summary>
    /// Data Transfer Object for updating a task.
    /// All fields are optional — only provided fields will be updated.
    /// </summary>
    public class UpdateTaskDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        /// <summary>If provided, updates the completion status of the task.</summary>
        public bool? IsCompleted { get; set; }
    }
}
