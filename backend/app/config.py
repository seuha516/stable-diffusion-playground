class Config(object):
    DEBUG = False
    TESTING = False


class ProductionConfig(Config):
    pass


class DevelopmentConfig(Config):
    DEBUG = True


class LocalConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
