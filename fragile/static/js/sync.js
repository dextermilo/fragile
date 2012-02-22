var socket = io.connect("http://10.10.10.131:6543");

// sync by sending events via socket.io

Backbone.sync = function(method, model, options) {
  if (method == 'create') {
    model.attributes.cid = model.cid;
  }
  if (method != 'read') {
    console.log('OUT', method, model.attributes);
    socket.json.emit(method, model.attributes);
  }

  if (options.success) {
    options.success();
  }
}

// log basic socket events

socket.on('connect', function() {
  console.log('Connected');
});
socket.on('error', function(obj) {
  console.log("Error", JSON.stringify(obj));
});
socket.on('disconnect', function() {
  console.log("Disconnected");
});

// handle events relayed from other clients

socket.on('id_assigned', function(cid, id) {
  console.log('IN', 'id_assigned', cid, id);
  app.stories.getByCid(cid).set('_id', id);
});
socket.on('create', function(attrs) {
  console.log('IN', 'create', attrs);
  // add the new model *without* syncing
  
  // XXX we need to pass some sort of context about
  // where to add the item / what kind rather than
  // just assuming it's a story
  app.before(function() {
    app.stories.add(new Story(attrs));
  });
});

socket.on('update', function(attrs) {
  console.log('IN', 'update', attrs);
  app.stories.get(attrs._id).set(attrs);
});

socket.on('delete', function(attrs) {
  console.log('IN', 'delete', attrs);
  // destroy model *without* syncing
  var model = app.stories.get(attrs._id);
  model.trigger('destroy', model, model.collection);
});
