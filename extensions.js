Array.prototype.clear = function () {
    while (this.length) {
        this.pop();
    }
};