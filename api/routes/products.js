const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product=require('../models/products')
const checkauth = require('../middleware/check-auth')
const multer = require('multer')



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, './uploads')
   },
   filename: function (req, file, cb) {
    
   cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
   
   }
   })

const fileFilter=(req, file, cb)=>{
if(file.mimetype==='image/png'){
    cb(null,true)
}else{
    cb(null,false)
}
}

var upload = multer({ storage: storage ,limits:{fileSize:1204 * 1024 * 5} , fileFilter:fileFilter});




router.get('/',(req,res,next)=>{
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(doc=>{
        const result ={ count : doc.length,
            products:doc.map(doc=>{
                return{
                    name:doc.name,
                    price:doc.price,
                    _id:doc._id,
                    productImage:doc.productImage,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/products/'+doc.id
                    }
                }
            })
         }
        console.log(doc)
        res.status(200).json(result)
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.post('/',checkauth,upload.single('productImage'),(req,res,next)=>{
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price:req.body.price,
        productImage:req.file.path

    })
    product.save()
    .then(result=>{
        console.log(result)
        res.status(201).json({
            message:'createdProduct successfully',
            createdProduct:{
                name:result.name,
                    price:result.price,
                    _id:result._id,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/products/'+ result.id
                    }
            }

        })
    })
    .catch(err=>{
     
        console.log(err)
        res.status(500).json({error :err})
    })

})

router.get('/:productId',(req,res,next)=>{
    const id = req.params.productId
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc =>{
        console.log(doc)
        if(doc){
            res.status(200).json({
                product:doc,
                result:{
                    type:'GET',
                    url:'http://localhost:3000/products'
                }
            })
        }else{
            res.status(404).json({message:'no valid entry is found for provided Id'})
        }
        
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
    
})

router.patch('/:productId',checkauth,(req,res,next)=>{

    const id = req.params.productId
    const updateops={};

    for(const ops of req.body){
      updateops[ops.propName]=ops.value;
    }

    Product.update({_id:id},{$set:updateops})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:'product is updated',
            result:{
                type:'GET',
                url:'http://localhost:3000/products/'+ id
            }
        })
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.delete('/:productId',checkauth,(req,res,next)=>{
    
    const id = req.params.productId
    Product.remove({_id:id})
    .exec()
    .then(result=>{
        res.status(200).json(result)
    })
    .catch(err=>{
        res.status(500).json({error:err})
    })

})


module.exports = router;
