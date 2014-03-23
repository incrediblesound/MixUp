
/*
 * GET home page.
 */
var library = require('./library.js').library;
var request = require('request');
var qs = require('querystring');

exports.index = function(req, res){
  res.render('index', {
    user: req.user,
    text: req.session.changed
  });
};

exports.create = function(req, res){
  var texT = req.body.text;
  var words = texT.split(' ');
  var count = 0;
  forEach(words, function(word) {
    var test = inLib(noPunc(word));
    if(test) {
      var rex = new RegExp('\\b'+library[test.set][test.side][test.word]+'\\b','g');
      var New = findAnt(test);
      texT = texT.replace(rex, New);
    }
    count += 1;
  });
    texT = phrases(texT);
    req.session.changed = texT;
    res.redirect('/home');
};

exports.postit = function(req, res) {
var token = req.session.accToken;
var body = req.session.changed;
var url = 'https://graph.facebook.com/me/feed';
var params = qs.stringify({
  message: body,
  access_token: token,
});
request.post({
  headers: {'content-type' : 'application/x-www-form-urlencoded'},
  url: url, 
  body: params
  }, function(err, response, Body){
  if (err) {
  return console.error("Error occured: ", err);
  };
  Body = JSON.parse(Body);
  if (Body.error) {
  return console.error("Error returned from facebook: ", Body.error);
  }
  res.redirect('/home');
})
};

exports.login = function(req, res) {
  res.render('login');
};

exports.information = function(req, res) {
  res.render('info');
}

var forEach = function(array, fn) {
  for(var i=0;i<array.length;i++) {
    fn(array[i]);
  }
};

var inLib = function(word) {
  for(var i = 0; i < library.length; i++) {
    for(var k = 0; k < library[i].left.length; k++) {
      if(library[i].left[k] === word) {
        return ({set: i, side: 'left', word: k});
      }
    }
    for(var s = 0; s < library[i].right.length; s++) {
      if(library[i].right[s] === word) {
        return ({set: i, side: 'right', word: s})
      }
    }
  }
  return false;
};

var noPunc = function(word) {
  var x = word.length-1;
  if (word[x] === '.' || word[x] === '!' || word[x] === '?' || word[x] === ',') {
    return word.slice(0,x);
  }
  return word;
};

var findAnt = function(info) {
  var side;
  if(info.side === 'left') {
    side = 'right';
  } else {
    side = 'left';
  };
  var num = library[info.set][side].length;
  var rndm = Math.floor(Math.random()*num);
  return library[info.set][side][rndm];
};

var phrases = function (text) {
  for(i=0;i<phraseBank.length;i++) {
    var x = new RegExp(phraseBank[i].a)
    if(x.test(text)) {
      text = text.replace(phraseBank[i].a, phraseBank[i].b)
    }
  }
  return text
};

var phraseBank = [
{a:'I hope we can',b:'I hope we never'},{a:'It\'s been',b:'It hasn\'t been'},
{a:'was fun',b:'was painful'},{a:'I hope you',b:'I\'m sick just thinking that you'},{a:'a few',b:'tons of'}
]