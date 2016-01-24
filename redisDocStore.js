var redisClient = require('./redisClient');

function update(key) {
    get(key, function (data) {
        var updatedDoc = normaliseData(data, formData, selectedDay);
        set(key, updatedDoc, function (res) {
            console.log(res);
        })
    });
}

function get(key, callback) {
    console.log('In get ');
    redisClient.get(key, callback);
}

function set(key, value, callback) {
    redisClient.set(key, value, callback);
}

function normaliseData(dataFromDocStore) {

    console.log('dataFromDocStore is  ');
    console.objectLog(dataFromDocStore);
    dataFromDocStore['vasu'] = {
        subjects: 4
    };

    // if (!dataFromDocStore) {
    //     dataFromDocStore = {};
    // }
    // if (!dataFromDocStore[selectedDay]) {
    //     dataFromDocStore[selectedDay] = {};
    // }

    // dataFromDocStore[selectedDay][formData.tenants] = {
    //     util: {
    //         gas: {
    //             amount: formData.gas
    //         },
    //         electricity: {
    //             amount: formData.electricity
    //         },
    //         household: {
    //             amount: formData.household
    //         }
    //     }
    // }
    // console.log('rawData ');
    // console.objectLog(dataFromDocStore);
    // return dataFromDocStore;

}

module.exports = {
    persist: set,
    fetch: get,
    update: update
}