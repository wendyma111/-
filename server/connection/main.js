const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/my_database', {useNewUrlParser: true,useUnifiedTopology:true})
mongoose.connection.on("error", function (error) {  
    console.log("数据库连接失败：" + error); 
}); 

mongoose.connection.on("open", function () {  
    console.log("数据库连接成功"); 
});

const schema = new mongoose.Schema({
    username: '',
    socketId: '',
    unreadMsg: [],
    accountNum: '',
    password: '',
    contact: []
})
let users = mongoose.model('users',schema)
module.exports = {
    users
} 
