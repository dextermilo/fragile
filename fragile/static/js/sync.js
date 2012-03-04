var socket = io.connect('http://' + location.hostname + ':6543');

// sync by sending events via socket.io

Backbone.sync = function(method, model, options) {
  if (method == 'create') {
    model.attributes.cid = model.cid;
  }

  if (method == 'read') {
    model.reset_callback = options.success;
  }

  console.log('OUT', method, app.currentPrj.id, model.attributes);
  socket.json.emit(method, app.currentPrj.id, model.attributes);

  if (method != 'read' && options.success) {
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
  if (prj.stories.reset_callback != undefined) {
    prj.stories.reset_callback($.parseJSON(storydata));
    delete prj.stories.reset_callback;
  }
});
socket.on('id_assigned', function(cid, id) {
  console.log('IN', 'id_assigned', cid, id);
  var story = app.currentPrj.stories.getByCid(cid)
  if (story != undefined) {
    story.set('_id', id);
  }
});
socket.on('create', function(prj_id, attrs) {
  console.log('IN', 'create', attrs);
  // add the new model *without* syncing
  if (app.currentPrj.id == prj_id) {
    app.currentPrj.stories.add(new Story(attrs));
  }
});

socket.on('update', function(prj_id, attrs) {
  console.log('IN', 'update', attrs);
  if (app.currentPrj.id == prj_id) {
    var story = app.currentPrj.stories.get(attrs._id)
    if (story != undefined) {
      story.set(attrs);
    }
  }
});

socket.on('reorder', function(prj_id, attrs) {
  console.log('IN', 'reorder', attrs);
  if (app.currentPrj.id == prj_id) {
    var story = app.currentPrj.stories.get(attrs._id)
    story.trigger('reorder', attrs.position);
  }
});

socket.on('delete', function(prj_id, attrs) {
  console.log('IN', 'delete', attrs);
  // destroy model *without* syncing
  if (app.currentPrj.id == prj_id) {
    var story = app.currentPrj.stories.get(attrs._id);
    if (story != undefined) {
      story.trigger('destroy', story, story.collection);
    }
  }
});
