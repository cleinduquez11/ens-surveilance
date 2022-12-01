var express = require("express");
var router = express.Router();

const  credential = {
    email : "admin.local",
    password : "admin123",
    email1: "raspberrypi.local",
}

// login user
router.get('/login', (req, res)=>{
//     console.log(req.query.email);
//    console.log(req.query.password);
//    console.log(req.session);
    
    if(req.query.email == credential.email && req.query.password == credential.password){
        req.session.user = req.query.email;
        res.redirect('/route/dashboard');
        //res.end("Login Successful...!");
    }else if(req.query.email == credential.email1 && req.query.password == credential.password){
        req.session.user = req.query.email;
        res.redirect('/route/broadcast');
        //res.end("Login Successful...!");
    }
    else{
        res.redirect('/route/error')
    }
});



// route for dashboard
router.get('/dashboard', (req, res) => {
    if(req.session.user){
        res.render('dashboard',{title: "ENS Dashboard"})
    }else{
        res.redirect('/route/error')
    }
})


router.get('/jigweidjn12jvnr19dimj21ev1hnvr12dmj102jv1090m9sj1092jv102j01754342Vb1JBjn2IHjnfjfgsjbgljsfbgiebfnjkablfdjabflijdbfaijfijfbhadfbahdsufbkhdvfhdvfvuerbfewubf1ib2iwbdiu1eh241iuwbdjbdqw',(req,res) => {

res.render('dashboard')
})

router.get('/error', (req, res) => {
    res.render('error',{title: "Error Prompt"})
})



router.get('/broadcast', (req, res) => {

    if(req.session.user){
        res.render('broadcast',{title: "ENS Live Broadcast"})
    }else{
        res.redirect('/route/error')
    }
})


router.get('/functions', (req, res) => {

    if(req.session.user){
        res.render('fun',{title: "ENS Functions"})
    }else{
        res.redirect('/route/error')
    }

})







// route for logout
router.get('/logout', (req ,res)=>{
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send("Error")
        }else{
            res.render('base', { title: "Express", logout : "logout Successfully...!"})
        }
    })
})

module.exports = router;
