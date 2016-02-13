var express = require('express'),
  router = express.Router();
  mongoose = require('mongoose'),
  Post = mongoose.model('Post');
  Category = mongoose.model('Category');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  res.redirect('/posts')
});

router.get('/about', function (req, res, next) {
    Post.find({published:true})
      .sort('created')
      .populate('author')
      .populate('category')
      .exec(function (err, posts) {
      if (err) return next(err);
      var pageNum = Math.abs(parseInt(req.query.page ||1,10));
      var pageSize = 10;

      var totalCount = posts.length;
      var pageCount = (totalCount/pageSize);

      if(pageNum>pageCount){
          pageNum = pageCount;
      } 
      res.render('blog/about', {
        title: 'About me',
        pretty:true
      });
  });
});

router.get('/contact', function (req, res, next) {
      res.render('blog/contact', {
      title: 'contact me',
      pretty:true
    });
});
