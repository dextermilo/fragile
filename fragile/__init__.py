from gevent import monkey; monkey.patch_all()

from pyramid.config import Configurator
from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from pyramid.events import subscriber, BeforeRender, NewRequest
from pyramid.renderers import get_renderer
from pyramid.security import authenticated_userid

import bson
import pymongo
from socketio import SocketIOServer


# Expose the db and user as an attribute of the request.
@subscriber(NewRequest)
def setup_db(event):
    request = event.request
    request.db = db = request.registry.settings['mongo'].fragile
    
    request.user = {}
    user_id = authenticated_userid(request)
    if user_id:
        user = db.users.find_one({'_id': bson.ObjectId(user_id)})
        if user is not None:
            request.user = user


# Add the layout template to the globals of all templates.
layout = None
@subscriber(BeforeRender)
def renderer_globals(event):
    global layout
    if layout is None:
        layout = get_renderer('templates/layout.pt').implementation()
    event['layout'] = layout
    event['logged_in'] = event['request'].user.get('login')


def make_wsgi_app(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings, root_factory='fragile.resources.Root')

    config.set_authentication_policy(AuthTktAuthenticationPolicy('secret'))
    config.set_authorization_policy(ACLAuthorizationPolicy())
    config.set_default_permission('view')

    config.registry.settings['mongo'] = pymongo.Connection()

    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('login', '/login')
    config.add_route('logout', '/logout')
    config.add_route('socket_io', 'socket.io/*remaining')
    config.add_route('home', '/*traverse', use_global_views=True)
    config.scan()
    return config.make_wsgi_app()


def main():
	app = make_wsgi_app({})
	server = SocketIOServer(('0.0.0.0', 6543), app, namespace='socket.io', policy_server=False)
	print 'HTTP Listening on port 6543'
	server.serve_forever()
