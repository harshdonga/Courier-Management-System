var express = require('express');
var mysql = require('mysql');
var bodyparser = require('body-parser');


var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '13091994',
    database: 'CourierDB',
    multipleStatements: true
});
var app = express();
var urlencodedParser = bodyparser.urlencoded({ extended: false });


mysqlConnection.connect((err)=>{
    if(!err)
    console.log('DB connection established');
    else
    console.log('ERRROR in connection:' + JSON.stringify(err, undefined, 2));
});


app.set('view engine', 'ejs');
app.use(bodyparser.json());
app.use('/assets', express.static('assets'));



app.get('/', function(req, res){
    var status = 0;
    res.render('index', {status:status})
})

app.post('/', urlencodedParser ,function(req, res){
    var data = req.body
    console.log(data)
    var status = 0;


    if(data.what === 'login'){
        var email = data.email
        var password = data.password
        mysqlConnection.query('SELECT * FROM customer WHERE cust_email=? and cust_password = ?',[email, password], function(err){
            if(err) throw err
        });
        // res.redirect('services') //checkthisout
    }
    else if(data.what === 'signup')
    {
        var name = data.fname + data.lname
        var email = data.email
        var password = data.password
        var mobile = data.mobile
        var address = data.address
        mysqlConnection.query('INSERT INTO customer(cust_password, cust_name,cust_mobile, cust_address,cust_email) values(?,?,?,?,?)',[password, name, mobile, address, email], function(err){
            if (err) {
                status = 0;
                res.render('index', {status: status})
            } else {
                status = 3;
                res.render('index', {status: status})
            }
        });
        
    }
})

app.get('/services', function(req, res){
    res.render('services')
})

app.listen(8000);