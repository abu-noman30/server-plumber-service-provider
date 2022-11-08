const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes

// Test route
app.get('/', (req, res) => {
	res.send('Server is Running');
});

// Start server
app.listen(port, () => {
	console.log(`Server is running on port:...${port}`);
});
