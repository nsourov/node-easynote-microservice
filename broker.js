let path = require('path');
let { ServiceBroker } = require('moleculer');
let ApiGatewayService = require('moleculer-web');

// Create broker
let broker = new ServiceBroker({
  logger: console,
  cacher: 'memory',
  metrics: true,
  validation: true
});

// Load other services
broker.loadService(path.join(__dirname, 'app/services/notes.service'));

// Load API Gateway
const svc = broker.createService({
  mixins: ApiGatewayService,
  settings: {
    routes: [
      {
        // RESTful aliases
        aliases: {
          'REST notes': 'notes',
        },

        // Disable direct URLs (`/posts/list` or `/posts.list`)
        mappingPolicy: 'restrict'
      }
    ]
  }
});

broker.start();

module.exports = svc;
