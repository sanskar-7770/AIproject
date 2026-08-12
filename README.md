# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app and its local API in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Admin panel

MongoDB stores users in its `users` collection. On the first connection, the backend creates an administrator account using the values in your `.env` file:

- Email: `admin@apexstudy.local`
- Password: `change-me-now`

Sign in with this account and select **Admin panel** from the sidebar to view registered users, their selected path, completed sessions, and total study time. Change the example values in `.env` before the first server start.

Existing browser-only accounts are migrated to the backend automatically the first time they sign in after this update.

## MongoDB setup

1. Create a MongoDB Atlas cluster and database user, then copy the Node.js connection string from Atlas.
2. Copy `.env.example` to a new `.env` file and replace `MONGODB_URI`, `JWT_SECRET`, and the admin credentials with your private values.
3. Run `npm start`.

If Node reports `querySrv ECONNREFUSED` but `nslookup` resolves your Atlas hostname, add `MONGODB_DNS_SERVER=1.1.1.1` to `.env` and start again.

Never commit `.env` or put the MongoDB connection string in the React frontend. For a Netlify deployment, host `server.js` separately (for example on Render or Railway), set the same environment variables there, and set `REACT_APP_API_URL` in Netlify to the public API URL ending in `/api`.

## AI Study Assistant

The AI Study Assistant adapts its replies to the student's selected study path. Add `OPENAI_API_KEY` to the backend service's environment variables (Render), then redeploy the backend. The API key must stay server-side and must not be added to Netlify or to any `REACT_APP_*` variable. Optionally set `OPENAI_MODEL` (defaults to `gpt-5-mini`).

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
