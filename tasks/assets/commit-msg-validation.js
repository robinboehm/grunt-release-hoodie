#!/usr/bin/env node

// SPONSOR MESSAGE START
(function() {
  var fs = require('fs');
  var path = require('path');

  var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
  var message = path.join(home, '.hoodie-sponsor/sponsor-message.txt');

  if (!fs.existsSync(message)) {
    return;
  }

  var messageBody = fs.readFileSync(message)+'';

  if ((fs.readFileSync(process.argv[2])+'').indexOf(messageBody) !== -1) {
    return;
  }

  fs.appendFileSync(process.argv[2], messageBody);
}).call(this);
// SPONSOR MESSAGE END

/**
 * @license AngularJS v1.3.0-build.2909+sha.2e84cf9
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * Git COMMIT-MSG hook for validating commit message
 * See https://docs.google.com/document/d/1rk04jEuGfk9kYzfqCuOlPTSJw3hEDZJTBN5E5f1SALo/edit
 * https://github.com/angular/angular.js/blob/master/validate-commit-msg.js
 */

(function() {
  'use strict';

  var fs = require('fs');
  var util = require('util');

  var MAX_LENGTH = 100;
  var PATTERN = /^(?:fixup!\s*)?(\w*)(\(([\w\$\.\*/-]*)\))?\: (.*)$/;
  var IGNORED = /^WIP\:/;
  var TYPES = {
    feat: true,
    fix: true,
    docs: true,
    style: true,
    refactor: true,
    perf: true,
    test: true,
    chore: true,
    revert: true
  };

  var error = function() {
    // gitx does not display it
    // http://gitx.lighthouseapp.com/projects/17830/tickets/294-feature-display-hook-error-message-when-hook-fails
    // https://groups.google.com/group/gitx/browse_thread/thread/a03bcab60844b812
    console.error('INVALID COMMIT MSG: ' + util.format.apply(null, arguments));
  };

  var validateMessage = function(message) {
    var isValid = true;

    if (IGNORED.test(message)) {
      console.log('Commit message validation ignored.');
      return true;
    }

    if (message.length > MAX_LENGTH) {
      error('is longer than %d characters !', MAX_LENGTH);
      isValid = false;
    }

    var match = PATTERN.exec(message);

    if (!match) {
      error('does not match "<type>(<scope>): <subject>" ! was: ' + message);
      return false;
    }

    var type = match[1];
    var scope = match[3];
    var subject = match[4];

    if (!TYPES.hasOwnProperty(type)) {
      error('"%s" is not allowed type !', type);
      return false;
    }

    // Some more ideas, do want anything like this ?
    // - allow only specific scopes (eg. fix(docs) should not be allowed ?
    // - auto correct the type to lower case ?
    // - auto correct first letter of the subject to lower case ?
    // - auto add empty line after subject ?
    // - auto remove empty () ?
    // - auto correct typos in type ?
    // - store incorrect messages, so that we can learn

    return isValid;
  };


  var firstLineFromBuffer = function(buffer) {
    return buffer.toString().split('\n').shift();
  };

  var commitMsgFile = process.argv[2];
  var incorrectLogFile = commitMsgFile.replace('COMMIT_EDITMSG', 'logs/incorrect-commit-msgs');

  fs.readFile(commitMsgFile, function(err, buffer) {
    var msg = firstLineFromBuffer(buffer);

    if (!validateMessage(msg)) {
      fs.appendFile(incorrectLogFile, msg + '\n', function() {
        process.exit(1);
      });
    } else {
      process.exit(0);
    }
  });
}).call(this);
