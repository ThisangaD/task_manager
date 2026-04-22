using Microsoft.EntityFrameworkCore;
using TaskManager.API.Models;

namespace TaskManager.API.Data
{
    /// <summary>
    /// Entity Framework Core database context.
    /// Manages the connection to MySQL and all entity mappings.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        /// <summary>The Tasks table — each row is one TaskItem entity.</summary>
        public DbSet<TaskItem> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the index on UserId for efficient per-user queries
            modelBuilder.Entity<TaskItem>()
                .HasIndex(t => t.UserId)
                .HasDatabaseName("idx_user_id");

            // Ensure Title is never null at the DB level
            modelBuilder.Entity<TaskItem>()
                .Property(t => t.Title)
                .IsRequired();
        }
    }
}
