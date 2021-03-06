﻿var express = require('express');
var router = express.Router();

var appdata = {
  menu: [
    {
      title: 'about', 
      thumbnail: '/images/menu_thumbs/about_thumb.png',
      link: '/'
    }, 
    {
      title: 'image live-coder', 
      thumbnail: '/images/menu_thumbs/image_code_thumb.png',
      link: '/imagecode'
    }, 
    {
      title: 'minecraft raytracer', 
      thumbnail: '/images/menu_thumbs/minecraft_raytracer_thumb.png',
      link: '/minecraft'
    },
    {
      title: 'cloud world',
      thumbnail: '/images/menu_thumbs/cloudworld.png',
      link: '/cloudworld'
    }]
}

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { appdata: appdata });
});


router.get('/minecraft', function (req, res) {
  res.render('minecraft_raytracer', { appdata: appdata });
});

router.get('/imagecode', function (req, res) {
  res.render('imagecode', { appdata: appdata });
});

router.get('/cloudworld', function (req, res) {
  res.render('cloudworld', { appdata: appdata });
});

module.exports = { router: router, appdata: appdata };