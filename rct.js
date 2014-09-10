#! /usr/bin/env node

'use strict';

if (process.argv.indexOf('-v') !== -1) {
	var dbg = require('debug');
	dbg.enable('cli');
	dbg.enable('rest');
}

var Lib = {
	rest : require('./lib/rct-rest'),
	ross : require('./lib/rct-ross'),
	path : require('path'),
	fs : require('fs')
};
var debug = require('debug')('cli');
var userArgs = process.argv;
var cmd = userArgs[2];


debug("ROSS call TIKOS v. %s", require('./package').version);
debug(userArgs);

if (userArgs.indexOf('-h') !== -1 || userArgs.indexOf('--help') !== -1 ) {
	var h = [
	    "ROSS Call TIKOS - v."+require('./package').version,
	    "rct <cmd> <params>",
	    "  <cmd> : { bdoc | del }",
	    "    bdoc : Búsqueda de un documento comercial (Bussines Document).",
	    "           Y crea los archivos <prefix>-bdoc.xml[, <prefix>-attachments.xml][, -origins.xml][, -targets.xml].",
	    "    del  : Borra los documentos con el prefijo indicado.",
	    "  <params> : ",
	    "    -t <doctype> : Tipo de documento (FP, F, ..).",
	    "    -d <docID> : Identificador de documento.",
	    "    -a <agentID> : (opcional) ID de cliente o proveedor.",
//	    "    -r <ourRef> : (opcional) Referencia interna del documento.",
	    "    -o <prefix> : (opcional) Prefijo de salida para archivos. Por defecto <doctype>_<docID>. ",
	    "    -p <path> : (opcional) Carpeta destino para los archivos de salida. La carpeta debe existir.",
	    "    -j : (opcional) Guarda el archivo <prefix>.json de la respuesta.",
	    "    -v : Verbose",
	    "Exit codes : ",
	    " 0 : Ha creado o borrado los archivos correctamente, según comando.",
	    " 1 : Error en la conexión a Alfresco.",
	    " 2 : Error en la búsqueda. Archivo no encontrado.",
	    " 3 : Error en el borrado. No existe la carpeta.",
	    "",
	    "Ejemplos:",
	    "./rct bdoc -t FP -d 6610",
	    "./rct bdoc -t FP -d 6610 -a pr01 -o FP_6610",
//	    "./rct bdoc -t FP -r 0001",
	    "./rct del -o FP_6610    ==   ./rct del -t FP -d 6610",
	  ]
    return console.log(h.join('\n'));
}



var len = userArgs.length, idx, doctype, docID, agentID, ourRef, oPrefix, oPath, jsonFlag = false;

//idx= userArgs.indexOf('-t');
//debug("idx=%s, len=%s, ch=%s",idx, len, userArgs[idx+1][0]);
if ((idx=userArgs.indexOf('-t')) !== -1 && len > idx+1 && userArgs[idx+1][0]!=='-' ) {
	doctype = userArgs[idx+1];
	//debug("idx=%s, docype='%s'", idx, doctype);
}
if ((idx=userArgs.indexOf('-a')) !== -1 && len > idx+1 && userArgs[idx+1][0]!=='-' ) {
	agentID = userArgs[idx+1];
}
if ((idx=userArgs.indexOf('-d')) !== -1 && len > idx+1 && userArgs[idx+1][0]!=='-' ) {
	docID = userArgs[idx+1];
}
if ((idx=userArgs.indexOf('-r')) !== -1 && len > idx+1 && userArgs[idx+1][0]!=='-' ) {
	ourRef = userArgs[idx+1];
}
if ((idx=userArgs.indexOf('-o')) !== -1 && len > idx+1 && userArgs[idx+1][0]!=='-' ) {
	oPrefix = userArgs[idx+1];
}
if ((idx=userArgs.indexOf('-p')) !== -1 && len > idx+1 && userArgs[idx+1][0]!=='-' ) {
	oPath = userArgs[idx+1];
}
if ((idx=userArgs.indexOf('-j')) !== -1 ) {
	jsonFlag = true;
}

debug("docype='%s', agentID='%s', docID='%s', ourRef='%s'", doctype, agentID, docID, ourRef);
function getOutputPrefix() {
	return oPrefix || (doctype + '_' + docID);
}
function getOutputFolderPath() {
	return oPath || './';
}
if (cmd === "bdoc") {
	Lib.rest.get_bdoc(doctype, docID, agentID, function(err, resp) {
		if (err) {
			// Connection error
			process.exit(1);
		} else {
			if (resp.error) {
				// query error
				console.log(resp);
				process.exit(2);
			} else {
				var prefix = getOutputPrefix(),
					folderPath = getOutputFolderPath(),
					fileName = prefix+'.json', 
					filePath = Lib.path.join(folderPath, fileName);
				if (jsonFlag) {
					console.log("Create '"+filePath+"'");
					Lib.fs.writeFileSync(filePath, JSON.stringify(resp, null, '\t') );
				}
				var bdocFiles = Lib.ross.js2xml(resp.result);
				if (bdocFiles) {
					Object.keys(bdocFiles).forEach(function(name) {
						fileName = prefix+'-'+name+'.xml';
						filePath = Lib.path.join(folderPath, fileName);
						/*
						Lib.fs.writeFile(filePath, bdocFiles[name], function(err, fd) {
							if (err) {
								console.error("ERROR: Abriendo archivo '"+filePath+"' en modo escritura.");
							}
							console.log("Create '"+filePath+"'");
							console.log(fd);
						});
						*/
						console.log("Create '"+filePath+"'");
						Lib.fs.writeFileSync(filePath, bdocFiles[name]);
					});
				}
			}
		}
	});
} else if (cmd === "del") {
	var prefix = getOutputPrefix(),
			folderPath = getOutputFolderPath(),
			filePath;
	Lib.fs.exists(folderPath, function(exist) {
		if (exist) {
			var files = Lib.fs.readdirSync(folderPath);
			files.forEach(function(fileName) {
				if (fileName.indexOf(prefix) === 0) {
					filePath = Lib.path.join(folderPath, fileName);
					console.log("Delete '"+filePath);
					Lib.fs.unlinkSync(filePath);
				}
			});
		} else {
			console.log("ERROR: '"+folderPath+"' No Existe.");
			process.exit(3);
		}
	});
}
