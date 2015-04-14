/**
 * Created by i on 2015/3/22.
 */
var mongoose = require('mongoose');
mongoose.connect("mongodb://123.57.143.189:27017/liujinwei");
//mongoose.connect("mongodb://localhost:27017/blog");
module.exports = mongoose;