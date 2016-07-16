//////////////////////////////////////////////////////////////////////
// include dependencies

var dbQueries     = require('../lib/dbQueries');
var jade          = require('jade');
var async         = require('async');
var nodemailer    = require('nodemailer');

var smtpTransport = nodemailer.createTransport('SMTP',
{
    service: process.env.AOTD_EMAIL_SERVICE,
    auth:
    {
        user: process.env.AOTD_EMAIL_ADDRESS,
        pass: process.env.AOTD_EMAIL_PASSWORD // Must be a Gmail app-specific password!!
    }
});

//////////////////////////////////////////////////////////////////////

// @finalCallback = function(err)
exports.sendAlbumsToAllUsers = function(db, dtStart, dtEnd, finalCallback)
{
    async.parallel(
    {
        users:  function(callback) { dbQueries.queryUsers(  db,                 callback); }, // @callback = function(err, users)
        albums: function(callback) { dbQueries.queryAlbums( db, dtStart, dtEnd, callback); }  // @callback = function(err, albums)
    },
    function(err, output) // Output is { users:, albums: }
    {
        if (err)
        {
            return finalCallback(err);
        }

        async.each(output.users, function(user, callback) // @callback = function(err)
        {
            exports.sendAlbumsToUser(user, output.albums, callback)
        },
        finalCallback); // @finalCallback = function(err)
    });
}

//////////////////////////////////////////////////////////////////////

// @finalCallback = function(err)
exports.sendAlbumsToUser = function(user, albums, finalCallback)
{
    var templateName = process.cwd() + '/views/email.jade';

    var dataToInject = { albums: albums };

    async.waterfall(
    [
        function(callback)       { jade.renderFile( templateName, dataToInject, callback); },               // @callback = function(err, html)
        function(html, callback) { console.log('[INFO] COMPILED TEMPLATE'); return callback(null, html); }, // @callback = function(err, html)
        function(html, callback) { smtpTransport.sendMail( {
                                                               from:    '"'+process.env.AOTD_EMAIL_NAME+'"' + ' <'+process.env.AOTD_EMAIL_ADDRESS+'>', // Can differ from email address you're sending from
                                                               replyTo: process.env.AOTD_EMAIL_ADDRESS,
                                                               to:      user.Email,
                                                               subject: user.FirstName+', check out these albums!',
                                                               html:    html,
                                                               generateTextFromHtml : true
                                                           },
                                                           callback); }, // @callback = function(err, response)
        function(response, callback) { console.log('[INFO] EMAIL SENT TO:', user.Email); return callback(null, response); } // @callback = function(err, response)
    ],
    finalCallback); // @finalCallback = function(err)
};

//////////////////////////////////////////////////////////////////////
