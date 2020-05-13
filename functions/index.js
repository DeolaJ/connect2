const functions = require('firebase-functions');
const cloudinary = require('cloudinary');
const admin = require('firebase-admin');
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

admin.initializeApp(functions.config().firebase);
const config = functions.config().cloudinary;
cloudinary.config({ 
    cloud_name: config.cloudname, 
    api_key: config.apikey, 
    api_secret: config.apisecret
})

exports.upload = functions.https.onCall(async (data, context) => {
  try {
    const { dataUrl } = data
    let timeStamp = new Date()
    timeStamp = timeStamp.toJSON()
    let day = timeStamp.substring(0, 10)
    let promise = await cloudinary.v2.uploader.upload(dataUrl, {
      public_id: `${day}/p-covid-${timeStamp}`,
      tags: "connect-campaign"
    })
    return JSON.stringify(promise)
  } catch (err) {
    return JSON.stringify(err)
  }
})

exports.admin = functions.https.onCall(async (data, context) => {
    const code = functions.config().admincode
    return code.code
})