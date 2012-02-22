from gevent import monkey; monkey.patch_all()
from pyramid.config import Configurator
from socketio import SocketIOServer


def make_wsgi_app(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('socket_io', 'socket.io/*remaining')
    config.add_route('stories', '/stories')
    config.scan()
    return config.make_wsgi_app()


def main():
	app = make_wsgi_app({})
	def app_wrapper(environ, start_response):
		# work around gevent-websocket bug
		if start_response is None:
			return
		return app(environ, start_response)

	server = SocketIOServer(('0.0.0.0', 6543), app_wrapper, namespace='socket.io', policy_server=False)
	print 'HTTP Listening on port 6543'
	server.serve_forever()
