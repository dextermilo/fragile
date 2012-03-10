from pyramid.security import Allow, Authenticated


class RootFactory(object):
    __acl__ = [ (Allow, Authenticated, 'view') ]

    def __init__(self, request):
        pass
