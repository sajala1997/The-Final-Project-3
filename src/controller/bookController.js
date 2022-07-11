const bookModel = require('../models/bookModel')
const reviewModel = require('../models/reviewModel')
const { isEmpty, isValidISBN, isVerifyString, isValidDate } = require('../middleware/validation')
const userModel = require("../models/userModel")


const createBook = async function (req, res) {

    try {
        let data = req.body;
        // destructuring the request body
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

        // checking if request body is empty
        if (Object.keys(data).length == 0) { res.status(400).send({ status: false, msg: "Enter the Books details" }) }

        // checking if requireq fields is provided in request body
        if (!title) { return res.status(400).send({ status: false, msg: "title is required" }) }
        if (!excerpt) { return res.status(400).send({ status: false, msg: "excerpt is required" }) }
        if (!userId) { return res.status(400).send({ status: false, msg: "userId is required" }) }
        if (!ISBN) { return res.status(400).send({ status: false, msg: "ISBN is required" }) }
        if (!category) { return res.status(400).send({ status: false, msg: "category is required" }) }
        if (!subcategory) { return res.status(400).send({ status: false, msg: "subcategory is required" }) }

        // checking if requireq fields is empty in request body
        if (!isEmpty(title)) return res.status(400).send({ status: false, msg: "Please enter Title" })

        if (!isEmpty(excerpt)) { return res.status(400).send({ status: false, msg: "excerpt is required" }) }

        let userID = data.userId
        let checkUserId = await userModel.findOne({ userId: userID })
        if (!checkUserId)
            return res.status(400).send({ status: false, msg: "userId don't Exist" })


        let ISBNnumber = data.ISBN;
        let checkISBN = await bookModel.findOne({ ISBN: ISBNnumber })
        if (checkISBN)
            return res.status(400).send({ status: false, msg: "ISBN Number already Exist" })

        if (!isEmpty(ISBN)) { return res.status(400).send({ status: false, msg: "ISBN is required" }) }
        if (!isValidISBN(ISBN)) { return res.status(400).send({ status: false, msg: "ISBN is not valid" }) }

        if (!isEmpty(category)) { return res.status(400).send({ status: false, msg: "category is required" }) }
        if (isVerifyString(category)) return res.status(400).send({ status: false, message: "category can't contain number" })

        if (!isValidDate(releasedAt)) return res.status(400).send({ status: false, message: "Enter a valid date with the format (YYYY-MM-DD)" })


        if (!isEmpty(subcategory)) { return res.status(400).send({ status: false, msg: "subcategory is required" }) }
        if (isVerifyString(subcategory)) return res.status(400).send({ status: false, message: "subcategory can't contain number" })



        let bookData = await bookModel.create(data);
        res.status(201).send({ status: true, msg: bookData })

    } catch (error) {
        console.log("Server Error", error.message)
        res.status(500).send({ status: false, msg: "Server Error: " + error.message })
    }

}

const getBooks = async function (req, res) {
    try {

        let allQuery = req.query
        let booksDetail = await bookModel.find(({ $and: [allQuery, { isDeleted: false }] }))
        console.log(booksDetail)
        if (booksDetail == false)
            res.status("404").send({ status: false, msg: "data not found" })
        else {
            let data = []
            for (let i = 0; i < booksDetail.length; i++) {
                let books = {
                    "title": booksDetail[i].title,
                    "excerpt": booksDetail[i].excerpt,
                    "userId": booksDetail[i].userId,
                    "category": booksDetail[i].category,
                    "releasedAt": booksDetail[i].releasedAt,
                    "reviews": booksDetail[i].reviews
                }
                data.push(books)


            }
            data.sort(function (a, b) {
                if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
                if (a.title.toLowerCase() > b.title.toLowerCase()) return 1
                return 0;
            })


            console.log(data)
            res.status(200).send({ status: true, message: "Books List", data: data })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
} 

// ### GET /books/:bookId
let getBookByID=async function(req,res){
    try {
        let data=req.params.bookId
        if(!data)return res.status(400).send({status:false,msg:""})
        if(data.length !=24) return res.status(400).send({status:false,msg:"enter valid objectID"}) 
             //    if(!(mongoose.Types.ObjectId.isValid(data)))return res.status(400).send({status:false,msg:"enter valid objectID"}) 
        let findBook=await bookModel.findOne({_id:data}).lean()
        if(!findBook)return res.status(404).send({status:false, meg:"No Data Found For this ID"})
        let findReview=await reviewModel.find({bookId:data})
        ReviewCount=findReview.length
        console.log(ReviewCount)
        findBook.reviews=ReviewCount  
        findBook['reviewsData']=findReview
        return res.status(200).send({status:true,message:'Books list',Data:findBook})
    } catch (error) {
        return res.status(500).send({status:false,err:error.message})
    }
};

const deleteBooks = async function (req, res) {
    try {
        let book = req.params.bookId
        console.log(book)
        const check = await bookModel.findById(book)
        
        if(check.isDeleted==true) return res.status(200).send({ status: false, msg: "data is already deleted" })
        let DeletedBook = await bookModel.findByIdAndUpdate(  { _id: book }, {$set: { isDeleted: true }}, {new: true})
        return res.status(200).send({ status: true, data: DeletedBook })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }


};

let updateBook=async function (req,res){
    try {
        let data=req.body
        let book=req.params.bookId 
        const findBook = await bookModel.findOne({_id:book,isDeleted:false}).lean()
        if(!findBook) return res.status(404).send({ status: false, msg:"No book found"  })

        let temp={};
    
        if(data.title){
            trimTitle=data.title.trim()
            findBook.title=trimTitle
            const checkTitle = await bookModel.findOne({title:trimTitle})
            if(checkTitle)return res.status(400).send({status:false,msg:"this title:"+trimTitle +" "+"already present in database"})
            temp["title"]=trimTitle
        }
        if(data.excerpt){
            trimExcerpt=data.excerpt.trim()
            findBook.excerpt=data.excerpt
            temp["excerpt"]=data.excerpt
        }
        if(data.ISBN){
            trimISBN=data.ISBN.trim()
            findBook.ISBN=trimISBN
           if( !isValidISBN(trimISBN))return res.status(400).send({status:false,msg:" Enter valid ISBN "})
            const checkISBN = await bookModel.findOne({ISBN:trimISBN})
            if(checkISBN)return res.status(400).send({status:false,msg:"this ISBN:"+trimISBN +" "+"already present in database"})
            temp["ISBN"]=trimISBN
        }
         if(data.releasedAt){
            trimReleasedAt=data.releasedAt.trim()
           if(! isValidDate(trimReleasedAt))return res.status(400).send({status:false,msg:"Enter valid date (YYYY-MM-DD) "})
            findBook.releasedAt=trimReleasedAt
            temp["releasedAt"]=trimReleasedAt
         }

        let update=await bookModel.findOneAndUpdate({_id:book},{$set:temp},{new:true})
        return res.status(200).send({status:true,msg:"success",data:update})
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ status: false, msg: error.message })
    }
} 

let updateReview = async function(req, res){
    let book = req.params.bookId;
    const findBook = await bookModel.findOne({_id:book,isDeleted:false}).lean()
    if(!findBook) return res.status(404).send({ status: false, msg:"No book found"  })

    let data = {};

    if(data.title){
        trimTitle=data.title.trim()
        findBook.title=trimTitle
        const checkTitle = await bookModel.findOne({title:trimTitle})
        if(checkTitle)return res.status(400).send({status:false,msg:"this title:"+trimTitle +" "+"already present in database"})
        temp["title"]=trimTitle
    }

    return res.status(200).send({status:true,msg:"Updated success"})
}



module.exports.createBook = createBook;
module.exports.getBooks = getBooks
module.exports.deleteBooks=deleteBooks
module.exports.getBookByID=getBookByID
module.exports.updateBook=updateBook
module.exports.updateReview=updateReview