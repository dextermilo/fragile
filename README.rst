1. brew install libevent zmq mongo

   (Ubuntu: aptitude install libevent-dev libzmq-dev mongodb)
2. git clone git@github.com:dextermilo/fragile.git
3. cd fragile
4. bin/virtualenv-2.7 --no-site-packages .
5. bin/easy_install zc.buildout
6. bin/buildout init
7. bin/buildout
8. bin/fragile
9. Start up mongo (see command printed by brew)
10. Visit http://localhost:6543/ in browser.
