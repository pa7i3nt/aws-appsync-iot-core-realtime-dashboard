# Email Verification with Clickable Links

This project has been configured to use email verification with clickable links. To complete the setup:

1. Install react-router-dom:
```
npm install react-router-dom
```

2. Deploy your Amplify backend:
```
npx ampx deploy
```

## How it works

- When users sign up, they'll receive an email with a verification link
- Clicking the link will take them to the `/verify` route in your app
- The VerifyEmail component will extract the verification code and username from the URL
- It will then call `Auth.confirmSignUp()` to verify the user's email
- After successful verification, users will be redirected to the main page

## Files added/modified:
- `web/amplify/auth/resource.ts` - Updated to use link-based verification
- `web/amplify/functions/custom-email-trigger/` - Added pre-signup trigger
- `web/src/VerifyEmail.jsx` - Added verification page component
- `web/src/App.jsx` - Updated to include routing for verification page