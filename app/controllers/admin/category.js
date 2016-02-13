var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  pinyin =  require('pinyin'),
  Category = mongoose.model('Category'),
  auth = require('./user');

module.exports = function (app) {
  app.use('/admin/categories', router);
};



router.get('/', auth.requireLogin,function (req, res, next) {
   res.render('admin/category/index', {
        pretty:true
      });
});
router.get('/add',auth.requireLogin, function (req, res, next) {
   res.render('admin/category/add', {
        action:"/admin/categories/add",
        category:{ _id:''},
        pretty:true
      });
});
router.post('/add', auth.requireLogin,function (req, res, next) {
    //后台验证表单
    req.checkBody('name','分类名称不能为空').notEmpty();
    //获取错误
    var errors = req.validationErrors();
    if (errors) {
        return res.render('admin/category/add',{
            errors:errors,
            name:req.body.name,
        });
    }


    var name = req.body.name.trim();
    var py = pinyin(name,{
        style: pinyin.STYLE_NORMAL, // 设置拼音风格
        heteronym: false
    }).map(function(item){
        return item[0];
        
    }).join(' ');
    console.log(py);
    var category = new Category({
        name:name,
        slug:slug(py),
        created:new Date(),
    });

    category.save(function(err,category){
        if(err){
            console.log('err is '+ err);
            req.flash("err","分类保存失败");
            res.redirect('/admin/categories/add');
        }else{
            req.flash('info','分类保存成功');
            res.redirect('/admin/categories');    
        }

});
});

router.get('/edit/:id',auth.requireLogin,getCategoryById, function (req, res, next) {
    res.render('admin/Category/add',{
        action:"/admin/categories/edit/"+req.category._id,
        category:req.category,
    });
});
router.post('/edit/:id',getCategoryById, function (req, res, next) {
  var category = req.category;
  var name = req.body.name.trim();
    var py = pinyin(name,{
        style:pinyin.STYLE_NORMAL,
        heteronym:false
    }).map(function(item){
        return item[0];
    }).join(' ');

    category.name=name;
    category.slug = slug(py);

    category.save(function(err,category){
        if(err){
            console.log('category/edit err',err);
            req.flash('error','文章分类编辑失败');
            res.redirect('/admin/categories/edit/'+category._id);
        }else{
            req.flash('info','文章分类保存成功');
            res.redirect('/admin/categories');                
        }
    });
});
router.get('/delete/:id', auth.requireLogin,getCategoryById, function (req, res, next) {
    req.category.remove(function (err, rowsRemoved) {
        if (err) {
            return next(err);
        }

        if (rowsRemoved) {
            req.flash('success', '分类删除成功');
        } else {
            req.flash('success', '分类删除失败');
        }

        res.redirect('/admin/categories');
    });
});

function getCategoryById(req, res, next) {
    if (!req.params.id) {
        return next(new Error('no category id provided'));
    }

    Category.findOne({ _id: req.params.id })
        .exec(function (err, category) {
            if (err) {
                return next(err);
            }
            if (!category) {
                return next(new Error('category not found: ', req.params.id));
            }

            req.category = category;
            next();
       });

}