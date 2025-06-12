import "@aws-amplify/ui-react/styles.css";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MapPage from "./MapPage";
import VerifyEmail from "./VerifyEmail";

import awsExports from "../amplify_outputs.json";

Amplify.configure(awsExports);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/" element={<MapPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default withAuthenticator(App);
