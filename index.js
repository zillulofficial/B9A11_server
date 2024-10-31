const express = require('express');
const cors = require('cors');
// const { MongoClient, ServerApiVersion } = require('mongodb');
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


app.get('/', (req,res)=>{
    res.send('Job Sync Server running smoothly!')
    })
    app.listen(port, ()=>console.log(`Server Running at port: ${port}`))