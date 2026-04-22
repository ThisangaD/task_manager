using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using TaskManager.API.Data;
using TaskManager.API.Middleware;
using TaskManager.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Services Registration ───────────────────────────────────────────────────

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Task Manager API", Version = "v1" });
});

// Register MySQL + EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Register Firebase service as a scoped dependency
builder.Services.AddScoped<FirebaseAuthService>();

// Configure CORS — allow your Vercel frontend URL
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000"         // Local dev
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ─── App Configuration ───────────────────────────────────────────────────────

var app = builder.Build();

// Initialize Firebase Admin SDK at startup
var serviceAccountPath = builder.Configuration["Firebase:ServiceAccountPath"]
    ?? "firebase-service-account.json";
FirebaseAuthService.Initialize(serviceAccountPath);

// Apply pending EF Core migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // We will apply this manually in dev instead, or leave it for auto-creation
    try {
        db.Database.Migrate();
    } catch (Exception ex) {
        Console.WriteLine($"DB Migration error: {ex.Message}");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");

// Our custom Firebase JWT middleware must run BEFORE UseAuthorization
app.UseMiddleware<FirebaseAuthMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.Run();
