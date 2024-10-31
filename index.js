const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port= process.env.port || 9000
const app= express()

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
    // insert one data on the server
    app.post('/jobs', async (req, res) => {
        const data = req.body
        const result = jobCollection.insertOne(data)
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



app.get('/', (req,res)=>{
    res.send('Job Sync Server running smoothly!')
    })
    app.listen(port, ()=>console.log(`Server Running at port: ${port}`))