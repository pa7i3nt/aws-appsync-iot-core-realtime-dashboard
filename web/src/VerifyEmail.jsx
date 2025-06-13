import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmSignUp } from 'aws-amplify/auth';

function VerifyEmail() {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const username = urlParams.get('username');
        
        if (!code || !username) {
          throw new Error('Missing verification parameters');
        }
        
        // Directly confirm the signup with the code
        await confirmSignUp({ username, confirmationCode: code });
        
        setSuccess(true);
        setVerifying(false);
        //Create geofence location for userid
        // Send to Amplify backend /create-geofence-location :  -> (userid) -> geofence location according userid
        // Redirect to main page after successful verification
        setTimeout(() => navigate('/'), 3000);
        
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.message || 'An error occurred during verification');
        setVerifying(false);
      }
    };
    
    verifyEmail();
  }, [navigate]);
  
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Email Verification</h2>
      
      {verifying ? (
        <div>
          <p>Processing your verification...</p>
        </div>
      ) : error ? (
        <div>
          <h3>Verification Failed</h3>
          <p>{error}</p>
          <p>Please try signing up again.</p>
        </div>
      ) : (
        <div>
          <h3>Email Verified Successfully!</h3>
          <p>Redirecting to the dashboard...</p>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;
