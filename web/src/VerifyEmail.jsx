import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
        const encodedLink = urlParams.get('link');
        
        if (!encodedLink) {
          throw new Error('Missing verification link parameter');
        }
        
        // Decode the link parameter
        const verificationLink = decodeURIComponent(encodedLink);
        
        // Redirect to the Cognito verification link
        window.location.href = verificationLink;
        
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
