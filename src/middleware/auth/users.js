var records = [{
    id: 1,
    username: 'Srinu',
    password: 'secret',
    displayName: 'Srinu',
    emails: [{
        value: 'jack@example.com'
    }]
}, {
    id: 2,
    username: 'Vikram',
    password: '123456',
    displayName: 'Vikram',
    emails: [{
        value: 'jill@example.com'
    }]
}, {
    id: 2,
    username: 'Jorge',
    password: '123456',
    displayName: 'Jorge',
    emails: [{
        value: 'jill@example.com'
    }]
}, {
    id: 2,
    username: 'Sam',
    password: '123456',
    displayName: 'Sam',
    emails: [{
        value: 'jill@example.com'
    }]
}, {
    id: 2,
    username: 'Rasmus',
    password: '123456',
    displayName: 'Rasmus',
    emails: [{
        value: 'jill@example.com'
    }]
}];

module.exports = {
    findById: function (id, cb) {
        process.nextTick(function () {
            var idx = id - 1;
            if (records[idx]) {
                cb(null, records[idx]);
            } else {
                cb(new Error('User ' + id + ' does not exist'));
            }
        });
    },

    findByUsername: function (username, cb) {
        process.nextTick(function () {
            for (var i = 0, len = records.length; i < len; i++) {
                var record = records[i];
                if (record.username === username) {
                    return cb(null, record);
                }
            }
            return cb(null, null);
        });
    }
};