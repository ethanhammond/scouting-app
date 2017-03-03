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
      console.log(`recieved ${req.method} at ${req.url}`);
      app.httpHandler = httpHandler;

      if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
        if (req.method == 'POST') {
          if (req.url.indexOf('/match-data') >= 0) {
            app.addMatchData(req, res);
          }
        } else if (req.method == 'GET') {
          if (req.url.indexOf('/team-list') >= 0) {
            app.getTeamList();
          } else if (req.url.indexOf('/team-summary/') >= 0) {
            let teamNumber = req.url.split('/').pop();
            app.getTeamSummary(teamNumber);
          } else if (req.url.indexOf('/event-list/') >= 0) {
            let teamNumber = req.url.split('/').pop();
            app.getEventList(teamNumber);
          } else if (req.url.indexOf('/event-summary/') >= 0) {
            let urlTree = req.url.split('/');
            let teamNumber = urlTree.pop();
            let eventCode = urlTree.pop();
            app.getEventSummary(teamNumber, eventCode);
          } else if (req.url.indexOf('/match-list/') >= 0) {
            let urlTree = req.url.split('/');
            let teamNumber = urlTree.pop();
            let eventCode = urlTree.pop();
            app.getMatchList(teamNumber, eventCode);
          } else if (req.url.indexOf('/match-summary/') >= 0) {
            let urlTree = req.url.split('/');
            let roundNumber = urlTree.pop();
            let teamNumber = urlTree.pop();
            let eventCode = urlTree.pop();
            app.getMatchSummary(teamNumber, eventCode, roundNumber);
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

  static getTeamList() {
    let http = require('http');
    let teamListJson = {};
    let html = '';
    app.db.find({}, (err, docs) => {
      let teamNumbers = [];
      for (let i = 0; i < docs.length; i++) {
        let teamNumber = docs[i].team;
        console.log(teamNumber);
        const NOT_FOUND = -1;
        if (teamNumbers.indexOf(teamNumber) == NOT_FOUND) {
          teamNumbers.push(teamNumber);
          html += '<a href="#!" class="collection-item team-listing">' +
            teamNumber +
          '</a>';
        }
      }
      return app.httpHandler('', html, 'text/html');
    });
  }

  static getEventList(teamNumber) {
    let html = '';
    app.db.find({team: teamNumber}, (err, docs) => {
      let events = [];
      for (let i = 0; i < docs.length; i++) {
        let eventCode = docs[i].event;
        console.log(eventCode);
        const NOT_FOUND = -1;
        if (events.indexOf(eventCode) == NOT_FOUND) {
          events.push(eventCode);
          html += '<a href="#!" class="collection-item event-listing">' +
            eventCode +
            '</a>';
        }
      }
      return app.httpHandler('', html, 'text/html');
    });
  }

  static getMatchList(teamNumber, eventCode) {
    let html = '';
    app.db.find({team: teamNumber, event: eventCode}, (err, docs) => {
      let matches = [];
      for (let i = 0; i < docs.length; i++) {
        let roundNumber = docs[i].round;
        console.log(roundNumber);
        console.log("docs: \n" + JSON.stringify(docs));
        const NOT_FOUND = -1;
        if (matches.indexOf(roundNumber) == NOT_FOUND) {
          matches.push(roundNumber);
          html += '<a href="#!" class="collection-item match-listing">' +
            roundNumber +
            '</a>';
        }
      }
      return app.httpHandler('', html, 'text/html');
    });
  }

  static getMatchSummary(teamNumber, eventCode, roundNumber) {
    console.log("team number: " + teamNumber);
    console.log("event code: " + eventCode);
    console.log("round number: " + roundNumber);
    let query = {team: teamNumber, event: eventCode, round: roundNumber};
    console.log("query: " + JSON.stringify(query));
    app.getResults(query);
  }

  static getEventSummary(teamNumber, eventCode) {
    let eventSummary = {};
    console.log("team number: " + teamNumber);
    console.log("event code: " + eventCode);
    let query = {team: teamNumber, event: eventCode};
    console.log("query: " + JSON.stringify(query));
    app.getResults(query);
  }

  static getResults(query) {
    let SummaryCalculations = require('./node/SummaryCalculations');
    app.db.find(query, (err, docs) => {
      console.log("docs: " + JSON.stringify(docs, null, 2));
      let summaryData = {};
      if (err) {
        console.log('err' + err);
        htttpHandler(err, '', 'text/plain');
      } else {
        let fs = require('fs');
        fs.readFile('config/team-summary.json', 'utf-8', (err, data) => {
          let summaryDataPoints = JSON.parse(data);
          let html = '';
          for (let gamemode in summaryDataPoints) {
            summaryData[gamemode] = {};
            html += `<div class="col s12 m6">
              <h1>${gamemode}</h1>
                <ul class="collapsible" data-collapsible="expandable">`;
            if (summaryDataPoints.hasOwnProperty(gamemode)) {
              console.log("game mode: " + gamemode);
              let dataPoints = summaryDataPoints[gamemode];
              for (let dataPoint in dataPoints) {
                if (dataPoints.hasOwnProperty(dataPoint)) {
                  let calculationSpec = dataPoints[dataPoint];
                  calculationSpec.event = dataPoint;
                  // console.log("calculation spec: " + JSON.stringify(calculationSpec, null, 2));
                  let results = {};
                  if (calculationSpec.value != "cycle") {
                      results = SummaryCalculations.getResults(docs, calculationSpec, gamemode);
                      console.log("results: " + JSON.stringify(results, null, 2));
                      summaryData[gamemode][dataPoint] = results;
                      html += `<li>
                        <div class="collapsible-header"><b>${dataPoint}</b></div>
                        <div class="collapsible-body">
                          <ul class="collection">`;

                      for (let calculation in results) {
                        if (results.hasOwnProperty(calculation)) {
                          html += `<li class="collection-item">${calculation}: ${results[calculation]}</li>`;
                        }
                      }
                      html += `</ul></li>`;
                  }
                }
              }
            }
            html += `</ul></div>`;
          }
          // console.log('summary data' + JSON.stringify(summaryData, null, 2));
          // console.log("html\n" + html);
          return app.httpHandler('', html, 'text/html');
        });
      }
    });
  }

  static getTeamSummary(teamNumber) {
    let teamSummary = {};
    console.log("team number: " + teamNumber);
    let query = {team: teamNumber};
    app.getResults(query);
  }

  static addMatchData(req, res) {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    }).on('error', (err) => {
      console.log(err);
    }).on('end', () => {
      data = data.split('Content-Type: application/json').pop();
      data = data.split("octet-stream").pop();
      data = data.split("\n---").shift();
      console.log('wat');
      console.log(data);
      console.log('wut');
      let jsonData = JSON.parse(data);
      jsonData._id = jsonData.event + jsonData.team + jsonData.round;
      app.db.insert(jsonData, (err) => {
        if (err) {
          if (err.errorType == 'uniqueViolated') {
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
    res.end();
  }

  static getExtension(url) {
    return url.split('.').pop();
  }
}

module.exports = app;
