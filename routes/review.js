const express=require("express");
const router=express.Router({mergeParams:true});

const wrapAsync=require("../utils/wrapAsync.js");
const {reviewSchema}=require("../schema.js");
const ExpressError=require("../utils/ExpressError.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const {isLoggedIn, isReviewAuthor}=require("../middleware.js");


const validateReview=(req,res,next)=>{
    let {error} =reviewSchema.validate(req.body);
    if (error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

//Reviews
//Post Review Route
router.post("/",validateReview,isLoggedIn,async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview._id);

    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created!");

    res.redirect(`/listings/${listing._id}`);
});

//Delete Review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,async(req,res)=>{
    let{id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
});

module.exports=router;