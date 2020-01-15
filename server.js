//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var app     = express();
var eps     = require('ejs');
var got     = require('got');
var http = require('http');
var url = require('url');
var ippackage = require('ip');
var os = require('os');

app.engine('html', require('ejs').renderFile);

app.use( '/scripts', express.static('scripts'));
app.use( '/styles', express.static('styles'));
app.use( '/images', express.static('images'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

// Comment for git testing again
app.get('/', function (req, res)
{
  console.log( "Request received, serving index....");
  res.render('index.html');
});

app.get('/containerip', function (req,res)
{
  var containerip = ippackage.address();

  res.write( containerip );
  res.end();
});

app.get('/cat', function (req,res)
{
  requestURL = req.url;

  console.log( "  URL: " + requestURL );
  console.log( "  Method: " + req.method );

  fullURL = 'http://' + req.headers.host + req.url;
  console.log( "  Full URL: " + fullURL );

  console.log( "Cat service called with param: " + req.query.cat);

  switch( req.query.cat.toLowerCase())
  {
    case "winnie":
    {
      res.write( "Irritable meow, hiss at other cats, purr when alone with humans.");
      break;
    }
    case "kali":
    {
      res.write( "Plot mayhem against the other cats, allow humans to pet for 10.5 secs then scratch");
      break;
    }
    case "murphy":
    {
      res.write( "Be adorable. Put wicker basket on head. Attack other cats whilst helmet in place. Be more adorable");
      break;
    }
    case "jessie":
    {
      res.write( "Emotionally blackmail humans into letting her outside. Kill absolutely everything outside. Come back in and purr");
      break;
    }
    case "dexter":
    {
      res.write( "Wake humans up at 3:00, 4:00 or 5:00am and moan until they let him out. Be adorably Ginger.");
      break;
    }
    case "molly":
    {
      res.write( "Avoid other cats at all costs. Have an adorably raspy meow. Drink stale water from puddles.");
      break;
    }
    default:
    {
      res.write("No Such cat!");
      break;
    }
  }

  res.end();
  return;
});

app.get('/fileappend', function (req,res)
{
  requestURL = req.url;

  console.log( "  URL: " + requestURL );
  console.log( "  Method: " + req.method );

  fullURL = 'http://' + req.headers.host + req.url;
  console.log( "  Full URL: " + fullURL );

  var text = req.query.text;
  var file = req.query.file;
  
  if( text == null || file == null )
  {
    res.write( "Missing parameters (requires 'file' and 'text')...");
    res.end();
    return;
  }

  console.log( "Params:" );
  console.log( "  file: " + file );
  console.log( "  textToAdd: " + text );

  fs.appendFile( file, text + os.EOL, function (err)
  {
    if( err )
    {
      console.log( err.message );
      res.write( "Serverside issue: " + err.message );
      res.end();
      return;
    } 
    else
    {
      console.log( "  Updated " + file + " with " + text );
      res.write( "Updated '" + file + "' with '" + text + "'");
      res.end();
      return;
    }
  });
});

app.get( '/envs', function (req,res) {
  res.send( getEnvs() );
});

app.get( '/env', function (req,res) {
  // Do I have a request variable?
  var input = req.query.name;

  if( input == null )
  {
    res.send( "\"No name parameter provided\"");
  }

  // Do I have an ENV with that name?
  var envoutput = process.env[input];

  if( envoutput == null )
  {
    res.send( "No env variable with name " + input + " found.");
  }
  else
  {
    res.send( input + ":" + envoutput ); 
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Serverside error occurred: ' + err.message);
});

app.listen(port, ip);
console.log('Server running on ' + ip + ':' + port);

function getEnvs()
{
  output = "";
  output += "<b>Environment Variables resident on host (generated from node.js)</b><br/>";
  output += "<hr width=100% size=1/>";

  names = getEnv();

  for( name in names )
  {
    target = names[name];
    output += "<b>" + target + "</b> " + process.env[target] + "<br/>";
  }

  return output;
}

function showObject(obj) {
  var result = "";
  for (var p in obj) {
    if( obj.hasOwnProperty(p) ) {
      result += p + " , " + obj[p] + "\n";
    } 
  }              
  return result;
}

function getEnv()
{
  var envNames = [];

  for( name in process.env )
  {
    envNames.push( name );
  }

  envNames.sort();

  return envNames;
}