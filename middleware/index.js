var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
           if(err || !foundCampground){
               req.flash("error", "CAMPGROUND NOT FOUND!");
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "PERMISSION DENIEND!");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "YOU NEED TO BE LOGGED IN TO PERFORM THIS ACTION!");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err || !foundComment){
               req.flash("error", "COMMENT NOT FOUND!");
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "PERMISSION DENIEND!");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "YOU NEED TO BE LOGGED IN TO PERFORM THIS ACTION!");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "YOU NEED TO BE LOGGED IN TO PERFORM THIS ACTION!");
    res.redirect("/login");
};

module.exports = middlewareObj;