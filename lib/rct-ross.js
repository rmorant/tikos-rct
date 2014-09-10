/*
 * 
 * www.albasoft.com
 *
 * Copyright (c) 2014 Rafa Morant (ALBA Software)
 * 
 */

'use strict';

var config = require('../config.json').xml;

/**
 * @returns map of XML text file content.
 */
exports.js2xml = function(obj, type) {
	type || (type = 'bdoc');
	if (type === 'bdoc') {
		return js2xmlBdoc(obj);
	}
	return null;
};

var XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n<GemDataset>',
		XML_FOOTER = '</GemDataset>',
		bdocMap = {
			name : "NAME",
			type : "TYPE",
			mimetype : "MIMETYPE",
			nodeRef : "NODE_REF",
			id : "ID",
			displayPath : "DISPLAY_PATH",
			downloadUrl : "DOWNLOAD_URL"
		},
		propPrefix = "PROP_",
		bdocMapProps = {
			creator : propPrefix+"CREATOR",
			created : propPrefix+"CREATED",
			doctype : propPrefix+"DOCTYPE",
			docID : propPrefix+"DOC_ID",
			docDate : propPrefix+"DOC_DATE",
			agentID : propPrefix+"AGENT_ID",
			agentName : propPrefix+"AGENT_NAME",
			title : propPrefix+"TITLE",
			description : propPrefix+"DESCRIPTION"
		};

function js2xmlBdoc(obj) {
	var xmlDocs = {};
	var doc = [XML_HEADER, "<TIKOS_BDOC>"];
	bdocRow(obj, doc);
	doc.push("</TIKOS_BDOC>");
	doc.push(XML_FOOTER);
	xmlDocs.bdoc = doc.join('\n');
	// relations
	var parentRef = obj.nodeRef,
			parentName = obj.name;
	if (obj.origins) {
		doc = [XML_HEADER];
		obj.origins.forEach(function(subobj) {
			doc.push("<TIKOS_BDOC_ORIGINS>");
			doc.push("<PARENT_NAME>"+parentName+"</PARENT_NAME>");
			doc.push("<PARENT_REF>"+parentRef+"</PARENT_REF>");
			bdocRow(subobj, doc);
			doc.push("</TIKOS_BDOC_ORIGINS>");
		});
		doc.push(XML_FOOTER);
		xmlDocs.origins = doc.join('\n');
	}
	if (obj.attachments) {
		doc = [XML_HEADER];
		obj.attachments.forEach(function(subobj) {
			doc.push("<TIKOS_BDOC_ATTACHMENTS>");
			doc.push("<PARENT_NAME>"+parentName+"</PARENT_NAME>");
			doc.push("<PARENT_REF>"+parentRef+"</PARENT_REF>");
			bdocRow(subobj, doc);
			doc.push("</TIKOS_BDOC_ATTACHMENTS>");
		});
		doc.push(XML_FOOTER);
		xmlDocs.attachments = doc.join('\n');
	}
	if (obj.targets) {
		doc = [XML_HEADER];
		obj.targets.forEach(function(subobj) {
			doc.push("<TIKOS_BDOC_TARGETS>");
			doc.push("<PARENT_NAME>"+parentName+"</PARENT_NAME>");
			doc.push("<PARENT_REF>"+parentRef+"</PARENT_REF>");
			bdocRow(subobj, doc);
			doc.push("</TIKOS_BDOC_TARGETS>");
		});
		doc.push(XML_FOOTER);
		xmlDocs.targets = doc.join('\n');
	}
	return xmlDocs;
}
// serialize
function bdocRow(obj, doc) {
	var tagName, value;
	Object.keys(bdocMap).forEach(function(fieldName) {
		tagName = bdocMap[fieldName];
		value = obj[fieldName] || "";
		doc.push('<'+tagName+'>'+value+'</'+tagName+'>');
	});
	var props = obj.properties || {};
	Object.keys(bdocMapProps).forEach(function(fieldName) {
		tagName = bdocMapProps[fieldName];
		value = props[fieldName] || "";
		doc.push('<'+tagName+'>'+value+'</'+tagName+'>');
	});
}
