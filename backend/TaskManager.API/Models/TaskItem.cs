using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManager.API.Models
{
    /// <summary>
    /// Represents a single task belonging to a Firebase-authenticated user.
    /// Maps directly to the 'Tasks' table in MySQL.
    /// </summary>
    [Table("Tasks")]
    public class TaskItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required(ErrorMessage = "Task title is required.")]
        [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        /// <summary>Whether the task has been completed by the user.</summary>
        public bool IsCompleted { get; set; } = false;

        /// <summary>Firebase UID of the task owner. Used to scope all queries.</summary>
        [Required]
        [MaxLength(128)]
        public string UserId { get; set; } = string.Empty;

        /// <summary>Task priority level: Low, Medium, High.</summary>
        [Required]
        [MaxLength(20)]
        public string Priority { get; set; } = "Medium";

        /// <summary>Optional deadline for the task.</summary>
        public DateTime? DueDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
