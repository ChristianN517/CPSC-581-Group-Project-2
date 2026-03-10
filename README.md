# CPSC 581 Group Project 2 - Reinventing the Brick: An Interactive Learning System


## Live Demo

**Hosted Version**: [View the live application](https://rbrick.vercel.app)


**Local Development**: Run the local server as described in the setup instructions below.

## Features

- **Real-time 3D Modeling**: Interactive brick-building interface using Three.js
- **Session Collaboration**: One expert to multiple students with real-time updates
- **Haptic Feedback**: Mobile devices provide tactile feedback during interactions
- **Voice Recognition**: Speech-to-text functionality for hands-free operation
- **QR Code Integration**: Easy mobile device pairing


## How to Interact with Blocks

### Desktop Interface
- **Select Brick**: Select bricks from the side bar
- **Place Bricks**: Click on the baseplate to place new bricks
- **Rotate Bricks**: Press the 'R' key while dragging a brick to rotate it
- **Drag Bricks**: Click and drag bricks to move them around the workspace
- **Delete Bricks**: Right-click on bricks to remove them

### Mobile Interface
- **Haptic Feedback**: Mobile devices vibrate when bricks are placed correctly on the desktop

## Project Structure

```
CPSC-581-Group-Project-2/
├── my-app/          # Next.js frontend application
│   ├── app/         # Next.js App Router pages
│   ├── components/  # React components
│   ├── lib/         # Utility functions and socket client
│   └── public/      # Static assets
└── server/          # Node.js WebSocket server
```

## Prerequisites

- Node.js (v16 or higher)
- npm 
- Git

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ChristianN517/CPSC-581-Group-Project-2.git
```

### 2. Install Dependencies

**Frontend (Next.js):**
```bash
cd my-app
npm install
```

**Backend (Socket Server):**
```bash
cd ../server
npm install
```

### 3. Start the Application

You need **two terminals** running simultaneously:

**Terminal 1 - Socket Server:**
```bash
cd server
node index.js
```
Server runs on `http://localhost:3001`

**Terminal 2 - Next.js Frontend:**
```bash
cd my-app
npm run dev
```
Frontend runs on `http://localhost:3000`

### 4. Access the Application

- **Desktop Interface**: http://localhost:3000
- **Student Workspace**: http://localhost:3000/student
- **Expert Workspace**: http://localhost:3000/expert
- **Mobile Interface**: http://localhost:3000/student/mobile (for mobile devices)

## Key Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 16 | React framework with App Router |
| **3D Rendering** | Three.js + React Three Fiber | Interactive 3D modeling |
| **Real-time Communication** | Socket.IO | Bidirectional event streaming |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Mobile Features** | Web APIs | Vibration API, Web Audio API, Speech Recognition |
| **Backend** | Node.js + Express | WebSocket server |


## Team

Chris, Grace, JJ, and Caleb
