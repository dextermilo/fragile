var socket = io.connect('http://' + location.hostname + ':6543');

// sync by sending events via socket.io

Backbone.sync = function(method, model, options) {
  if (method == 'create') {
    model.attributes.cid = model.cid;
  }
  console.log('OUT', method, app.currentPrj.id, model.attributes);
  socket.json.emit(method, app.currentPrj.id, model.attributes);

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

socket.on('reset', function(prj_id, storydata) {
  console.log('IN', 'reset', prj_id, storydata);
  var prj = app.projects.get(prj_id);
  prj.stories.reset($.parseJSON(storydata));
});
socket.on('id_assigned', function(cid, id) {
  console.log('IN', 'id_assigned', cid, id);
  var story = app.currentPrj.stories.getByCid(cid)
  if (story != undefined) {
    story.set('_id', id);
  }
});
socket.on('create', function(attrs) {
  console.log('IN', 'create', attrs);
  // add the new model *without* syncing
  
  // XXX we need to pass some sort of context about
  // where to add the item / what kind rather than
  // just assuming it's a story
  app.before(function() {
    app.currentPrj.stories.add(new Story(attrs));
  });
});

socket.on('update', function(attrs) {
  console.log('IN', 'update', attrs);
  var story = app.currentPrj.stories.get(attrs._id)
  if (story != undefined) {
    story.set(attrs);
  }
});

socket.on('delete', function(attrs) {
  console.log('IN', 'delete', attrs);
  // destroy model *without* syncing
  var story = app.currentPrj.stories.get(attrs._id);
  if (story != undefined) {
    story.trigger('destroy', story, story.collection);
  }
});
