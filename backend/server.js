const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // Backend port

// Middleware to parse JSON bodies
app.use(express.json());

// API routes can be added here
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Serve static files from the frontend (Vite build output)
// This assumes your frontend build output is in 'frontend/dist'
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// For any other routes, serve the frontend's index.html
// This is important for client-side routing in your frontend app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
}); 