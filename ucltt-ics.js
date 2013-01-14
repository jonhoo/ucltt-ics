var http = require("http");
var assert = require("assert");
var icalendar = require('icalendar');
var Browser = require("zombie");
Browser.site = "https://cmis.adcom.ucl.ac.uk:4443/timetabling/";
Browser.userAgent = "Opera/9.80 (X11; Linux x86_64; Edition Next) Presto/2.12.388 Version/12.12";
Browser.waitFor = "3s";
Browser.runScripts = false;

var weeks = [];
var browsers = {};

function theloop(browser, response, username, password, loop) {
  switch (browser.text('title')) {
    case 'Common Timetable':
      if (!browser.query('#btnTempViewYear')) {
        console.warn("Common page seems incorrect");
        sendDebug(browser, response);
        return false;
      }

      browser.clickLink('#btnTempViewYear a', function() {
        var ical = parseEvents(browser);
        response.write(ical.toString());
        response.end();
      });
      break;
    case 'UCL Single Sign-on':
      if (browser.query('#main').textContent.indexOf('Authentication failed') > -1) {
        console.warn("*** Authentication failed ***");
        if (allowAny) {
          response.writeHead(401, {
            "WWW-Authenticate": 'Basic realm="UCL Timetable"',
            "Content-Type": "text/plain"
          });
        } else {
          response.writeHead(403, {"Content-Type": "text/plain"});
        }
        response.write("Authentication with UCL failed")
        response.end();
        return;
      }

      browser
        .fill("j_username", username)
        .fill("j_password", password)
        .pressButton("Login", loop.bind(this, loop));
      break;
    case '':
      if (browser.queryAll('noscript').length == 2) {
        browser.document.forms[0].submit();
        browser.wait().then(loop.bind(this, loop));
      } else {
        console.warn("Got unexpected empty page in loop");
      }
      break;
    default:
      console.warn("Unknown page in loop: '" + browser.text('title') + "'");
      sendDebug(browser, response);
  }

  return false;
}

var allowAny = !!process.env_npm_package_config_username;
http.createServer(function(request, response) {
  var header = request.headers['authorization'] || '',
      token = header.split(/\s+/).pop() || '',
      auth = new Buffer(token, 'base64').toString(),
      parts = auth.split(/:/),
      username = parts[0],
      password = parts[1];

  if (!allowAny || !username  || !password) {
    username = process.env.npm_package_config_username;
    password = process.env.npm_package_config_password;

    if (!username || !password) {
      if (allowAny) {
        response.writeHead(401, {"WWW-Authenticate": 'Basic realm="UCL Timetable"'});
      } else {
        response.writeHead(403, {"Content-Type": "text/plain"});
        response.write("Random access not allowed, but no username/password given in config");
      }
      response.end();
      return;
    }
  }

  response.writeHead(200, {"Content-Type": "text/plain"});

  if (!(username in browsers)) {
    browsers[username] = new Browser();
  }
  var browser = browsers[username];

  var loop = theloop.bind(this, browser, response, username, password);
  browser.visit("login.do", function() {
    console.log((new Date()) + ": Fetching started");
    loop(loop);
  });
}).listen(process.env.npm_package_config_port);

function parseEvents(browser) {
  var ical = new icalendar.iCalendar();

  if (weeks.length == 0) {
    console.log("## Extracting week dates ##");
    browser.queryAll('#yearCalendarWeekContainer a').forEach(function(e) {
      var week = parseInt(e.childNodes[0].textContent, 10);
      var dates = e.childNodes[1].textContent.split(" - ");
      var starts = dates[0].split("/").map(function(e) { return parseInt(e, 10); });
      var date = new Date(starts[2], starts[1]-1, starts[0]);
      weeks[week-1] = date;
    });
  }

  browser.queryAll('.event').forEach(function(e) {
    var type = e.querySelector('.type').textContent.trim().toLowerCase();
    var module = e.querySelector('.module').textContent.trim();
    var name = e.querySelector('.name').getAttribute("title").trim();
    var sname = name.replace(/\s\(.*?\)/, '').replace(/\s\/.*/, '');
    var lecturers = e.querySelector('.lecturer').textContent.trim();
    var room = e.querySelector('.room').textContent.trim();

    var time = e.nextSibling.nextSibling.querySelector('.time').textContent.trim();
    var weeks = parseWeeks(e.querySelector('.weeks').textContent);

    weeks.forEach(function(week) {
      var at = resolveTime(week, time);
      if (!at) { return; }

      var code = module.split(", ")[0];
      var event = new icalendar.VEvent('ucltt-' + code + '-' + at[0].getTime());
      event.setSummary(sname + " " + type);
      event.setDate(at[0], at[1]);
      var description = module + ": " + name + " " + type;
      if (lecturers.indexOf('Missing') != 0) {
        description += " by " + lecturers;
      }
      if (room.indexOf('Missing') != 0) {
        description += " in " + room;
      }
      event.setDescription(description);
      ical.addComponent(event);
    });
  });

  return ical;
}

function resolveTime(week, time) {
  var bits = time.split(", ");
  var offset = 0;
  switch (bits[0]) {
    case "Monday"   : offset = 0; break;
    case "Tuesday"  : offset = 1; break;
    case "Wednesday": offset = 2; break;
    case "Thursday" : offset = 3; break;
    case "Friday"   : offset = 4; break;
    case "Saturday" : offset = 5; break;
    case "Sunday"   : offset = 6; break;
    default:
      console.warn("Weird day encountered: " + bits[0]);
      return false;
  }

  var day = new Date(weeks[week-1].getTime() + (offset*24*60*60*1000));

  var times = bits[1].split(" - ").map(function(e) { return e.split(":"); });
  var sh = parseInt(times[0][0], 10),
      sm = parseInt(times[0][1], 10),
      eh = parseInt(times[1][0], 10),
      em = parseInt(times[1][1], 10);

  return [
    new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), sh, sm)),
    new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), eh, em))
  ];
}

function parseWeeks(weekStr) {
  var weeks = [];
  weekStr.split(", ").forEach(function (w) {
    if (w.indexOf('-') > -1) {
      var bits = w.split('-');
      for (var i = parseInt(bits[0], 10); i <= parseInt(bits[1], 10); i++) {
        weeks.push(i);
      }
    } else {
      weeks.push(parseInt(w, 10));
    }
  });
  return weeks;
}

function sendDebug(browser, response) {
  if (!("response" in browser)) {
    console.error("response not yet in browser");
    setTimeout(function() { sendDebug(browser, response); }, 500);
    return;
  }
  response.write("Real response:\n");
  response.write(browser.response[2]);
  response.write("\nInterpreted response:\n");
  response.write(browser.html());
  response.end();
}
