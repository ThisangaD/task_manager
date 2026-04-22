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
        /// Initializes the Firebase Admin SDK using the service account JSON file.
        /// Should be called once at application startup.
        /// </summary>
        public static void Initialize(string serviceAccountPath)
        {
            if (FirebaseApp.DefaultInstance != null) return; // Prevent double-initialization

            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromFile(serviceAccountPath)
            });
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
