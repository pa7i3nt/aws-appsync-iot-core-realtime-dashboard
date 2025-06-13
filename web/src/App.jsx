import "@aws-amplify/ui-react/styles.css";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentUser, signIn, signUp, autoSignIn, signOut, resendSignUpCode } from "aws-amplify/auth";

import MapPage from "./MapPage";
import VerifyEmail from "./VerifyEmail";

import awsExports from "../amplify_outputs.json";

// Configure Amplify
Amplify.configure(awsExports);

// Custom authentication component that skips verification
const CustomAuthenticator = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState("signIn");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendStatus, setResendStatus] = useState({ loading: false, success: false, error: null });
  
  // Check if user is already signed in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        // No user is signed in
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);
  
  const handleResendVerification = async () => {
    try {
      setResendStatus({ loading: true, success: false, error: null });
      await resendSignUpCode({ username: verificationEmail });
      setResendStatus({ loading: false, success: true, error: null });
    } catch (error) {
      console.error("Error resending verification code:", error);
      setResendStatus({ loading: false, success: false, error: error.message });
    }
  };
  
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const { email, password } = formData;
      await signIn({ username: email, password });
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.log("Sign in error:", err);
      
      // Check specifically for UserNotConfirmedException
      if (err.name === "UserNotConfirmedException" || 
          (err.message && err.message.includes("not confirmed"))) {
        // Show verification popup instead of error message
        setVerificationEmail(formData.email);
        setShowVerificationPopup(true);
      } else {
        setError(err.message || "Error signing in");
      }
    }
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const { email, password } = formData;
      await signUp({
        username: email,
        password,
        autoSignIn: {
          enabled: true,
        },
      });
      
      // Show success message with verification instructions
      setError("");
      setAuthState("signIn");
      alert("Account created! Please check your email for a verification link before signing in.");
    } catch (err) {
      setError(err.message || "Error signing up");
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (user) {
    return (
      <div>
        {children}
        <button 
          onClick={handleSignOut}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 300,
            background: '#1D1C1B',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '20px', 
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2>{authState === "signIn" ? "Sign In" : "Create Account"}</h2>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
        )}
        
        <form onSubmit={authState === "signIn" ? handleSignIn : handleSignUp}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>
          
          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            {authState === "signIn" ? "Sign In" : "Sign Up"}
          </button>
        </form>
        
        <div style={{ textAlign: 'center' }}>
          {authState === "signIn" ? (
            <button 
              onClick={() => setAuthState("signUp")}
              style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer' }}
            >
              Create an account
            </button>
          ) : (
            <button 
              onClick={() => setAuthState("signIn")}
              style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer' }}
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
      
      {/* Verification Popup */}
      {showVerificationPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '24px', marginBottom: '15px', color: '#333' }}>Email Verification Required</h3>
            <p style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold' }}>User needs to be authenticated to call this API.</p>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
              Your account requires email verification. Please check your email 
              <span style={{ fontWeight: 'bold' }}> ({verificationEmail})</span> and click the verification link we sent you.
            </p>
            
            <button 
              onClick={handleResendVerification}
              disabled={resendStatus.loading}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: resendStatus.loading ? 'not-allowed' : 'pointer',
                marginRight: '10px',
                fontSize: '16px'
              }}
            >
              {resendStatus.loading ? "Sending..." : "Resend Verification Email"}
            </button>
            
            <button 
              onClick={() => setShowVerificationPopup(false)}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Close
            </button>
            
            {resendStatus.success && (
              <div style={{
                color: '#28a745',
                margin: '15px 0',
                padding: '10px',
                backgroundColor: '#d4edda',
                borderRadius: '4px',
                fontSize: '16px'
              }}>
                Verification email sent! Please check your inbox.
              </div>
            )}
            
            {resendStatus.error && (
              <div style={{
                color: '#dc3545',
                margin: '15px 0',
                padding: '10px',
                backgroundColor: '#f8d7da',
                borderRadius: '4px',
                fontSize: '16px'
              }}>
                {resendStatus.error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Create a wrapper component that applies authentication only to protected routes
const ProtectedRoute = ({ children }) => {
  return (
    <CustomAuthenticator>
      {children}
    </CustomAuthenticator>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MapPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;