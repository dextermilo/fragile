from pyramid.view import view_config
from gevent_zeromq import zmq
import bson
import bson.json_util
import json
import pymongo
from multiprocessing import Process


context = zmq.Context()
mongo = pymongo.Connection()


def json_handler(obj):
    if isinstance(obj, bson.objectid.ObjectId):
        return str(obj)
    raise TypeError("%r is not JSON serializable" % obj)


@view_config(renderer='templates/index.pt')
def index(request):
    try:
        cursor = mongo.fragile.stories.find();
        return {'storydata': json.dumps(list(cursor), default=json_handler).replace("'", r"\'") }
    finally:
        mongo.end_request()


@view_config(route_name='socket_io')
def socketio_service(request):
    print "Socket.IO request running"
    io = request.environ['socketio']
    
    socket = context.socket(zmq.REQ)
    socket.connect("tcp://127.0.0.1:5555")

    while True:
        msg = io.receive()
        if msg is None:
            break
        if msg['type'] == 'event':
            cmd = msg['name']
            prj_id, obj = msg['args']

            # Relay to db process via zmq
            # XXX we could PUSH updates/deletes and reserve
            # the REQ-REP for creating objects (where we need the id)
            socket.send(json.dumps(msg))
            resp = socket.recv()

            if cmd == 'create':
                # Notify creator of actual id
                io.send_event('id_assigned', obj['cid'], resp)
            elif cmd == 'read':
                # Relay story data
                io.send_event('reset', prj_id, resp)

            if cmd != 'read':
                # Broadcast to other socket.io clients
                print "Broadcasting", msg
                io.broadcast_event(cmd, obj)


def relay_to_mongo():
    """This runs as a separate process to relay commands to mongo."""
    import zmq

    # set up 0mq socket
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    socket.bind("tcp://127.0.0.1:5555")

    # set up mongo connection
    conn = pymongo.Connection()
    projects = conn.fragile.projects
    stories = conn.fragile.stories

    while True:
        msg = json.loads(socket.recv())
        prj_id, obj = msg['args']

        if msg['name'] == 'create':
            del obj['_id']
            _id = stories.insert(obj)
            socket.send(str(_id))
        elif msg['name'] == 'update':
            obj['_id'] = bson.objectid.ObjectId(obj['_id'])
            stories.save(msg['args'][0])
            socket.send('OK')
        elif msg['name'] == 'delete':
            stories.remove({'_id': bson.objectid.ObjectId(obj['_id'])})
            socket.send('OK')
        elif msg['name'] == 'read':
            prj_stories = stories.find({'_id': {'$in': projects.find({'_id': prj_id})[0]['stories']}})
            socket.send(json.dumps(list(prj_stories), default=json_handler))
        else:
            socket.send('OK')

Process(target=relay_to_mongo).start()
