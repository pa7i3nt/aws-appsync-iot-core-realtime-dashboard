import { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';

function VerifyEmail() {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
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
        
        // Confirm signup with Cognito
        await Auth.confirmSignUp(username, code);
        setVerifying(false);
        
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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {verifying ? (
        <p>Verifying your email...</p>
      ) : error ? (
        <div>
          <h2>Verification Failed</h2>
          <p>{error}</p>
          <p>Please try signing up again.</p>
        </div>
      ) : (
        <div>
          <h2>Email Verified Successfully!</h2>
          <p>Redirecting to the dashboard...</p>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;