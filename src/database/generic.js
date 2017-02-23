'use strict';


class GenericDB {
  constructor(connection) {
    this.connection = connection;
  }

  connect() {
    return Promise.reject('Virtual Function');
  }
}

module.exports = GenericDB;