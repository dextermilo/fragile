from contextlib import contextmanager
import pymongo


mongo = pymongo.Connection()


@contextmanager
def mongo_connection():
	yield mongo.fragile
	mongo.end_request()
