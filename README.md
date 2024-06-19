# Collaborative Code Editor

A real-time collaborative code editor built with React and Socket.io. Users can create or join rooms to write code together in real-time. Once the code is written, they can run the code using the provided run button.

## Features

- Real-time collaborative code editing
- Room creation and joining functionality
- Synchronized code changes across all users in the room
- Code execution feature
- User-friendly interface

## Technologies Used

- React
- Socket.io
- monaco-editor
- apis - for running the code on hackerearth server
- Express

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:

```bash
   git clone https://github.com/your-username/collaborative-code-editor.git
   cd collaborative-code-editor
```

2. Install the dependencies:

```bash
npm install
```

## Running the Application

#Start the server:

```bash
npm run server
```

## Start the client:

```bash

    npm start

    Open your browser and navigate to http://localhost:3000
```
## Running Code

    Write your code in the editor.
    Click the "Run" button to execute the code.

##Project Structure
```
collaborative-code-editor/
├── build/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Client.js
│   │   ├── Editor.js
│   │   └── ...
│   ├── pages/
│   │   ├── Home.js
│   │   ├── EditorPage.js
│   │   └── ...
│   ├── App.js
│   ├── Actions.js
│   ├── socket.js
│   └── ...
├── .gitignore
├── package.json
├── server.js
└── README.md
```
## Contributing

    Fork the repository.
    Create a new branch: git checkout -b my-feature-branch
    Make your changes and commit them: git commit -m 'Add some feature'
    Push to the branch: git push origin my-feature-branch
    Submit a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgements

    CodeMirror
    React
    Socket.io
    Express
