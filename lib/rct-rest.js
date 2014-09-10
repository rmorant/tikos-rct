/*
 * 
 * www.albasoft.com
 *
 * Copyright (c) 2014 Rafa Morant (ALBA Software)
 * 
 */

'use strict';

var config = require('../config.json').rest;

var log = require('debug')('rest'),
		_rest = require('rest'),
		_timeout = require('rest/interceptor/timeout'),
		_mime = require('rest/interceptor/mime'),
		_pathPrefix = require('rest/interceptor/pathPrefix'),
		//_entity = require('rest/interceptor/entity'),
		_basicAuth = require('rest/interceptor/basicAuth')
		;

var client = _rest
				//.wrap(_timeout, {timeout : 5000 })
				.wrap(_basicAuth, { username: config.auth.username, password: config.auth.password })
				.wrap(_mime, {mime:'application/json'})
				//.wrap(_entity)
				.wrap(_pathPrefix, { prefix: config.urlBase });

function getRest(url) {
//client()
}
function callAlfresco(path, cb) {
	log("Calling: %s", path);
	client({path:path}).then(
			function(response) {
				log(response);
				cb(null, response.entity);
			},
			function(respError) {
				console.error(respError);
				cb(respError);
			}
	);
}

exports.test = function() {
  return 'Testing rosscalltikos';
};

exports.get_bdoc = function(doctype, docID, agentID, cb) {
	var path = "/tikos/api/q/bdoc/"+doctype+(agentID?"/"+agentID:"")+"/"+docID+".json";
	callAlfresco(path, cb);
};
