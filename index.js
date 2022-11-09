const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
const reviewCollection = database.collection('Reviews');

// Routes
app.get('/home-services', async (req, res) => {
	try {
		const query = {};
		const filter = serviceCollection.find(query);

		// const allResult = await filter.toArray();
		const result = await filter.limit(3).toArray();

		res.status(200).send(result);
	} catch (error) {
		console.error(error);
	}
});
app.get('/services', async (req, res) => {
	try {
		const query = {};
		const filter = serviceCollection.find(query);

		const result = await filter.toArray();

		res.status(200).send(result);
	} catch (error) {
		console.error(error);
	}
});
app.get('/services/:id', async (req, res) => {
	try {
		const serviceId = req.params.id;
		const query = { _id: ObjectId(serviceId) };

		const result = await serviceCollection.findOne(query);

		res.status(200).send(result);
	} catch (error) {
		console.error(error);
	}
});

app.post('/add-review', async (req, res) => {
	try {
		const UserRreview = req.body;
		const doc = {
			...UserRreview
		};
		const result = await reviewCollection.insertOne(doc);

		res.status(200).send(result);
	} catch (error) {
		console.error(error);
	}
});

app.get('/reviews', async (req, res) => {
	try {
		const serviceId = req.headers.serviceid;
		// console.log(serviceId);
		const query = {
			'serviceInfo.id': { $eq: serviceId }
		};

		const options = {
			// sort returned documents in decending order by date (Recent->Previous)
			sort: { dateTime: -1 }
		};
		const filter = reviewCollection.find(query, options);

		const result = await filter.toArray();

		res.status(200).send(result);
	} catch (error) {
		console.error(error);
	}
});

app.get('/myreviews', async (req, res) => {
	try {
		const userEmail = req.query.email;
		const query = {
			'userInfo.email': { $eq: userEmail }
		};

		const filter = reviewCollection.find(query);

		const result = await filter.toArray();

		res.status(200).send(result);
	} catch (error) {
		console.error(error);
	}
});

// Test route
app.get('/', (req, res) => {
	res.send('Server is Running');
});

// Start server
app.listen(port, () => {
	console.log(`Server is running on port:...${port}`);
});
