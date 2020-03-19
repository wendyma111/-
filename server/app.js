const koa = require('koa')
const fs = require('fs')
const Koa_Session = require('koa-session');   // 导入koa-session     
const router = require('koa-router')()
const bodyParser = require('koa-bodyparser');
const static_ = require('koa-static')
const path = require('path')
const app = new koa()
const {users} = require('./connection/main.js')
const server = require('http').createServer(app.callback()).listen(8080)
const io = require('socket.io').listen(server)

const session_signed_key = ["some secret hurr"];  // 这个是配合signed属性的签名key
const session_config = {
    key: 'koa:sess', /**  cookie的key。 (默认是 koa:sess) */
    maxAge: 24*60*60*1000,   /**  session 过期时间，以毫秒ms为单位计算 。*/
    autoCommit: true, /** 自动提交到响应头。(默认是 true) */
    overwrite: true, /** 是否允许重写 。(默认是 true) */
    httpOnly: true, /** 是否设置HttpOnly，如果在Cookie中设置了"HttpOnly"属性，那么通过程序(JS脚本、Applet等)将无法读取到Cookie信息，这样能有效的防止XSS攻击。  (默认 true) */
    signed: true, /** 是否签名。(默认是 true) */
    rolling: false, /** 是否每次响应时刷新Session的有效期。(默认是 false) */
    renew: false, /** 是否在Session快过期时刷新Session的有效期。(默认是 false) */
};

const session = Koa_Session(session_config, app)
app.keys = session_signed_key;

// 使用中间件，注意有先后顺序
app.use(session);

app.use(bodyParser());

app.use(router.routes())

app.use(static_(path.join(__dirname, '../client/build')))

io.on('connection', function(socket){
    socket.on('login', function(user){
        let me
        users.findOneAndUpdate({accountNum:user.accountNum},{socketId:socket.conn.id},function(err,res){
            console.log(socket.conn.id)
            me=res
        })

        socket.on('logout',function(user){
            users.findOneAndUpdate({accountNum:user.accountNum},{socketId:''})
        })

        socket.on('chatConnect',async function(user){
            console.log(typeof user.toAccountNum)
            let {socketId} = await users.findOne({accountNum:user.toAccountNum})
            console.log(socketId)

            socket.on('msg', function(data){
                //data的数据结构为{referrer:accountNum,msg}
            const {referrer,msg} = data
             if(socketId !== ''){
                 socket.broadcast.to(socketId).emit('msg',{msg,referrer})
             }else{
                 users[index].unreadMsg.push({
                     referrer,
                     msg
                 })
             }
            })
        })      
    })
})
// 对前端路由BroswerRouter进行处理
app.use(ctx=>{
    if(ctx.request.url!=='/'){
        if(!ctx.session.logged){ //未登录或登录失败
            console.log(ctx.session.logged)
            ctx.session.logged = false;
            ctx.redirect('/')
        } else {
            ctx.type = 'text/html; charset=utf-8';
            ctx.body=fs.createReadStream('../client/build/index.html')
        }
    }
})

router.get('/',async (ctx) => {
    const login_user = ctx.query
    if(JSON.stringify(login_user) !== '{}'){
        const result = await users.findOne({accountNum:login_user.accountNum})
        if(result !== null){
            if(login_user.password===result.password){
                ctx.body = result
                ctx.session.logged = true;
            }else{
                ctx.body = '密码错误'
            }
        }else{
            ctx.body='该用户不存在'
        }
       
    }else{
        ctx.type = 'text/html; charset=utf-8';
        ctx.body=fs.createReadStream('../client/build/index.html')
    }
})

