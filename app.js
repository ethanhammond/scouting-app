/**
 * Created by Howard on 4/8/2016.
 */

"use strict";

class app {
  constructor() {
    app.loadServer();
    let Datastore = require('nedb');
    app.db = new Datastore({ filename: './data/datastore.json' });
    app.db.loadDatabase(function (err) {
      if (err) {
        console.log(err);
      }
    });
  }

  static loadServer() {
    const HTTP = require('http'),
    PORT = process.env.PORT || 8080,
    SERVER = HTTP.createServer(function (req, res) {
      let httpHandler = function (err, str, contentType) {
        if (err) {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('An error has occurred: ' + err.message);
        } else if (contentType.indexOf('image') >= 0) {
          res.writeHead(200, {'Content-Type': contentType});
          res.end(str, 'binary');
        } else {
          res.writeHead(200, {'Content-Type': contentType});
          res.end(str);
        }
      };

      if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        if (req.method == 'POST') {
          if (req.url.indexOf('/match-data') >= 0) {
            app.addMatchData(req, res);
          }
        } else {
          //console.log("[405] " + req.method + " to " + req.url);
          res.writeHead(405, "Method not supported", {'Content-Type': 'text/html'});
          res.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
        }
      } else if (req.url.indexOf('/data/') >=0) {
        app.render(req.url.slice(1), 'text/csv', httpHandler, 'utf-8');
      } else if (req.url.indexOf('/js/') >= 0) {
        app.render(req.url.slice(1), 'application/ecmascript', httpHandler, 'utf-8');
      } else if (req.url.indexOf('/css/') >= 0) {
        app.render(req.url.slice(1), 'text/css', httpHandler, 'utf-8');
        console.log('rendering ' + req.url.slice(1));
      } else if (req.url.indexOf('/images/') >= 0) {
        let imageTypes = {
          'jpeg' : 'image/jpeg',
          'jpg' : 'image/jpeg',
          'png' : 'image/png'
        }
        app.render(req.url.slice(1), imageTypes[app.getExtension(req.url)], httpHandler, 'binary');
      } else if (req.url == '/') {
        app.render('public/views/index.html', 'text/html', httpHandler, 'utf-8');
      } else if (req.url.indexOf('/fonts/') >= 0) {
        let fontTypes = {
            'svg'   : 'image/svg+xml',
            'ttf'   : 'application/x-font-ttf',
            'otf'   : 'application/x-font-opentype',
            'woff'  : 'application/font-woff',
            'woff2' : 'application/font-woff2',
            'eot'   : 'application/vnd.ms-fontobject',
            'sfnt'  : 'application/font-sfnt'
        }
        app.render(req.url.slice(1), fontTypes[app.getExtension(req.url)], httpHandler, 'binary');
        // console.log(`sending font ${req.url} with extension ${app.getExtension(req.url)} as ${fontTypes[app.getExtension(req.url)]}`)
      } else {
        app.render('public/views/index.html', 'text/html', httpHandler, 'utf-8');
      }
    }).listen(PORT, function () {
      console.log('Such Memes at localhost:' + PORT + ' Wow.');
    });
  }

  static render(path, contentType, callback, encoding) {
    const FS = require('fs');
    FS.readFile(__dirname + '/' + path, encoding ? encoding : 'utf-8', function (err, str) { // ternary
      callback(err, str, contentType);
    });
  }

  static getFormData(req, res) {
    const FileWriter = require('./node/FileWriter');
    let fileWriter = new FileWriter('./data/users.csv');
    let data = '';
    req.on('data', function(chunk) {
      data += chunk;
      //console.log(data);
    }).on('end', function() {
      //console.log(data);
      fileWriter.writeUserData(data);
    });
  }

  static addMatchData(req, res) {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    }).on('error', (err) => {
      console.log(err);
    }).on('end', () => {
      data = data.split("octet-stream").pop();
      data = data.split("\n---").shift();
      console.log(data);
      let jsonData = JSON.parse(data);
      jsonData._id = jsonData["Team Number"] + jsonData["Round Number"];
      app.db.insert(jsonData, (err) => {
        if (err) {
          if (err.errorType = 'uniqueViolated') {
            console.log(`replacing document ${jsonData._id}`);
            app.db.update({_id: jsonData._id}, jsonData, {}, (err) => {
              if (err) {
                console.log(err);
              }
            });
          } else if (err) {
            console.log(err);
          }
        }
      });
    });
  }

  static getExtension(url) {
    return url.split('.').pop();
  }
}

module.exports = app;
