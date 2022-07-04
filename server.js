const express = require('express')
const app = express()
const port = 3000
const path = require("path");
const { where } = require('sequelize');

const { user_game, user_game_biodata} = require('./models')

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  res.render('games');
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/add', (req, res) => {
  res.render('add')
})

app.post('/login', (req, res) => {
  const { username, password} = req.body;

  user_game.findOne({
    where: {
      username,
      password
    }
  }).then(data => {

      if (data != null && data.isSuperAdmin == 1) {
        res.redirect('/dashboard')
      } else {
        res.redirect('/login')
      }
  })
})

app.get('/dashboard', (req, res) => {

  user_game.findAll({
    include: user_game_biodata
  }).then(users => {
     res.render('dashboard', {users})
    })
})

app.post('/user', (req, res) => {
    const { username, password, first_name, last_name, birthplace } = req.body
   
    user_game.create({
      username,
      password,
      isSuperAdmin: false

    }).then(user_game => {
    
    user_game_biodata.create({
      id_user: user_game.id,
      first_name,
      last_name,
      birthplace

    }).then(response => {
       res.redirect('/dashboard')
      })
    })
  })

app.get('/user/:id/delete', (req, res) => {
    const { id } = req.params

    user_game.destroy({
      where: {id}

    }).then(response => {
       res.redirect('/dashboard')
    })
})

app.get('/user/:id/edit', (req, res)=> {
    const {id} = req.params

    user_game.findOne({
      where: {id},
      include: user_game_biodata

    }).then(user => {
       res.render('edit', {user})
    })
})


  app.post('/user/:id/update', (req, res)=> {
    const {id} = req.params
   
    const {username, password, first_name, last_name, birthplace} = req.body

    user_game.update({
      username, password

    }, {where: {id}}) 

      .then(response =>{
        user_game_biodata.update({first_name, last_name, birthplace}, 
        {where : {id_user: id}})

    }).then(response =>{
       res.redirect('/dashboard')
    })
  })

  //testing
  // user_game.create({
  //       id: 1,
  //       username: 'retno',
  //       password: '12345'
  // }).then(response => {
  //       console.log(response)
  // })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})