const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {reviewSchema}=require("../schema.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const {isLoggedIn, isOwner}=require("../middleware.js");

//Index Route
router.get("/",async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index",{allListings});
});

//New Route
router.get("/new",isLoggedIn,(req,res)=>{
   
    res.render("listings/new.ejs");
})

//Show Route
router.get("/:id",async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
});


//Create Route
router.post("/",isLoggedIn,wrapAsync(async(req,res,next)=>{
    

        const newListing=new Listing(req.body.listing);
        newListing.owner=req.user._id;
        await newListing.save();
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
   
    
}));

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
})

//Update Route
router.put("/:id",isLoggedIn,isOwner,async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
});

//Delete Route
router.delete("/:id",isLoggedIn,isOwner,async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
});

module.exports=router;