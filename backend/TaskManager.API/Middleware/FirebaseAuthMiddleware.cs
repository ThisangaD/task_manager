using TaskManager.API.Services;
using System.Security.Claims;

namespace TaskManager.API.Middleware
{
    /// <summary>
    /// ASP.NET Core middleware that intercepts every request and validates the Firebase JWT.
    /// If valid, it injects the user's UID as a ClaimsPrincipal so controllers can access it.
    /// </summary>
    public class FirebaseAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<FirebaseAuthMiddleware> _logger;

        public FirebaseAuthMiddleware(RequestDelegate next, ILogger<FirebaseAuthMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, FirebaseAuthService firebaseService)
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();

            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Substring("Bearer ".Length).Trim();
                var decodedToken = await firebaseService.VerifyTokenAsync(token);

                if (decodedToken != null)
                {
                    // Inject the Firebase UID into the HTTP context claims
                    // Controllers will read this via User.FindFirst("uid")
                    var claims = new List<Claim>
                    {
                        new Claim("uid", decodedToken.Uid),
                        new Claim(ClaimTypes.NameIdentifier, decodedToken.Uid)
                    };

                    var identity = new ClaimsIdentity(claims, "Firebase");
                    context.User = new ClaimsPrincipal(identity);

                    _logger.LogDebug("Authenticated Firebase user: {Uid}", decodedToken.Uid);
                }
            }

            await _next(context);
        }
    }
}
