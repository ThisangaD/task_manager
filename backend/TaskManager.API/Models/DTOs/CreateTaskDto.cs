using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models.DTOs
{
    /// <summary>
    /// Data Transfer Object for creating a new task.
    /// Prevents over-posting by only accepting safe fields from the client.
    /// </summary>
    public class CreateTaskDto
    {
        [Required(ErrorMessage = "A task must have a title.")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(20)]
        public string Priority { get; set; } = "Medium";

        public DateTime? DueDate { get; set; }
    }
}
