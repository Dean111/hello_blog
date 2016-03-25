var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'hello-blog'
    },
    port: 5000,
    db: 'mongodb://123.57.143.189:27017/nodeblog'
  },

  test: {
    root: rootPath,
    app: {
      name: 'hello-blog'
    },
    port: 5000,
    db: 'mongodb://123.57.143.189:27017/hello-blog-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'hello-blog'
    },
    port: 5000,
    db: 'mongodb://123.57.143.189:27017/hello-blog-production'
  }
};

module.exports = config[env];
