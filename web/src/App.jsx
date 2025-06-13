import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MapPage from "./MapPage";
import VerifyEmail from "./VerifyEmail";

import awsExports from "../amplify_outputs.json";

Amplify.configure(awsExports);

// Create a wrapper component that applies authentication only to protected routes
const ProtectedRoute = ({ children }) => {
  const AuthenticatedComponent = withAuthenticator(() => children);
  return <AuthenticatedComponent />;
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
