# Collaborative Kanban Board

A MERN-based Kanban board application inspired by Trello.

## Features

- JWT Authentication
- Workspace & Board Management
- Task CRUD
- Task Priority & Status
- Drag & Drop
- MongoDB Persistence

## Tech Stack

- React
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- DnD Kit

## Architecture

```text
User → Workspace → Board → Task
State Management

React useState and useEffect manage tasks and UI state.

Drag-and-drop updates task status and order, which are synchronized with MongoDB through REST APIs.

API
/api/auth
/api/workspaces
/api/boards
/api/tasks
Setup
npm install
cd server
npm install
node server.js

In another terminal:

npm run dev
Author

GDG JIIT 128 Core Team Task