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
    db: 'mongodb://localhost/nodeblog'
  },

  test: {
    root: rootPath,
    app: {
      name: 'hello-blog'
    },
    port: 5000,
    db: 'mongodb://localhost/hello-blog-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'hello-blog'
    },
    port: 5000,
    db: 'mongodb://localhost/hello-blog-production'
  }
};

module.exports = config[env];
