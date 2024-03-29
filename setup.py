import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.rst')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

requires = [
    'gevent',
    'gevent-websocket>=0.3.1',
    'gevent-socketio>=0.2.2',
    'pyramid>=1.3a9',
    'gevent_zeromq',
    'pymongo',
    ]

setup(name='fragile',
      version='0.0',
      description='fragile',
      long_description=README + '\n\n' +  CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pylons",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='',
      author_email='',
      url='',
      keywords='web pyramid pylons',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      install_requires=requires,
      tests_require=requires,
      test_suite="fragile",
      entry_points = {'console_scripts': [
          'fragile = fragile:main',
          'fragile-persist = fragile.views:relay_to_mongo',
          ]},
      )
