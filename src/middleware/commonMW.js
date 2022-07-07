const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const bookModel= require("../models/bookModel")

const authenticate = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        if(!token) token =req.headers["X-Api-Key"];
        if (!token) return res.status(400).send({ status: false, msg: "Token Required" });
    try{
         let decodedToken = jwt.verify(token, "Book Management Project@#$%, team No.= 62")  
        if (!decodedToken) return res.status(401).send({ status: false, msg: "Authentication failed" });
      }
      catch(err){
       return res.status(401).send({status:false,msg:"Sorry Your token is expires now"})
     }
        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}



const authorise = async function (req, res, next) {
    try {
    
        let book = req.params.bookId
        if (!book) return res.status(400).send({ status: false, data: "ID not Found in path param" })
        const check = await bookModel.findById(book)
        if (!check) return res.status(404).send({ status: false, msg: "data not found with this book id" })
        console.log(check)
        let token = req.headers["x-api-key"];
        let decodedToken = jwt.verify(token, "Book Management Project@#$%, team No.= 62")
        console.log(check.userId.toString())
        if (decodedToken.id !== check.userId.toString()) return res.status(401).send({ status: false, msg: "User logged is not allowed to delete the requested book data" })
        next()
        //if (!mongoose.Types.ObjectId.isValid(book))  return res.status(400).send({ status: false, data: "please provide correct id" })
          
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}



module.exports.authenticate=authenticate
module.exports.authorise=authorise