import { defineAuth } from '@aws-amplify/backend'

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
// export const auth = defineAuth({
//   loginWith: {
//     email: {
//       verificationEmailStyle: 'LINK',
//       verificationEmailSubject: 'Welcome to my app!',
//       verificationEmailBody: (createLink) =>
//         `Your verification link is ${createLink()}.`
//     }
//   },
//   userAttributes: {
//     phoneNumber: {
//       required: false
//     },
//     givenName: {
//       required: true
//     },
//     familyName: {
//       required: true
//     }
//   }
// })

export const auth = {}
