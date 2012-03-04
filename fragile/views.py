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
        cursor = mongo.fragile.projects.find();
        return {'projectdata': json.dumps(list(cursor), default=json_handler).replace("'", r"\'").replace(r'\"', r'\\"') }
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
                io.broadcast_event(cmd, prj_id, obj)


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
    counters = conn.fragile.counters

    # DB upgrade: add 'fragile' project if missing
    if not len(list(projects.find())):
        stories.update({}, {'$set': {'project': 'fragile'}})
        story_ids = [s['_id'] for s in stories.find({'project': 'fragile'})]
        projects.insert({'_id': 'fragile', 'title': 'Fragile', 'stories': story_ids})

    # DB upgrade: add incrementing counter for stories
    if not len(list(counters.find())):
        counters.insert({'_id': 'story', 'value': 0})

    while True:
        msg = json.loads(socket.recv())
        prj_id, obj = msg['args']

        if msg['name'] == 'create':
            counter = counters.find_and_modify(query={'_id': 'story'}, update={'$inc': {'value': 1}}, new=True)
            obj['_id'] = next_id = 'S%s' % counter['value']
            stories.insert(obj)
            projects.update({'_id': obj['project']}, {'$push': {'stories': next_id}})
            socket.send(next_id)
        elif msg['name'] == 'update':
            if not obj['_id'].startswith('S'):
                obj['_id'] = bson.objectid.ObjectId(obj['_id'])
            stories.save(obj)
            socket.send('OK')
        elif msg['name'] == 'delete':
            import pdb; pdb.set_trace()
            if not obj['_id'].startswith('S'):
                story_id = bson.objectid.ObjectId(obj['_id'])
            stories.remove({'_id': story_id})
            projects.update({'_id': obj['project']}, {'$pull': {'stories': story_id}})
            socket.send('OK')
        elif msg['name'] == 'read':
            prj_stories = stories.find({'project': prj_id})
            socket.send(json.dumps(list(prj_stories), default=json_handler))
        elif msg['name'] == 'reorder':
            prj_stories = projects.find_one({'_id': obj['project']}, {'stories': 1})['stories']
            if not obj['_id'].startswith('S'):
                story_id = bson.objectid.ObjectId(obj['_id'])
            index = prj_stories.index(story_id)
            prj_stories.pop(index)
            new_index = obj['position']
            prj_stories.insert(new_index, story_id)
            projects.update({'_id': obj['project']}, {'$set': {'stories': prj_stories}})
            socket.send('OK')
        else:
            socket.send('OK')

Process(target=relay_to_mongo).start()
