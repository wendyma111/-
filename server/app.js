const koa = require('koa')
const fs = require('fs')
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser');
const static_ = require('koa-static')
const path = require('path')
const app = new koa()
//const server = app.listen(8080)
const server = require('http').createServer(app.callback()).listen(8080)
const io = require('socket.io').listen(server)

app.use(bodyParser());

let users = [{
    username: '小李',
    socketId: null, 
    unreadMsg: [],
    accountNum: '12345',
    password: '111',
    contact: [{
        username: '小王',
        accountNum: '23456'
    },{
        username: '小张',
        accountNum: '34567'
    }]
},{
    username: '小王',
    socketId: null,
    unreadMsg: [],
    accountNum: '23456',
    password: '222',
    contact: [{
        username: '小李',
        accountNum: '12345'
    },{
        username: '小张',
        accountNum: '34567'
    }]
},{
    username: '小张',
    socketId: null,
    unreadMsg: [],
    accountNum: '34567',
    password: '333',
    contact: [{
        username: '小李',
        accountNum: '12345'
    },{
        username: '小王',
        accountNum: '23456'
    }]
}]


app.use(router.routes())

app.use(static_(path.join(__dirname, '../client/build')))

io.on('connection', function(socket){
    console.log('有用户加入啦')
    socket.on('login', function(user){

        const login_userIndex = users.findIndex(item => item.accountNum === user.accountNum)
        socket.emit('render', users[login_userIndex].contact)
        users.splice(login_userIndex, 1, {...users[login_userIndex], socketId:socket.conn.id})

        socket.on('chat', function(data){
           const index = users.findIndex(item=>item.accountNum===data)
           const {socketId} = users[index]

           socket.on('msg', function(msg){
            socket.emit('msg', {msg})
            if(socketId !== null){
                socket.broadcast.to(socketId).emit('msg',{msg,referrer:users[login_userIndex].accountNum})
            }else{

                users[index].unreadMsg.push({
                    referrer:users[login_userIndex].accountNum,
                    msg
                })
            }
           })
        })
       
    })
})

router.get('/',async (ctx) => {
    const login_user = ctx.query
    if(JSON.stringify(login_user) !== '{}'){
        const result = users.find(item => item.accountNum===login_user.accountNum)
        if(result !== undefined){
            if(result.password===login_user.password) {
                ctx.body=`/main?accountNum=${login_user.accountNum}`
            }else {
                ctx.body='密码错误'
            }
        }else{
            ctx.body = '该用户不存在'
        }
    }else{
        ctx.type = 'text/html; charset=utf-8';
        ctx.body=fs.createReadStream('../client/build/index.html')
    }
})

router.get('/main', ctx => {
    ctx.type = 'text/html; charset=utf-8';
    ctx.body=fs.createReadStream('../client/build/index.html')
})



