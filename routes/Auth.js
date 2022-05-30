
const dbo = require("../db/conn");             //database connection
const router = require("express").Router();
const bcrypt = require("bcrypt");
var ObjectID = require('mongodb').ObjectID;  
var jwt = require("jsonwebtoken");



const nodemailer=require('../Configs/nodemailer');

//REGISTER
router.route("/register").post(async(req, res) =>{
  let db_connect =dbo.client.db("Users");
 
  const User = require("../Models/User");

   

  const Secret='bezkoder-secret-key'

  const token = jwt.sign({email: req.body.email}, Secret);
 

  
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password:hashedPassword,
      confirmationCode: token,
      balance: 0,
      Trades:0,
      Investment:0,
      Profit:0,
      Assets:[{coin:'AAPL'
      ,amount:0},{coin:'MSFT',amount:0},{coin:'TSLA',amount:0},{coin:'AMC',amount:0},{coin:'FB',amount:0}]
    });

    db_connect.collection("Users").insertOne(newUser,  function(err, result) {
      if (err) {
        console.log("fetch.............................:" + err);
        res.send(err)
      };
      res.status(200).json(result);

        
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
}); 

//LOGIN
router.route("/login").post((req, res) => {

  console.log(req.body,"58");

  let db_connect=dbo.client.db("Users");
 

  try {
    db_connect.collection("Users").findOne({email:req.body.email }, async function(err, result){
      if (err||!result) {
        console.log(err);
         res.status(404).json("user not found");
      }
      
      const validPassword = await bcrypt.compare(req.body.password, result.password)
     
      
       if(!validPassword){
        res.status(400).json("wrong password");
        console.log("Invalid password")
       }

      
      else{
      console.log('done')
        res.status(200).json(result);
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
});



exports.verifyUser = (req, res, next) => {
  User.findOne({
    confirmationCode: req.params.confirmationCode,
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      user.status = "Active";
      user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
      });
    })
    .catch((e) => console.log("error", e));
};



router.route("/confirm/:code").get((req, res) => {
  let db_connect =dbo.client.db("Users");
  console.log(req.params);

  try {
    db_connect.collection("Users").findOneAndUpdate({confirmationCode: req.params.code}, {$set: {status: "Active"}}, function(err, result){

      if (err) {
        console.log(err);
        }
       
      else if (!result) {
          return res.status(404).send({ message: "User Not found." });
      }

      else{
        res.status(200).json(result);
      }
     
      });
    }
    catch (err) {
    console.log(err);
  }
 
  })
//Fetch Dashboard Data of user





router.route("/Profile/:id").get((req, res) => {
  let db_connect =dbo.client.db("Users");
  try {
    let userQuery = {_id:new ObjectID(req.params.id)};
    db_connect.collection("Users").findOne(userQuery, async function(err, result){
      if (err) {
        console.log(err);
        res.status(404).json("user not found");
      }
      res.status(200).json(result);
   });
  } catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
});



// // Update User Data
router.route("/update-user/:id").get((req, res) => {
  let db_connect=dbo.client.db("Metagig");
  db_connect.findById(
        req.params.id, (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data);
      }
    });
  })

  // Update User Details
  .put((req, res, next) => {
    db_connect.collection("Users").findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      (error, data) => {
        if (error) {
          return next(error);
          console.log(error);
        } else {
          res.json(data);
          console.log("user updated successfully !");
        }
      }
    );
  });
  
module.exports = router;


