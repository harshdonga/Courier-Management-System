var express = require('express');
var mysql = require('mysql');
var bodyparser = require('body-parser');
const store = require('data-store')({
    path: process.cwd() + '/tempx.json'
});


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

app.post('/post', urlencodedParser ,function(req, res){
    var data = req.body
    console.log(data)
    var status = 0;


    if(data.what === 'login'){
        var email = data.email
        var password = data.password
        mysqlConnection.query('SELECT * FROM customer WHERE cust_email=? and cust_password = ?',[email, password], function(err, results){
            if(!err){
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                store.set('currentuser',json[0].cust_id)
                console.log(store.data);
                mysqlConnection.query("SELECT * FROM package WHERE cust_id = ?",[json[0].cust_id],function(err, result){
                                var string1 = JSON.stringify(result);
                                var json1 = JSON.parse(string1);
                                console.log(json1);
                                res.render('services', {data : json1});
                });
            }
        });
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
                res.render('index');
            } else {
                console.log(err);
            }
        });
        
    }
})

app.get('/services', function(req, res){
    mysqlConnection.query("SELECT * FROM package WHERE cust_id = ?",[store.get('currentuser')], function(err,results){
        if(!err){
            var string = JSON.stringify(results);
            var json = JSON.parse(string);

            res.render('services', {data:json})
        }
        else{
            console.log(err);
        }
    });
    // res.render('services');

});

// app.post('/services', urlencodedParser, function(req, res){
//     var package_origin = req.body.origin;
//     var package_destination = req.body.destination;
//     var package_weight = req.body.weight;
//     console.log(req.body)
//     mysqlConnection.query("INSERT INTO package(cust_id, package_origin, package_destination, package_weight) values(?,?,?,?)", [id,package_origin, package_destination, package_weight],function(err, results){
//         if(!err){
//         console.log(results);
//         res.json({
//             data: results
//         })}
//         else
//         console.log(err)
//     });
// });

app.get('/contact', function(req, res){
    res.render('contact');
});
app.get('/admin', function (req, res) {
    res.render('admin');
});
app.get('/tracking', function (req, res) {
    mysqlConnection.query("SELECT * FROM package WHERE cust_id = ?",[id],function(err, result){
                if (!err) {
                    var string = JSON.stringify(result);
                    var json = JSON.parse(string);
                    console.log(json);

                    res.render("tracking", {
                        data: json
                    });

                } else {
                    console.log(err)
                }
    });
});


app.get('/admin', function(req,res){
    mysqlConnection.query()
});


// app.post('/tracking', urlencodedParser,function(req, res){

//     console.log(req.body)
//     mysqlConnection.query('SELECT * FROM package WHERE package_id=?',[req.body.pid], function(err, result){
//         if(!err){
//             var string = JSON.stringify(result);
//             json = JSON.parse(string);
//             console.log(json);

//             res.render("tracking",{ data: json});
            
//         }
//         else{
//             console.log(err)
//         }
        
// });

// }
// );

app.get('/harsh', function(req, res){
    res.render('harsh')
})

app.listen(8000)