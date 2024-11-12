const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.port || 9000
const app = express()

// middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionsSuccessStatus: 200
}))
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.awpu5n8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    const jobCollection = client.db('JobSyncDb').collection('Job')
    const bidCollection = client.db('JobSyncDb').collection('Bid')

    // job related api

    // loading all data
    app.get('/jobs', async (req, res) => {
      const result = await jobCollection.find().toArray()
      res.send(result)
    })
    // loading a single data
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id
      const result = await jobCollection.findOne({ _id: new ObjectId(id) });
      res.send(result)
    })
    // loading all data from a single user
    app.get('/jobs/:email', async (req, res) => {
      // console.log(tokenEmail);
      const email = req.params.email
      // if(tokenEmail !== email){
      //   return res.status(403).send({ message: 'Forbidden Access' })
      // }
      const result = await jobCollection.find({ 'buyer.email': email }).toArray();
      res.send(result)
    })
    // insert one data on the server
    app.post('/jobs', async (req, res) => {
      const data = req.body
      const result = jobCollection.insertOne(data)
      res.send(result)
    })
    // update a data
    app.put('/job/:id', async (req, res) => {
      const id = req.params.id
      const data = req.body
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          ...data
        }
      }
      const result = await jobCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })
    // delete one data
    app.delete('/job/:id', async (req, res) => {
      const id = req.params.id
      const result = await jobCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result)
    })

    // bid related API
    // save a bid data
    app.post('/bids', async (req, res) => {
      const data = req.body

      // check if it is a duplicated request
      const query = {
        email: data.email,
        jobId: data.jobId
      }
      const alreadyApplied = await bidCollection.findOne(query)
      if (alreadyApplied) {
        return res.status(400).send('You have already placed a bid on this job')
      }
      const result = await bidCollection.insertOne(data)

      // Update Bid count in jobs collection 
      const updateDoc = {
        $inc: { bid_count: 1 }
      }
      const countQuery = { _id: new ObjectId(data.jobId) }
      const updateBidCount = await jobCollection.updateOne(countQuery, updateDoc)
      console.log(updateBidCount);
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error


  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Job Sync Server running smoothly!')
})
app.listen(port, () => console.log(`Server Running at port: ${port}`))