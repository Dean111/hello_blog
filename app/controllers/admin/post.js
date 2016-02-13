var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  slug = require('slug'),
  User = mongoose.model('User'),
  pinyin = require('pinyin'),
  auth = require('./user'),
  Category = mongoose.model('Category');

module.exports = function (app) {
  app.use('/admin/posts', router);
};

router.get('/',auth.requireLogin, function (req, res, next) {
  //sort
    var sortby = req.query.sortby ? req.query.sortby : 'created';//设置排序的字段
    var sortdir = req.query.sortdir ? req.query.sortdir : 'desc';//默认降序排列
    if (['title','author','created','category','published'].indexOf(sortby) === -1) {//设置白名单
        sortby = 'created';
    };
    if(['asc','desc'].indexOf(sortdir) === -1){
        sortdir = 'desc';
    };
    var sortObj = {};
    sortObj[sortby] = sortdir;
    //condition
    var conditions ={};
    if(req.query.category){
        conditions.category = req.query.category.trim();
    }
    if (req.query.author) {
        conditions.authors = req.query.authors.trim();
    };

    if (req.query.keyword) {
        conditions.content = RegExp(req.query.keyword.trim(),'i');
        conditions.title = RegExp(req.query.keyword.trim(),'i');
    };
    User.find({},function(err,authors){
        if (err) {
            return next(err);  
        };
        Post.find(conditions)
        .sort(sortObj)
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
        res.render('admin/post/index', {
            posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
            pageNum:pageNum,
            pageCount:pageCount,
            authors:authors,
            sortdir:sortdir,
            sortby:sortby,
            pretty:true,
            filter:{
                category: req.query.category || "",
                author: req.query.author || "",
                keyword:req.query.keyword || "",
            }
        });
    });
    });
});

router.get('/add',auth.requireLogin, function (req, res, next) {
  res.render('admin/post/add', {
        action:"/admin/posts/add",
        pretty:true,
        post:{
            category:{ _id:''},
        },
      });
});
router.post('/add', auth.requireLogin,function (req, res, next) {
    //后台验证表单
    req.checkBody('title','文章标题不能为空').notEmpty();
    req.checkBody('category','必须制定文章的类别').notEmpty();
    req.checkBody('content','文章内容不能为空').notEmpty();
    //获取错误
    var errors = req.validationErrors();
    if (errors) {
        return res.render('admin/post/add',{
            errors:errors,
            title:req.body.title,
            content:req.body.content,
        });
    }


    var title = req.body.title.trim();
    var content = req.body.content;
    var category = req.body.category.trim();
    console.log("category is "+category);
    User.findOne({},function(err,author){
        if(err){
            return next(err);
        }
        var py = pinyin(title,{
            style: pinyin.STYLE_NORMAL, // 设置拼音风格
            heteronym: false
        }).map(function(item){
            return item[0];
            
        }).join(' ');
        console.log(py);

        var post = new Post({
            title:title,
            category:category,
            content:content,
            author:author,
            published:true,
            slug:slug(py),
            meta:{favourite:0},
            comments:[],
            created:new Date(),
        });

        post.save(function(err,post){
            if(err){
                console.log('err is '+ err);
                req.flash("err","文章保存失败");
                res.redirect('/admin/posts/add');
            }else{
                req.flash('info','文章保存成功');
                res.redirect('/admin/posts');    
            }
        });

    });
    
});

router.get('/edit/:id',getPostById, auth.requireLogin,function (req, res, next) {
    res.render('admin/post/add',{
        action:"/admin/posts/edit/"+req.post._id,
        post:req.post,
    });
});
router.post('/edit/:id',auth.requireLogin,getPostById, function (req, res, next) {
    var title = req.body.title.trim();
    var content = req.body.content;
    var category = req.body.category.trim();
    var post = req.post;
    var py = pinyin(title,{
        style:pinyin.STYLE_NORMAL,
        heteronym:false
    }).map(function(item){
        return item[0];
    }).join(' ');

    post.title=title;
    post.content=content;
    post.category = category;
    post.slug = slug(py);

    post.save(function(err,post){
        if(err){
            console.log('post/edit err',err);
            req.flash('error','文章编辑失败');
            res.redirect('/admin/posts/edit/'+post._id);
        }else{
            req.flash('info','文章保存成功');
            res.redirect('/admin/posts');                
        }
    });
});
router.get('/delete/:id', auth.requireLogin,function (req, res, next) {
  if(!req.params.id){
      return next(new Error('no post id has provided'));
  }
  Post.remove({_id:req.params.id}).exec(function(err,RowsRemoved){
      if(err){
        return next(err);
      }
      if(RowsRemoved){
        req.flash("success",'文章删除成功');
      }else{
        req.flash('fail','文章删除失败');
      }
      res.redirect('/admin/posts');
  });
});

function getPostById(req,res,next){
    if (!req.params.id) {
        return next(new Error('no post id provided'));
    };

    Post.findOne({ _id: req.params.id})
    .populate('category')
    .populate('author')
    .exec(function(err,post){
            if (err) {
                return next(err);
            };
            if (!post) {
                return next(new Error('post not found',req.params.id));
            };

            req.post = post;
            next();
        });
}