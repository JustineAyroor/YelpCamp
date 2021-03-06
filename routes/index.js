var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campgrounds");

//root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName, 
            email: req.body.email, 
            avatar: req.body.avatar
        });
    if(req.body.adminCode === 'halkahalka1234'){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            //console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect("/campgrounds"); 
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "LOGGED YOU OUT!!");
   res.redirect("/campgrounds");
});

// USER PROFILES
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser){
       if(err){
           req.flash("error", "User Profile Not Found");
           res.redirect("/");
       }
       Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
           if(err){
           req.flash("error", "Campground Not Found");
           res.redirect("/");
           }
           res.render("users/show", {user: foundUser, campgrounds:campgrounds});
       });
       
    });
});

// EDIT USER
router.get("/users/:id/edit", function(req, res) {
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "User Not Found");
            res.redirect("/");
        }
        res.render("users/edit", {user: foundUser});
    });
});

// UPDATE USER
router.put("/users/:id", function(req, res) {
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
        if(err){
            req.flash("error", "User Not Found");
            res.redirect("/");
        }
        req.flash("success","SUCCESSFULLY UPDATED!");
        res.redirect("/users/" + updatedUser.id);
    });
});

// DELETE USER
router.delete("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, DeletedUser) {
        if(err){
            req.flash("error", "User Not Found");
            res.redirect("/campgrounds");
        } else{
            Campground.find().where('author.id').equals(DeletedUser._id).exec(function(err, campgrounds){
                if(err && !campgrounds){
                    req.flash("error", "Campgrounds Not Found");
                    res.redirect("/campgrounds");
                } else {
                    campgrounds.forEach(function(campground){
                        Campground.findOneAndRemove(campground._id, function(err){
                        if(err){
                            req.flash("error", "Campgrounds Not Found");
                            res.redirect("/campgrounds");
                        }
                    });
                    });
                    User.findByIdAndRemove(DeletedUser._id, function(err){
                       if(err){
                           req.flash("error", "No Such User Found");
                           res.redirect("/campgrounds");
                       } else {
                           req.flash("error", "User Found and Deleted from Database");
                           res.redirect("/campgrounds");
                       } 
                    });
                }
            });
        }
    });
});

module.exports = router;