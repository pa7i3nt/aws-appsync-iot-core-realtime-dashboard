import { useEffect, useState } from "react";
import { createMap } from "maplibre-gl-js-amplify";
import { Marker } from "maplibre-gl";
import { generateClient } from "aws-amplify/api";
import { fetchUserAttributes, resendSignUpCode, fetchAuthSession } from "aws-amplify/auth";
import { listSensors } from "./graphql/queries";
import { onCreateSensorValue } from "./graphql/subscriptions";

import "maplibre-gl/dist/maplibre-gl.css";
import "./MapPage.css";

const MapPage = () => {
  const [userEmail, setUserEmail] = useState("");
  const [resendStatus, setResendStatus] = useState({ loading: false, success: false, error: null });
  const [authError, setAuthError] = useState(false); // Set to false by default to hide the verification message
  
  // Get user email for the verification message
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const userAttributes = await fetchUserAttributes();
        setUserEmail(userAttributes.email || "");
      } catch (error) {
        console.error("Error getting user email:", error);
      }
    };
    
    getUserEmail();
  }, []);
  
  // Handle resend verification code
  const handleResendVerification = async () => {
    try {
      setResendStatus({ loading: true, success: false, error: null });
      // Use the email as the username for resending the code
      await resendSignUpCode({ username: userEmail });
      setResendStatus({ loading: false, success: true, error: null });
    } catch (error) {
      console.error("Error resending verification code:", error);
      // Show a more user-friendly error message
      const errorMessage = error.message || "Failed to resend verification code. Please try again.";
      setResendStatus({ loading: false, success: false, error: errorMessage });
    }
  };
  
  // Global error handler for API calls
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.log("Caught error:", event.reason);
      
      // Check for Cognito authentication errors
      if (event.reason && event.reason.message) {
        if (event.reason.message.includes('User needs to be authenticated') || 
            event.reason.message.includes('not authenticated') ||
            (event.reason.code === 'NotAuthorizedException')) {
          // Don't show the popup automatically
          // setAuthError(true);
          event.preventDefault(); // Prevent default error handling
        }
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Check user verification status but don't show popup
    const checkVerification = async () => {
      try {
        const userAttributes = await fetchUserAttributes();
        // Don't show the popup even if not verified
        // if (userAttributes.email_verified === "false") {
        //   setAuthError(true);
        // }
      } catch (error) {
        console.error("Error checking verification:", error);
      }
    };
    
    checkVerification();
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  useEffect(() => {
    var map;

    const CreateSensorMarker = (sensor) => {
      var marker = document.createElement("div");
      marker.id = "sensor-image-" + sensor.sensorId;
      marker.className = "sensor";

      let sensorColor = "white";
      marker.style.backgroundColor = sensorColor;
      marker.style.border = "border: 0.1em solid " + sensorColor + ";";

      return marker;
    };

    // call api to get list of sensors and display them as markers on the map
    async function DisplaySensors(map) {
      try {
        // Ensure we have valid auth tokens before making API calls
        const authSession = await fetchAuthSession();
        console.log("Auth session fetched:", authSession.tokens ? "Valid tokens" : "No tokens");
        
        const client = generateClient();
        const response = await client.graphql({ 
          query: listSensors,
          authMode: "userPool" // Explicitly use Cognito User Pool for auth
        });
        console.log("API Response:", response);

        if (response && response.data) {
          console.log("sensors retrived");

          response.data.listSensors.forEach((sensor) => {
            var marker = CreateSensorMarker(sensor);
            console.log(sensor);
            new Marker({ element: marker })
              .setLngLat([sensor.geo.longitude, sensor.geo.latitude])
              .addTo(map);
          });
        }
      } catch (error) {
        console.error("Error fetching sensors:", error);
        // Show verification alert if there's an authentication error
        setAuthError(true);
      }
    }

    // configure and display the map
    async function initializeMap() {
      try {
        map = await createMap({
          container: "map",
          center: [-122.2, 37.705],
          zoom: 10,
          maxZoom: 10,
        });

        map.repaint = true;

        console.log("Map Rendered");

        await DisplaySensors(map);
      } catch (error) {
        console.log("error fetching sensors", error);
      }
    }

    initializeMap();
  }, []);

  // start subscription for sensor status changes and update sensor marker color
  useEffect(() => {
    const UpdateSensorMarker = (sensorId, status) => {
      var marker = document.getElementById("sensor-image-" + sensorId);

      if (marker) {
        let sensorColor = "";

        if (status === 1) {
          sensorColor = "green";
        } else if (status === 2) {
          sensorColor = "yellow";
        } else if (status === 3) {
          sensorColor = "red";
        } else {
          sensorColor = "white";
        }

        marker.style.backgroundColor = sensorColor;
        marker.style.border = `border: 0.1em solid ${sensorColor};`;

        console.log(sensorId + " updated");
      }
    };

    // Set up subscription with proper authentication
    const setupSubscription = async () => {
      try {
        // Ensure we have valid auth tokens before subscribing
        await fetchAuthSession();
        
        const client = generateClient();
        const createSub = client.graphql({ 
          query: onCreateSensorValue,
          authMode: "userPool" // Explicitly use Cognito User Pool for auth
        }).subscribe({
          next: ({ data }) => {
            UpdateSensorMarker(
              data.onCreateSensorValue.sensorId,
              data.onCreateSensorValue.status
            );
          },
          error: (error) => {
            console.warn("Subscription error:", error);
            // Show verification alert if there's an authentication error
            setAuthError(true);
          },
        });
        
        // Return cleanup function
        return () => {
          createSub.unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up subscription:", error);
        // Show verification alert if there's an authentication error
        setAuthError(true);
      }
    };
    
    setupSubscription();
  }, []);

  return (
    <div id="container">
      <div id="banner">Bay Health</div>
      <div id="map" className="fullscreen-map" />
      
      {authError && ( // Show verification alert only when auth error is detected
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
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>Your account requires email verification. Please check your email <span style={{ fontWeight: 'bold' }}>({userEmail})</span> and click the verification link we sent you.</p>
            
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
                marginTop: '15px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {resendStatus.loading ? "Sending..." : "Resend Verification Email"}
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

export default MapPage;
