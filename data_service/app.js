var hapi = require('hapi'),
  listenPort = process.env.PORT || 8008 ,
  server = new hapi.Server(),
  mongoose = require('mongoose'),
  models = require('./models');

server.connection({port: listenPort});

if (process.env.VCAP_SERVICES) {
    var services = JSON.parse(process.env.VCAP_SERVICES);
    var dbcreds = services['mongodb'][0].credentials;
}

if (dbcreds) {
    //console.log(dbcreds);
    var db = mongoose.connect(dbcreds.host, dbcreds.db, dbcreds.port, {user: dbcreds.username, pass: dbcreds.password});
} else {
    var db = mongoose.connect("127.0.0.1", "enote", 27017);
}

models();


server.route([
  {
    method: 'GET',
    path: '/',
    handler: function(req, reply) {
      reply('Select a collection, e.g., /collections/messages');
    }
  },
  {
    method: 'GET',
    path: '/env',
    handler: function(req, reply) {
      if (process.env.VCAP_SERVICES) {
        reply(process.env.VCAP_SERVICES);
      }
      else{
        reply('process.env.VCAP_SERVICES is null');
      }
    }
  },
  {
    method: 'GET',
    path: '/collections/{collectionName}',
    handler: function(req, reply) {
      var m = mongoose.model(req.params.collectionName);
      m.find(function(err, results){
        if(err){
          reply(err);
        }
        reply(results);
      });
    }
  },
  {
    method: 'GET',
    path: '/collections/{collectionName}/AggregateId/{value}',
    config: {
      jsonp: 'callback',
      handler: function(req, reply) {
        var m = mongoose.model(req.params.collectionName);
        m.find({AggregateId: req.params.value}, function(err, results){
          if(err){
            reply(err);
          }
          reply(results);
        });
      }
    }
  },
  {
    method: 'GET',
    path: '/collections/{collectionName}/{id}',
    handler: function(req, reply) {
      var m = mongoose.model(req.params.collectionName);
      m.find({_id: req.params.id}, function(err, results){
        if(err){
          reply(err);
        }
        reply(results);
      });
    }
  },
  {
    method: 'POST',
    path: '/collections/{collectionName}',
    handler: function(req, reply) {
      var m = mongoose.model(req.params.collectionName);
      req.payload.inTime = new Date();
      m.create(req.payload, function(err, results){
        if (err){ 
            console.log(err);
            return reply(err);
          }
          reply(results);
      });
    }
  },
  {
    method: 'DELETE',
    path: '/collections/{collectionName}/clean',
    handler: function(req, reply) {
      var m = mongoose.model(req.params.collectionName);
      m.remove({}, function(err, result){
        if (err) return reply(err);
        reply(result);
      });
    }
  },
  {
    method: 'DELETE',
    path: '/collections/{collectionName}/{id}',
    handler: function(req, reply) {
      var m = mongoose.model(req.params.collectionName);
      m.remove({_id:req.params.id}, function(err, result){
        if (err) return reply(err);
        reply(result)
      });
    }
  }
]);

server.start(function(){
  console.log('Server running at:'+ server.info.uri);
});
