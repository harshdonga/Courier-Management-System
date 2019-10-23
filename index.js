var express = require('express');
var mysql = require('mysql');
var bodyparser = require('body-parser');
const store = require('data-store')({
    path: process.cwd() + '/tempx.json'
});
var request = require('request');
var fs = require('fs');
let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");


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

    if(data.what ==='login' && data.email==='admin@admin.com' && data.password==='admin'){
        res.redirect('/admin');
    }


    if(data.what === 'login'){
        var email = data.email
        var password = data.password
        mysqlConnection.query('SELECT * FROM customer WHERE cust_email=? and cust_password = ?',[email, password], function(err, results){
            if(!err){
                var string = JSON.stringify(results);
                var json = JSON.parse(string);
                store.set('currentid',json[0].cust_id);
                store.set('currentuser', json[0].cust_name);
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
    var currentid = store.get('currentid');
    var currentuser = store.get('currentuser');
    mysqlConnection.query("SELECT * FROM package WHERE cust_id = ?",[currentid], function(err,results){
        if(!err){
            var string = JSON.stringify(results);
            var json = JSON.parse(string);

            res.render('services', {data:json, currentuser:currentuser})
        }
        else{
            console.log(err);
        }
    });
    // res.render('services');

});

app.post('/services', urlencodedParser, function(req, res){
    var package_origin = req.body.origin;
    var package_destination = req.body.destination;
    var package_weight = req.body.weight;
    var currentid = store.get('currentid');
    var currentuser = store.get('currentuser');
    console.log(req.body)
    mysqlConnection.query("INSERT INTO package(cust_id, package_origin, package_destination, package_weight) values(?,?,?,?)", [currentid,package_origin, package_destination, package_weight],function(err, results){
        if(!err){
        console.log(results);
        res.json({
            data: results
        })}
        else
        console.log(err)
    });
});

app.get('/contact', function(req, res){
    res.render('contact');
});

app.get('/tracking', function (req, res) {
    var currentid = store.get('currentid');
    var currentuser = store.get('currentuser');
    mysqlConnection.query("SELECT * FROM package WHERE cust_id = ?",[currentid],function(err, result){
                if (!err) {
                    var string = JSON.stringify(result);
                    var json = JSON.parse(string);
                    mysqlConnection.query("SELECT * FROM payment",function(err, rest){
                        if(!err){
                            var string1 = JSON.stringify(rest);
                            var json1 = JSON.parse(string1);
                            console.log(json1);
                        }
                        else{
                            console.log(err);
                        }
                        return res.render("tracking", {
                            data: json,
                            currentid: currentid,
                            currentuser: currentuser,
                            data1:json1
                    });
                    });

                } else {
                    console.log(err)
                }
    });
});


app.get('/admin', function(req,res){
    mysqlConnection.query('SELECT * FROM package', function(err, result){
        if(!err){
            var string = JSON.stringify(result);
            var json = JSON.parse(string);
            return res.render("admin", {data: json});
        }
        else{
            console.log(err);
        }
    });
});

app.post('/verify', urlencodedParser, function(req, res){
    var r = [100, 150, 175, 200, 250, 300, 325, 350, 450];
    var ra = r[Math.floor(Math.random() * r.length)];
    var selected = req.body;
    var keys = Object.keys(selected);
    for(var i=0; i<keys.length; i++){
        mysqlConnection.query('UPDATE package SET is_verified= ? WHERE package_id=?',[1, keys[i]],function(err, result){
            if(err)
            console.log(err);
        });
        mysqlConnection.query('INSERT INTO payment values(?,?,?)', [keys[i], keys[i], ra], function(err, results){
            if(!err)
            console.log(results);
            else
            console.log(err);
        })
    }res.render('index');
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

app.post('/payment', urlencodedParser,function(req, res){
    var currentid = store.get('currentid');
    var currentuser = store.get('currentuser');
    var r = [0,1,2,3,4,5,6,7,8,9];
    var ra = r[Math.floor(Math.random() * r.length)];
    var selected = req.body;
    var keys = Object.keys(selected);
    var values = Object.values(selected);
    var total = 0;
    for (var i = 0; i < keys.length; i++) {
        total = total + parseInt(values[i]);
        mysqlConnection.query("UPDATE package SET is_paid= ? WHERE package_id= ?", [1, keys[i]], function(err, rest){
            if(err)
            console.log(err);
            mysqlConnection.query("SELECT * FROM offers WHERE offer_id = ?",[ra], function(err, result){
                if(err)
                console.log(err)
                var string = JSON.stringify(result);
                var json = JSON.parse(string);                
            });
        });
    }
            var data1 = {
                currentid: currentid,
                currentuser: currentuser,
                billid: ra,
                total: total
            };
    // ejs.render(path.join(__dirname, './views','payment.ejs'), {data1:data1}, (err, data)=>
    // {
    //     if(err)
    //     res.send(err);
    //     else{
    //     let options = {
    //             "height": "11.25in",
    //             "width": "8.5in",
    //             "header": {
    //                 "height": "20mm"
    //             },
    //             "footer": {
    //                 "height": "20mm",
    //             },
    //     };
    //     pdf.create(data, options).toFile("report.pdf", function (err, data) {
    //         if (err) {
    //             res.send(err);
    //         } else {
    //             res.send("File created successfully");
    //         }
    //     });
    //     }


    // });
    res.render('payment' , {data1:data1});
});

app.listen(8000)


// res.render('payment', {
//     data: json,
//     total: total,
//     currentuser: currentuser,
//     currentid: currentid,
// })