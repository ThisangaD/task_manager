using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;

namespace TaskManager.API.Services
{
    /// <summary>
    /// Handles Firebase Admin SDK initialization and JWT token verification.
    /// This is the single source of truth for authenticating incoming requests.
    /// </summary>
    public class FirebaseAuthService
    {
        private readonly ILogger<FirebaseAuthService> _logger;

        public FirebaseAuthService(ILogger<FirebaseAuthService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Initializes the Firebase Admin SDK using the service account JSON file or a raw JSON string.
        /// Should be called once at application startup.
        /// </summary>
        public static void Initialize(string? serviceAccountPath = null, string? jsonContent = null)
        {
            if (FirebaseApp.DefaultInstance != null) return; 

            GoogleCredential credential;

            if (!string.IsNullOrEmpty(jsonContent))
            {
                Console.WriteLine("[FIREBASE_DEBUG] Initializing from environment variable JSON.");
                credential = GoogleCredential.FromJson(jsonContent);
            }
            else
            {
                Console.WriteLine("[FIREBASE_DEBUG] No JSON environment variable found. Falling back to file: " + (serviceAccountPath ?? "firebase-service-account.json"));
                credential = GoogleCredential.FromFile(serviceAccountPath ?? "firebase-service-account.json");
            }

            FirebaseApp.Create(new AppOptions
            {
                Credential = credential
            });
            Console.WriteLine("[FIREBASE_DEBUG] SDK Initialized successfully.");
        }

        /// <summary>
        /// Verifies a Firebase ID token and returns the decoded token claims.
        /// Returns null if the token is invalid or expired.
        /// </summary>
        /// <param name="idToken">The raw Bearer token from the Authorization header.</param>
        public async Task<FirebaseToken?> VerifyTokenAsync(string idToken)
        {
            try
            {
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
                return decodedToken;
            }
            catch (FirebaseAuthException ex)
            {
                _logger.LogWarning("Firebase token verification failed: {Message}", ex.Message);
                return null;
            }
        }
    }
}
