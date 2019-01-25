const express = require('express');
const app = express();
const morgan = require('morgan')
const bodyparser = require('body-parser')
const productroutes = require('./api/routes/products')
const ordersroutes = require('./api/routes/orders')
const usersrouts=require('./api/routes/user')

//database connection:- if it gives coonection 4 error then go to atlas account and conecct app with current ip iddress
const mongoose=require('mongoose')
mongoose.connect('mongodb://tushar123:'+process.env.MONGO_ATLAS_PASS+'@cluster0-shard-00-00-jug1k.mongodb.net:27017,cluster0-shard-00-01-jug1k.mongodb.net:27017,cluster0-shard-00-02-jug1k.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true', { useNewUrlParser: true } );

app.use(morgan('dev'))

//upload to upload image in body
app.use(express.static('uploads'))

app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())

//CORS
app.use((req,res,next) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers" ,
               "Origin , X-Requested-With , Content-Type , Accept , Authorization")

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    }
    next()
})

app.use('/products',productroutes);
app.use('/orders',ordersroutes);
app.use('/users',usersrouts)


// error handaling
app.use((req,res,next)=>{
    const error = new Error('Not Found')
    error.status=404
    next(error)
})


app.use((error,req,res,next)=>{
    res.status(error.status || 500)
    res.json({
        message:error.message
    })
})

module.exports = app