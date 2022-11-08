const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --------------------------
// Database Connection Start
//  -------------------------
const uri = process.env.DB_URL;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1
});

async function runDB() {
	try {
		await client.connect();
		console.log('Database Connected Successfully...!');
	} catch (error) {
		console.error(error.stack);
	}
}
runDB();

const database = client.db('PlumBoyServiceReview');
const serviceCollection = database.collection('Services');

// Routes

// Test route
app.get('/', (req, res) => {
	res.send('Server is Running');
});

// Start server
app.listen(port, () => {
	console.log(`Server is running on port:...${port}`);
});
