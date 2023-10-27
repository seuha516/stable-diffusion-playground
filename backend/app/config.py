class Config(object):
    DEBUG = False
    TESTING = False
    SECRET_KEY = "secret"


class ProductionConfig(Config):
    pass


class DevelopmentConfig(Config):
    DEBUG = True


class LocalConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
