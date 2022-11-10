const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware(Authentication)-JWT(Token)
// --------------------------------------
app.post('/jwt', async (req, res) => {
	try {
		const authoriseUser = req.body;
		// console.log(authoriseUser);
		const token = jwt.sign(authoriseUser, process.env.ACCESS_TOKEN_SECRET_KEY, {
			expiresIn: '1h'
		});
		// Send token as an object form
		res.status(200).send({ accessToken: token });
	} catch (error) {
		res.send({
			errorDetails: error.stack
		});
	}
});

// 2. verifyToken(Wraper function)
function verifyToken(req, res, next) {
	try {
		const authBearerToken = req.headers.authorization;
		// console.log(authBearerToken);

		if (!authBearerToken) {
			return res.status(401).send({
				error: 'Unauthorise Access',
				message: 'authBearerToken not found at verifyToken function'
			});
		}
		// verifyToken
		const token = authBearerToken.split(' ')[1];
		// console.log(token);
		jwt.verify(
			token,
			process.env.ACCESS_TOKEN_SECRET_KEY,
			function (err, decoded) {
				if (err) {
					return res.status(403).send({
						error: 'Forbidden Access',
						message: 'Error found at matching token & ACCESS_TOKEN_SECRET_KEY'
					});
				}
				req.decoded = decoded;
				next();
			}
		);
	} catch (error) {
		res.send(error.stack);
	}
}

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

		const options = {
			// sort returned documents in decending order by date (Recent->Previous)
			sort: { dateTime: -1 }
		};
		const filter = serviceCollection.find(query, options);

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

		const options = {
			// sort returned documents in decending order by date (Recent->Previous)
			sort: { dateTime: -1 }
		};
		const filter = serviceCollection.find(query, options);

		const result = await filter.toArray();

		res.status(200).send(result);
	} catch (error) {
		console.error(error);
	}
});

app.post('/services', async (req, res) => {
	try {
		const serviceData = req.body;

		const doc = {
			name: serviceData.name,
			description: serviceData.description,
			img: serviceData.image,
			payment: serviceData.payment,
			totalPrice: serviceData.totalprice,
			rating: serviceData.rating,
			dateTime: serviceData.dateTime,
			features: [
				'7 Days Service Warranty',
				'Doorstep service',
				'Safety Assurance',
				'24/7 Service'
			],
			pricing: [
				'Only Service Charge',
				'Visiting Charges is BDT 100 if no service is availed',
				'Excludes all components and parts (if used)',
				'Excludes Transportation cost (if applied)'
			],
			Warranty: '7 Days Service Warranty'
		};
		const result = await serviceCollection.insertOne(doc);
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

app.get('/recent-service', async (req, res) => {
	try {
		const query = {};

		const options = {
			// sort returned documents in decending order by date (Recent->Previous)
			sort: { dateTime: -1 }
		};
		const filter = serviceCollection.find(query, options);

		const result = await filter.limit(1).toArray();

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

app.get('/myreviews', verifyToken, async (req, res) => {
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

app.delete('/myreviews/:id', async (req, res) => {
	try {
		const reviewId = req.params.id;
		const query = { _id: ObjectId(reviewId) };

		const result = await reviewCollection.deleteOne(query);

		res.status(200).send(result);
	} catch (error) {
		console.error(error);
	}
});

app.patch('/myreviews/:id', async (req, res) => {
	try {
		const reviewId = req.params.id;
		const reviewData = req.body;
		// console.log(reviewData);

		const query = { _id: ObjectId(reviewId) };

		const updateDoc = {
			$set: {
				'userInfo.title': reviewData.title,
				'userInfo.message': reviewData.message,
				dateTime: new Date().toLocaleString()
			}
		};

		const result = await reviewCollection.updateOne(query, updateDoc);

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
