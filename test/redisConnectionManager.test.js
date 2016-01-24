describe('Redis Open Connection', function () {
    it('it should open connection to redis', function (done) {
        var redis = require('redis');
        var client = redis.createClient(10423, 'pub-redis-10423.us-east-1-3.1.ec2.garantiadata.com', {
            no_ready_check: true
        });
        client.auth('Thirumal9', function (err) {
            console.log('asf');
            if (err) {
                throw err;
            }
        });

        client.on('connect', function () {
            console.log('Connected to Redis');
        });
        done();
    });
});