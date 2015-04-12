/**
 * Created by i on 2015/3/29.
 */
var express=require('express');
var router=express.Router();
var Article=require('../module/article');
var settings=require('../settings');
var markdown=require('markdown');
var dateUtil=require('../util/dateUtil');
var async=require('async');


router.get('/tags/:tag',function(req,res,next){
    async.parallel({
        getArticleList:function(callback){
            var tag=req.params.tag;
            Article.getTagArticles(tag,function(err,count,articles){
                if(err){
                    return next(err);
                }
                var totalPage=Math.ceil(count/settings.pagesize);
                articles.forEach(function(articles){
                    articles.content=markdown.parse(articles.content);
                });
                callback(null,{
                    pageNum:1,
                    pageSize:0,
                    totalPage:totalPage,
                    title:tag+'相关文章',
                    count:count,
                    docs:articles,
                    categoryJson:settings.categoryJson
                });

            })
        },
        getTags:function(callback){
            Article.getTags(function(err,tags){
                if(err){return next(err)};
                callback(null,tags);
            })
        }
    },function(err,results){
        //results:{getArticleList:{..},getTags:{}}
        var articleList=results.getArticleList;
        var tags=results.getTags;

        res.render('article/list',{
            title:articleList.title,
            totalPage:articleList.totalPage,
            pageNum:articleList.pageNum,
            pageSize:articleList.pageSize,
            docs:articleList.docs,
            categoryJson:articleList.categoryJson,
            tags:tags
        });
    });

});

router.get('/list/:pageNum?/:pageSize?',function(req,res,next){
    async.parallel({
        getArticleList:function(callback){
            var pageNum=req.params.pageNum&&req.params.pageNum>0?req.params.pageNum:1;
            var pageSize=req.params.pageSize&&req.params.pageSize>0?req.params.pageSize:settings.pagesize;
            var query={};
            //var searchBtn=req.query.searchBtn;
            //if(searchBtn){
            //    req.session.keyword=req.query.keyword;
            //
            //}
            //if(req.session.keyword){
            //    var pattern=new RegExp(req.session.keyword,'i');
            //    query.title=pattern;
            //}
            var keyword=req.query.keyword;
            if(keyword){
                var pattern=new RegExp(keyword,'i');
                query.title=pattern;
            }

            Article.pageQuery(query,{pageNum:pageNum,pageSize:pageSize},function(err,count,docs){
                if(err){
                    return next(err);
                }
                var totalPage=Math.ceil(count/settings.pagesize);
                docs.forEach(function(doc){
                    doc.content=markdown.parse(doc.content);
                });
                if(keyword){
                    callback(null,{
                        temp:'article/search',
                        title:'搜索结果',
                        totalPage:totalPage,
                        pageNum:pageNum,
                        pageSize:pageSize,
                        docs:docs,
                        keyword:keyword,
                        categoryJson:settings.categoryJson

                    });

                }else{
                    callback(null,{
                        temp:'article/list',
                        title:'文章列表',
                        totalPage:totalPage,
                        pageNum:pageNum,
                        pageSize:pageSize,
                        docs:docs,
                        categoryJson:settings.categoryJson
                    });

                }

            })
        },
        getTags:function(callback){
            Article.getTags(function(err,tags){
                if(err){return next(err)};
                callback(null,tags);
            })
        }
    },function(err,results){
        //results:{getArticleList:{..},getTags:{}}
        var articleList=results.getArticleList;
        var tags=results.getTags;
        res.render(articleList.temp,{
            title:articleList.title,
            totalPage:articleList.totalPage,
            pageNum:articleList.pageNum,
            pageSize:articleList.pageSize,
            docs:articleList.docs,
            categoryJson:articleList.categoryJson,
            tags:tags
        });
    });


});
router.get('/category/:category/:pageNum?/:pageSize?',function(req,res,next){
    async.parallel({
        getArticleList:function(callback){
            var category=req.params.category;
            console.log(category);
            var pageNum=req.params.pageNum&&req.params.pageNum>0?req.params.pageNum:1;
            var pageSize=req.params.pageSize&&req.params.pageSize>0?req.params.pageSize:settings.pagesize;
            Article.pageQuery({category:category},{pageNum:pageNum,pageSize:pageSize},function(err,count,docs){
                if(err){
                    return next(err);
                }
                var totalPage=Math.ceil(count/settings.pagesize);
                docs.forEach(function(doc){
                    doc.content=markdown.parse(doc.content);
                });
                callback(null,{
                    navActive:category,
                    title:settings.categoryJson[category]+'_文章列表',
                    totalPage:totalPage,
                    pageNum:pageNum,
                    pageSize:pageSize,
                    docs:docs,
                    categoryJson:settings.categoryJson

                });

            })
        },
        getTags:function(callback){
            Article.getTags(function(err,tags){
                if(err){return next(err)};
                callback(null,tags);
            })
        }
    },function(err,results){
        //results:{getArticleList:{..},getTags:{}}
        var articleList=results.getArticleList;
        var tags=results.getTags;

        res.render('article/category',{
            navActive:articleList.navActive,
            title:articleList.title,
            totalPage:articleList.totalPage,
            pageNum:articleList.pageNum,
            pageSize:articleList.pageSize,
            docs:articleList.docs,
            categoryJson:articleList.categoryJson,
            tags:tags
        });
    });


});
router.get('/view/:articleId',function(req, res, next){
    async.parallel({
        getArticle:function(callback){
            Article.findById(req.params.articleId,function(err,article){
                if(err){
                    return next(err);
                }
                article.content=markdown.parse(article.content);
                callback(null,{
                    navActive:article.category,
                    title:article.title,
                    article:article,
                    categoryJson:settings.categoryJson

                });

            });
        },
        getTags:function(callback){
            Article.getTags(function(err,tags){
                if(err){return next(err)};
                callback(null,tags);
            })
        }
    },function(err,results){
        //results:{getArticleList:{..},getTags:{}}
        var articleDetail=results.getArticle;
        var tags=results.getTags;
        res.render('article/view',{
            navActive:articleDetail.navActive,
            title:articleDetail.title,
            article:articleDetail.article,
            categoryJson:articleDetail.categoryJson,
            tags:tags
        });
    });

});
router.get('/edit/:articleId',function(req,res,next){
    Article.findById(req.params.articleId,function(err,article){
        if(err){
            return next(err);
        }
        res.render('article/add',{
            title:'修改文章',
            cmd:'edit',
            article:article
        })
    })

});
router.post('/edit',function(req,res,next){
    var newArticle=new Article({
        category:req.body.category,
        content:req.body.content,
        title:req.body.title,
        updateTime:dateUtil.getTime()
    });
    newArticle.update(req.body._id,function(err,article){
        if(err){
            req.flash('err',err);
            return res.redirect('back');
        }
        req.flash('success',"更新成功");
        res.redirect('/article/view/'+req.body._id);
    })

});
router.get('/add', function(req, res, next) {

    res.render('article/add', {
        title: '发表文章',
        cmd:'add',
        article:{},
        navActive:'add'
    });
});
router.post('/add', function(req, res, next) {
    var user=req.session.user;
    var title=req.body.title;
    var content=req.body.content;
    var category=req.body.category;
    var tags=req.body.tags.replace(/，/g,',').split(',');
    var article=new Article({
        category:category,
        userId:user._id,
        title:title,
        content:content,
        tags:tags
    });
    article.save(function(err,article){
        if(err){
            req.flash('error','发表失败');
            return res.redirect('back');
        }
        res.redirect('/');
    });
});
router.get('/delete/:articleId',function(req,res,next){
    Article.deleteById(req.params.articleId,function(err){
        if(err){
            next(err);
            return res.redirect('back');
        }
        req.flash('success','删除文章成功');
        res.redirect('/');
    });
})
module.exports=router;