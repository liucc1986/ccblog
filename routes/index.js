var express = require('express');
var router = express.Router();
var Article=require('../module/article');
var settings=require('../settings');
var markdown=require('markdown');
var async=require('async');
/* GET home page. */
router.get('/',function(req,res,next){
    async.parallel({
        getArticleList:function(callback){
            Article.pageQuery({},{pageNum:1,pageSize:settings.pagesize},function(err,count,docs){
                if(err){
                    return next(err);
                }
                var totalPage=Math.ceil(count/settings.pagesize);
                docs.forEach(function(doc){
                    doc.content=markdown.parse(doc.content);
                });
                callback(null,{
                    title:'首页',
                    totalPage:totalPage,
                    pageNum:1,
                    pageSize:settings.pagesize,
                    docs:docs,
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
        var articleList=results.getArticleList;
        var tags=results.getTags;
        res.render('index',{
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

module.exports = router;
