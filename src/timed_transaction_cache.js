class TimedTransactionCache {
  constructor() {
    this.cache = {};
  }

  addTransaction(txn) {
    this.purge();
    const keys = Object.keys(this.cache);
    if (keys.includes(txn)) {
      this.cache[txn].count++;
      this.cache[txn].updatedAt = new Date();
    } else {
      this.cache[txn] = {
        count: 1,
        updatedAt: new Date(),
      };
    }

    return this.cache[txn].count;
  }

  purge() {
    const keys = Object.keys(this.cache);
    for (const key of keys) {
      // delete cache older than 1 minutes
      if (new Date().getTime() - this.cache[key].updatedAt.getTime() >= 60000) {
        delete this.cache[key];
      }
    }
  }
}

module.exports = TimedTransactionCache;
