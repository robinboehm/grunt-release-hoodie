module.exports = function(grunt) {
  'use strict';

  var exec = require('child_process').exec;
  var GitHubApi = require('github');

  var github = new GitHubApi({
    version: '3.0.0',
    debug: true
  });

  grunt.registerTask('ghrelease', 'Creates a Github release.', function() {
    var done = this.async();
    var queue = [];

    var next = function() {
      if (!queue.length) {
        return done();
      }

      queue.shift()();
    };

    var run = function(behavior) {
      queue.push(behavior);
    };

    var changes;
    var slug = (process.env.TRAVIS_REPO_SLUG || '').split('/');
    var owner = slug[0];
    var repo = slug[1];
    var tag = process.env.TRAVIS_TAG;
    var token = process.env.GH_TOKEN;

    if (!tag) {
      grunt.log.warn('Skipping github release creation because this is not a tagged commit.');
      return done();
    }

    run(function() {
      // extract latest addition to changelog from git diff
      exec('git diff -U0 --no-color HEAD^ CHANGELOG.md', function(err, stdout) {
        if (err) {
          grunt.fail.fatal(err);
        }
        changes = stdout.split('\n');
        changes.splice(0, 5);
        changes = changes.join('\n').replace(/^\+/gm, '');
        grunt.log.write(changes);
        next();
      });
    });

    run(function() {
      github.authenticate({
        type: 'oauth',
        token: token
      });
      github.releases.createRelease({
        owner: owner,
        repo: repo,
        tag_name: tag,
        body: changes
      }, function(err) {
        if (err) {
          grunt.fail.fatal(err);
        }
        grunt.log.ok('Release published');
        next();
      });
    });

    next();
  });
};