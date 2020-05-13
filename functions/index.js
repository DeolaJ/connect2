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

exports.upload = functions.https.onCall(async (data, context) => {
  try {
    cloudinary.config({ 
        cloud_name: `${functions.config().cloudinary.cloudname}`, 
        api_key: `${functions.config().cloudinary.apikey}`, 
        api_secret: `${functions.config().cloudinary.apisecret}`
    })
    const { dataUrl } = JSON.parse(data)
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