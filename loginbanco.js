const express = require('express');
const app = express();
const mysql2 = require('mysql2');
const path = require('path');

app.use(express.static('public')); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
const connection = mysql2.createConnection({
  user: 'root',
  password: 'Glsarah25!',
  database: 'pi_bbd'
});

