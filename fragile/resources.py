from pyramid.security import Allow, Authenticated


AdminRole = ('view', 'edit')


class Root(object):
    __acl__ = [ (Allow, Authenticated, 'view') ]

    def __init__(self, request):
        self.request = request

    def __getitem__(self, name):
    	return Project(self.request.db.projects.find_one({'_id': name}))


class Project(object):

	def __init__(self, attrs):
		self.attrs = attrs

	@property
	def __acl__(self):
		return [(Allow, str(uid), AdminRole) for uid in self.attrs['admins']]
