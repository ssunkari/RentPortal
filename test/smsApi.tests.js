describe.skip('send text message via twilio', function () {
    it('should send a text message', function (done) {
        // Twilio Credentials 
        var accountSid = 'ACd14aa08f5708d3fc846f1443e7f0ecee';
        var authToken = '4092f696d31f6128b62c47c7a32e3060';

        //require the Twilio module and create a REST client 
        var client = require('twilio')(accountSid, authToken);

        client.messages.create({
            to: "07545998615",
            from: "+441392694037",
            body: "Test message",
        }, function (err, message) {
            console.log(message.sid);
            done();
        });

    });
});