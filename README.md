FaceKom Documentation Packaging
===============================

# DockpackLibrary Project Structure

This document outlines the structure of the DockpackLibrary project, which is divided into the client-side React application, the server-side Node.js/Express.js application, and documentation.

## Project Layout

```
DockpackLibrary/
<<<<<<< HEAD
├── client/                     # Frontend React application
│   ├── public/
│   │   └── index.html          # Entry point HTML
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── App.js              # Main React component
│   │   ├── index.js            # Entry point JavaScript
│   │   └── ...                 # Other frontend sources
│   ├── package.json            # NPM package configuration for the client
│   ├── webpack.config.cjs       # Webpack configuration
│   └── ...                     # Other configuration files and resources
│
├── server/                     # Backend Node.js/Express.js application
│   ├── src/
│   │   ├── controllers/        # Controller modules
│   │   ├── routes/             # API route definitions
│   │   │   └── api.js          # Main API route
│   │   ├── utils/              # Utility modules
│   │   │   └── dockerManager.js # Responsible for Docker management
│   │   └── app.js              # Main application file
│   ├── test/                   # Mocha-Chai tests
│   │   └── api.test.js         # API test cases
│   ├── package.json            # NPM package configuration for the server
│   └── ...                     # Other configuration files and resources
│
├── documentation/              # Documentation folder
│   ├── FaceKom SelfService SDK architecture.pdf
│   ├── FaceKom VideoChat Felhasználói kézikönyv.pdf
│   └── FaceKom VideoChat általános üzemeltetési kézikönyv.pdf
│
├── .gitignore                  # Specifies intentionally untracked files to ignore
└── README.md                   # Project README with introduction, setup, and usage instructions
```
=======
├── src/
│   ├── client/                # Frontend React application
│   │   ├── components/        # React components
│   │   ├── App.js             # Main React component
│   │   ├── index.js           # Entry point JavaScript
│   │   └── ...                # Other frontend sources
│   │
│   ├── server/                # Backend Node.js/Express.js application
│   │   ├── controllers/       # Controller modules
│   │   ├── routes/            # API route definitions
│   │   │   └── api.js         # Main API route
│   │   ├── utils/             # Utility modules
│   │   │   └── dockerManager.js # Responsible for Docker management
│   │   └── app.js             # Main application file
│   │
│   └── ...                    # Shared resources or common utilities
│
├── test/                      # Tests for both frontend and backend
│   └── api.test.js            # Example backend API test case
│
├── package.json               # NPM package configuration for the entire project
├── webpack.config.js          # Webpack configuration for the client
├── .gitignore                 # Specifies intentionally untracked files to ignore
└── README.md                  # Project README with introduction, setup, and usage instructions

```


>>>>>>> b58a6eefec19d8bf09be0c6ec5c3dd1091822753

## Description

- **Client**: Contains the frontend React application, including all React components, entry points, and the Webpack configuration for bundling the frontend application.

- **Server**: Contains the backend Node.js/Express.js application, including API routes, utility functions for Docker management, and the server's main application file. The `test` directory contains Mocha-Chai tests for the API.

- **Documentation**: Houses the project's documentation, including architecture and user manuals.

Each main directory (`client`, `server`, `documentation`) includes a `package.json` file for managing dependencies specific to that part of the project.
