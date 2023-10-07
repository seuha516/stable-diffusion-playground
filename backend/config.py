class Config(object):
    DEBUG = False
    TESTING = False
    SERVER_NAME = ""


class ProductionConfig(Config):
    pass


class DevelopmentConfig(Config):
    DEBUG = True


class LocalConfig(Config):
    DEBUG = True
    SERVER_NAME = "localhost:5000"


class TestingConfig(Config):
    TESTING = True
