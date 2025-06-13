import { useEffect, useState } from "react";
import { createMap } from "maplibre-gl-js-amplify";
import { Marker } from "maplibre-gl";
import { generateClient } from "aws-amplify/api";
import { fetchUserAttributes, resendSignUpCode } from "aws-amplify/auth";
import { listSensors } from "./graphql/queries";
import { onCreateSensorValue } from "./graphql/subscriptions";

import "maplibre-gl/dist/maplibre-gl.css";
import "./MapPage.css";

const MapPage = () => {
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resendStatus, setResendStatus] = useState({ loading: false, success: false, error: null });
  
  // Check if user is verified
  useEffect(() => {
    const checkUserVerification = async () => {
      try {
        const userAttributes = await fetchUserAttributes();
        const isVerified = userAttributes.email_verified === "true";
        setUserEmail(userAttributes.email || "");
        
        if (!isVerified) {
          setShowVerificationAlert(true);
        }
      } catch (error) {
        console.error("Error checking user verification:", error);
      }
    };
    
    checkUserVerification();
  }, []);
  
  // Handle resend verification code
  const handleResendVerification = async () => {
    try {
      setResendStatus({ loading: true, success: false, error: null });
      await resendSignUpCode({ username: userEmail });
      setResendStatus({ loading: false, success: true, error: null });
    } catch (error) {
      console.error("Error resending verification code:", error);
      setResendStatus({ loading: false, success: false, error: error.message });
    }
  };
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
      const client = generateClient();
      const response = await client.graphql({ query: listSensors });
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

    const client = generateClient();
    const createSub = client.graphql({ query: onCreateSensorValue }).subscribe({
      next: ({ data }) => {
        UpdateSensorMarker(
          data.onCreateSensorValue.sensorId,
          data.onCreateSensorValue.status
        );
      },
      error: (error) => console.warn(error),
    });
  }, []);

  return (
    <div id="container">
      <div id="banner">Bay Health</div>
      <div id="map" className="fullscreen-map" />
      
      {showVerificationAlert && (
        <div className="verification-alert">
          <div className="verification-alert-content">
            <h3>Email Verification Required</h3>
            <p>Please verify your email address ({userEmail}) to access all features.</p>
            
            {resendStatus.success ? (
              <div className="success-message">
                Verification email sent! Please check your inbox.
              </div>
            ) : (
              <button 
                onClick={handleResendVerification}
                disabled={resendStatus.loading}
                className="resend-button"
              >
                {resendStatus.loading ? "Sending..." : "Resend Verification Email"}
              </button>
            )}
            
            {resendStatus.error && (
              <div className="error-message">{resendStatus.error}</div>
            )}
            
            <button 
              onClick={() => setShowVerificationAlert(false)}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
