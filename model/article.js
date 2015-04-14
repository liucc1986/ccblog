var mongoose=require('../db');
var markdown=require('markdown');
var Schema=mongoose.Schema;
var ObjectId=Schema.ObjectId;
var dateUtil=require('../util/dateUtil');
var articeslSchema = new mongoose.Schema({
    userId:{type:ObjectId,ref:"User"},
    createTime:Object,
    category:String,
    title:String,
    content:String,
    updateTime:Object,
    pv:Number,
    tags:[String]

});
var articleModel = mongoose.model('Article',articeslSchema);
function Article(article){
    this.userId=article.userId;
    this.category=article.category;
    this.title=article.title;
    this.content=article.content;
    this.tags=article.tags;

}
module.exports=Article;
Article.getTags=function(callback){
    articleModel.distinct('tags',function(err,tags){
        if(err){
            return callback(err);
        }
        callback(null,tags);
    });

};

Article.getTagArticles=function(tag,callback){
    var query={tags:tag};
    articleModel.count(query,function(err,count){
        articleModel.find(query).sort({"_id":-1}).populate('userId').exec(function(err,articles){
            if(err){
              return  callback(err);
            }
            callback(null,count,articles);

        })
    });
};


Article.findById=function(id,callback){
    articleModel.findById(id).populate('userId').exec(function(err,doc){
        if(err){
            return callback(err);
        }
        articleModel.update({_id:id},{$inc:{"pv":1}},function(err){
            callback(err,doc);
        })

    });
};


Article.pageQuery=function(query,pageInfo,callback){
    articleModel.count(query,function(err,count){
        if(err){
            return console.log(err);
        }
        console.log('文章条数：',count);
        var queryCursor=articleModel.find(query).sort({'_id':-1});
        if(pageInfo && pageInfo.pageNum){
            queryCursor.skip((pageInfo.pageNum-1)*pageInfo.pageSize).limit(pageInfo.pageSize);
        }
        queryCursor.populate('userId').exec(function (err,docs) {
            if(err){return callback(err)}

            callback(err,count,docs);
        })
    })
}
Article.prototype.update=function(_id,callback){
    articleModel.update({_id:_id},{$set:{category:this.category,content:this.content,title:this.title,updateTime:this.updateTime}},function(err,article){
        if(err){
            return callback(err);
        }
        callback(null,article);
    })
};
Article.prototype.save=function(callback){
    var time =dateUtil.getTime();
    console.log(this.tags);
    var newArticle=new articleModel({
        userId:this.userId,
        createTime:time,
        category:this.category,
        title:this.title,
        content:this.content,
        tags:this.tags,
        pv:1
    });
    newArticle.save(function(err,article){
        console.log(err+article);
        if(err){
            callback(err);
        }else{
            callback(null,article);
        }


    });
};
Article.deleteById= function (_id,callback) {
    articleModel.remove({_id:_id},function(err){
        callback(err);
    })
}
