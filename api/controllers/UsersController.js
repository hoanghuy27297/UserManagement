/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const config = require('../../config/config');

module.exports = {
  list: function(req, res) {
    Users.find().exec((err, users) => {
      if (err) {
        res.send(500, { error: 'Database Error' });
      }
      res.view('list', { users });
    });
  },
  add: function(req, res) {
    res.view('add');
  },
  create: function(req, res) {
    const salt = bcrypt.genSaltSync(8);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    Users.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).exec(err => {
      if (err) {
        res.send(500, { error: 'Database error' });
      }
      res.redirect('list');
    });
  },
  delete: function(req, res) {
    Users.destroy({ id: req.params.id }).exec(err => {
      if (err) {
        res.status(500).send('Database error');
      }

      res.redirect('/users/list');
    });
  },
  edit: function(req, res) {
    Users.findOne({ id: req.params.id }).exec((err, user) => {
      if (err) {
        res.status(500).send('Database error');
      }

      res.view('edit', { user });
    });
  },
  update: function(req, res) {
    Users.update(
      { id: req.params.id },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        createdAt: req.body.createdAt,
        updatedAt: new Date(),
      },
    ).exec(err => {
      if (err) {
        res.status(500).send('Database error');
      }

      res.redirect('/users/list');
    });
  },
  login: function(req, res) {
    Users.findOne({ email: req.body.email }).exec((err, user) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error on the server.');
      }
      if (!user) {
        return res.status(404).send('User not found.');
      }
      console.log(user);

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password,
      );
      if (!passwordIsValid) {
        return res.status(404).send({ auth: false, token: null });
      }

      const token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400,
      });

      req.session.authenticated = true;
      req.session.User = user;
      req.session.token = token;
      res.redirect('/homepage');
      //   res.status(200).send({ auth: true, token: token });
    });
  },
  logout: (req, res) => {
    req.session.destroy();
    res.redirect('/');
  },
  signUp: (req, res) => {
    res.view('signUp');
  },
  signUpAccount: (req, res) => {
    const salt = bcrypt.genSaltSync(8);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    Users.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).exec(err => {
      console.log('ERROR ', err);
      if (err) {
        return res.view('signUp');
      }
      res.redirect('..');
    });
  },
};
