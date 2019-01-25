const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const Orders=require('../models/orders')
const Products=require('../models/products')

//CHECKAUTH handle jwt authentication
const checkauth = require('../middleware/check-auth')

router.get('/',checkauth,(req,res,next)=>{

    Orders.find().
    select('product quantity _id')//return specific value
    .populate('product','name')
    .exec().then(doc=>{
        const result ={ count : doc.length,
            orders:doc.map(doc=>{
                return{
                    _id:doc._id,
                    product:doc.product,
                    quantity:doc.quantity,
                    
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/orders/'+doc.id
                    }
                }
            })
         }
        console.log(doc)
        res.status(200).json(result)
    }).catch(
        err=>{
            console.log(err)
            res.status(500).json({error:err})
        }
    )
})


router.post('/',checkauth,(req,res,next)=>{
    Products.findById(req.body.productId)
    .then(product=>{
        if(!product){
            return res.status(404).json({
                message:"Product not found"
            })
        }
        const order= new Orders(
            {   _id:mongoose.Types.ObjectId(),
                product: req.body.productId,
                quantity:req.body.quantity
            }
        )
    
         return order.save()
             
    })
    .then(result=>{
        console.log(result)
        res.status(201).json({
            
           message:'order stored',
           createdOrder:{
               id:result._id,
               product:result.product,
               quantity:result.quantity
           },
           request:{
               type:'GET',
               url:'http://localhost:3000/orders/'+result.id
           }
        })
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })


})

router.get('/:orderId',checkauth,(req,res,next)=>{
    const id = req.params.orderId


    Orders.findById(req.params.orderId)
          .populate('product')
          .exec()
          .then(order=>{
              if(!order){
                  return res.status(404).json({
                      message:"order not found"
                  })
              }
              res.status(200).json({
                  order:order,
                  request:{
                    type:'GET',
                    url:'http://localhost:3000/orders'
                }
              })
          })
          .catch(
              err=>{
            console.log(err)
            res.status(500).json({error:err})
        })
})

router.patch('/:orderId',checkauth,(req,res,next)=>{
    res.status(200).json({
        message:'UPDATE orders'
    })
})

router.delete('/:orderId',checkauth,(req,res,next)=>{
    Orders.remove({_id:req.params.orderId})
    .exec()
    .then(result=>{
        res.status(200).json(
            
            {message:'order deleted',
        
        request:{
            type:'POST',
            url:"http://localhost:3000/orders",
            body:{productId:"Id" , quantity:"Number"}
        }
        }

        )
    })
    .catch(
        err=>{
            console.log(err)
            res.status(500).json({error:err})
        }
    )
})

module.exports = router;