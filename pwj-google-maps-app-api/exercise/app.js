const express = require("express");
const mongoose = require("mongoose");
const app = express();
const axios = require("axios");
const port = process.env.PORT || 3000;
const Store = require('./api/models/store');
const GoogleMapsService = require("./api/services/googleMapsService");
const googleMapsService = new GoogleMapsService();
require("dotenv").config();

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', "*");
    next();
})

mongoose.connect('mongodb+srv://johnty980:9VlNc11en3AH3H0q@cluster0.cqrpd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{
    useNewUrlParser: true.valueOf,
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.use(express.json({limit: '50mb' }));

app.post('/api/stores', (req, res) => {
    let dbStores = [];
    let stores = req.body;
    stores.forEach((store) => {
        dbStores.push({
            storeName: store.name,
            phoneNumber: store.phoneNumber,
            address: store.address,
            openStatusText: store.openStatusText,
            addressLine: store.addressLine,
            location: {
                type: 'Point',
                coordinates: [
                    store.coordinates.longitude,
                    store.coordinates.latitude
                ]
            }
        })
    })

    Store.create(dbStores, (err, stores) => {
        if(err){
            res.status(500).send(err);
        } else {
            res.status(200).send(stores);
        }
    })

});

app.get('/api/stores', (req, res) => {
    const zipCode = req.query.zip_code;
    googleMapsService.getCoordinates(zipCode)
    .then((coordinates) => {
        Store.find({
            location: {
                $near: {
                    $maxDistance: 3218,
                    $geometry: {
                        type: "Point",
                        coordinates: coordinates
                    }
                }
            }
        }, (err, stores) => {
            if(err){
                res.status(500).send(err);
            } else {
                res.status(200).send(stores);
            }
        })
    }).catch((error) => {
        console.log(error);
    })
   
})

app.delete('/api/stores', (req, res) => {
    Store.deleteMany({}, (err) => {
        res.status(200).send(err);
    })
})

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))

