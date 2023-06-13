const express = require('express')
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

//exploring dot environment to hide user and password start
require('dotenv').config();
//exploring dot environment to hide user and password end

 



//middlewire start
// app.use(cors());
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))
app.use(express.json());
//middlewire end

//jwt token function start
function vaifyJwtToken(req, res, next){
    
   const authHeader = req.headers.authorization;
   if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
   }
   const token = authHeader.split(' ')[1];
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      return res.status(401).send({message: 'unauthorized access'});
    }
    req.decoded = decoded;
    next();
   })

}
//jwt token function end


//mongodb cunnection start

    const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1fuvvi5.mongodb.net/?retryWrites=true&w=majority`;
    

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
    //    await client.connect();
        const userCollection = client.db('reviewNode').collection('users');
        const servicesCollection = client.db('servicesNode').collection('services');
        const reviewCollection = client.db('allReviewsNode').collection('reviews');
        
        
        app.post('/users', async(req, res) => {
            const user = req.body;
            console.log('user exsist', user);
            const result = await userCollection.insertOne(user)
            res.send(result);
            
            
        })
        app.post('/reviews', async(req, res) => {
            const reviews = req.body;
            console.log('reviws', reviews);
            const result = await reviewCollection.insertOne(reviews)
            res.send(result);

        })
        app.post('/services', async(req, res) => {
            const services = req.body;
            console.log(services);
            const result = await servicesCollection.insertOne(services);
            res.send(result);
        })
        app.get('/reviews', async(req, res) =>{
            const query = {};
            const cursor = reviewCollection.find(query);
            const allReviews = await cursor.toArray();
            res.send(allReviews);
        })
        app.get('/services/:_id', async(req, res)=>{
            const _id = req.params._id;
            const query = {_id : new ObjectId(_id)};
            const service = await servicesCollection.findOne(query);
            res.send(service);
        });
        app.get('/reviews/:_id', async(req, res) =>{
            const _id = req.params._id;
            const query ={ serviceId: _id};
            const finalreview = await reviewCollection.find(query).toArray();
            res.send(finalreview);
        })
        app.get('/myreviews', vaifyJwtToken, async(req, res) =>{
            const decoded = req.decoded;
            console.log('inside myreview api', decoded);
            console.log('inside myreview req', req.query.email);
            if(decoded.email !== req.query.userEmail){
                return res.status(403).send({message: 'unauthorized access'});
            }
            let query = {};
            if(req.query.userEmail){
                query = {
                    userEmail : req.query.userEmail 
                }
            }
            
            const cursor = reviewCollection.find(query);
            const myreviews = await cursor.toArray();
            res.send(myreviews);

        })
        app.delete('/myreviews/:_id', async(req, res) =>{
            const _id = req.params._id;
            console.log('trying to dlelete', _id);
            const query = {_id :  new ObjectId(_id)};
            const restdeleteReview = await reviewCollection.deleteOne(query);
            res.send(restdeleteReview);
            
        });
        app.get('/update/:_id', async(req, res) => {
            const _id = req.params._id;
            const query = {_id : new ObjectId(_id)};
        
            const updatedreview = await reviewCollection.findOne(query);
            res.send(updatedreview);
        })
        app.put('/update/:_id', async(req, res) =>{
            const _id = req.params._id;
            const filter = {_id: new ObjectId(_id)};
            const Review = req.body;
            const option = {upsert : true};
            const updateReview = {
                $set: {
                    reviewText: Review.reviewText,
                    rate: Review.rate

                }
            }
            const result = await reviewCollection.updateOne(filter, updateReview, option);
            res.send(result);
            
        })

        app.get('/users', async (req, res)=>{
            const query = {};
            const cursor = userCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        });

        app.get('/services', async (req, res)=>{
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services); 

        });

        //Exploring jwt token start
        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '6h'});
            res.send({token});
            console.log(user);
        })
        //Exploring jwt token end

       

       
    } finally {
        // Ensures that the client will close when you finish/error
        // console.log('database cunnected');
        // await client.close();
    }
    }
    run().catch(console.dir);

//mongodb cunnection end

app.get('/', (req, res)=>{
    res.send('Food delivery Servicenew api running');
});




//user part
// app.get('/users', (req, res)=>{
//     res.send(users);
//     console.log('get api called', users)
// })
// app.post('/users', (req, res)=>{
//     res.send(users);
//     console.log(req.body);

//     console.log('post api called')
// })
//services part




app.listen(port, ()=>{
    console.log('Food delivery review Server Running or Port', port);
})
 