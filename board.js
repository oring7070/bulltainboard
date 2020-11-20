const express = require('express');
const session = require('express-session');
const app = express();
const html = require('./js/index.js');
const mysql = require('mysql');
const db = mysql.createConnection({
  host:'localhost',
  user: 'root',
  password: '111111',
  database: 'bulltain',
  dateStrings: 'date'
});
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session)
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

app.use('/css',express.static('css'));
app.use('/js',express.static('js'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false},
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  console.log('serializeUser',user);
  done(null, user.id);
});

passport.deserializeUser(function(user, done) {
  console.log('deserializeUser/user',user);
    done(null, user);
});

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password'
},
  function(username, password, done) {
    db.query('select * from login',(error, data)=>{
      if(username == data[0].id){
        if(password == data[0].password){
           return done(null, data[0]);
        }else{
            return done(null, false, { message: 'Incorrect password.' });
        }
      }else{
         return done(null, false, { message: 'Incorrect username.' });
      }
    })
  }
));

app.get('/', (req, res)=>{
  let css =  `./css/index.css`;
  let topic = `
    <p id="p">hello</p>
    <a href="/login">login</a>
  `;
  let template = html.html(css, topic ,'');
  res.send(template);
});

function view(data){
  if(!data){
    return `
    <div class="login_box">
    <form action="/login" method="post" id="idInput">
    <input type="text" name="id" id="id" autocomplete="off">
    <input type="password" name="password" id="password" autocomplete="off">
    </form>
    <button type="submit" form="idInput">로그인</button>
    </div>
    `;
  }
  return `
  <div class="logout">
    <form action="/logout" method="post">
      <input type="submit" value="로그아웃" id="logout">
    </form>
  <div>
  `;
}

app.get('/login',(req, res)=>{
  let login_topic = view(req.user);
  let script ='./js/login.js'
  let css = `./css/login.css`;
  let topic = `
  <div class="top">
    <h1>게시판</h1>
    <div class="menu">
        <a href="/bulltain_board/1">게시판</a>
        <a href="#2">메뉴1</a>
        <a href="#4">메뉴2</a>
        <a href="#5">메뉴3</a>
    </div>
  </div>
  <div class="center">
  ${login_topic}
  </div>
  `;
  let template = html.html(css, topic, script);
  res.send(template);
})

function checkID(data){
  if(!data){
    return false;
  }
  return true;
}

/*function viewHtml(data, res, css, topic, script){
  if(checkID(data)){
    res.send(html.html(css, topic, script));
  }else{
    res.redirect('/login');
  }
}*/

function numbers(number){
  let result = Math.ceil(number[0].number/10);
  let theNumber = [];
    for(let i = 0; i<result;){
      theNumber[i] = ++i;
    }
  return theNumber;
}

function content(data){
  let datas = ``;
  for(let i=0;i<data.length;i++){
    datas += `<li><p>${data[i].number}</p><p><a href="/bulltain_board_content/${i}">${data[i].title}</a></p><p>${data[i].now}</p><p>${data[i].id}</p><p>${data[i].number2}</p></li>`;
  }
  return datas;
}

function movePage(theNumber){
  let page = ``;
  for(let i = 0;i<theNumber.length; i++){
    page += `<a href="/bulltain_board/${theNumber[i]}">${theNumber[i]}</a>`;
  }
  return page;
}

function pageTheNumber(number){
  if(number == 1){
    return 10;
  }
}

app.get('/bulltain_board/:pageId',(req,res)=>{
  console.log(req.params);
  db.query('select * from bulltain order by now desc',(error,data)=>{
    db.query('select count(*) as number from bulltain',(error,number)=>{
      let check = checkID(req.user);
      let theNumber = numbers(number);
      let script = ``;
      let css = `../css/bulltain.css`;
      let topic = `
        <div class="title">
          <p>번호</p>
          <p>제목</p>
          <p>이름</p>
          <p>조회수</p>
        </div>
        <div class="content">
          <ul>
          ${content(data)}
          </ul>
        </div>
        <div class="number">
          ${movePage(theNumber)}
        </div>
      `;
      res.send(html.html(css, topic, script));
    });
  });
});

app.get('/bulltain_board_content/:pageId',(req, res)=>{
  res.send('success');
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login' }));
app.post('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/login');
});

app.listen(3000);
