/**
 * AUTHOR: begolf123
 * VERSION: 1.0.0
 * CREATED: 05.05.2016
 */

"use strict";

class FileWriter {
    constructor(path) {
        this.path = path;
    }

    writeUserData(userData) {
        let fs = require('fs');
        let self = this;
        fs.readFile(this.path, 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            }

            let result = data.replace(new RegExp('^' + userData.slice(0,4) + '.*'), userData);
            //console.log('card number: ' + userData.slice(0,4));
            //console.log('data: ' + userData);

            fs.writeFile(self.path, result, 'utf8', function(err) {
                if (err) return console.log(err);
            });
        });
    }
}

module.exports = FileWriter;