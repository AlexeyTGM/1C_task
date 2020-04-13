import * as Express from "express";
//import * as path from "path";
//import * as bodyParser from "body-parser";

//var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

import * as routes from "./routes";
import * as data from "./routes/data";

var partials = require('express-partials');

var app = Express();

// view engine setup
app.use(partials());
app.set("views", "./views");
app.set("view engine", "ejs");
app.locals.layout = 'layout.ejs';

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(Express.static("./public"));

app.use("/", routes);
app.use("/data", data);

// catch 404 and forward to error handler
app.use(function(req: any, res: any, next: any) {
  var err: any = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err: any, req: any, res: any, next: any) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: (app.get("env") === "development") ? err : {}
  });
});


export = app;
