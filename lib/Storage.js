import path from 'path';
import Datastore from 'nedb';
import Helpers from './Helpers.js';


export default class Storage { 

  db = {};
  base_path = path.join(Helpers.dirname, '../store/db');

  _stores = [
    'emotes',
    'prayers'
  ];

  constructor(autoload) {
    this._stores.forEach(store => {
      this.db[store] = new Datastore({ 
        filename: path.join(this.base_path, `${store}.db`)
      });
    })
    if (autoload) this.init();
  }

  init() {
    Object.keys(this.db).forEach(name => this.db[name].loadDatabase());
  }

  hasCollection(name) {
    return this.db.hasOwnProperty(name);
  }

  save(collection, doc, callback) {
    if (this.hasCollection(collection)) {
      console.log('Storage::save', collection, doc);
      this.db[collection].insert(doc, function(err, docs) {
        if (err) throw new Error(err);
        console.log('Storage::saved', docs);
        if (typeof(callback) === 'function') {
          callback(docs);
        }
      });
    }else if (typeof(callback) === 'function') {
      callback([]);
    }
  }

  fetch(collection, query, callback) {
    const _query = query || {};
    if (this.hasCollection(collection)) {
      console.log('Storage::fetch', collection, _query);
      this.db[collection].find(_query, function(err, docs) {
        if (err) throw new Error(err);
        console.log('Storage::fetched', docs);
        if (typeof(callback) === 'function') {
          callback(docs);
        }
      });
    }else if (typeof(callback) === 'function') {
      callback([]);
    }
  }

  remove(collection, query, callback) {
    if (!query) callback(0);
    if (this.hasCollection(collection)) {
      console.log('Storage::remove', collection, query);
      this.db[collection].remove(query, {}, function(err, removed) {
        if (err) throw new Error(err);
        console.log('Storage::remove', removed);
        if (typeof(callback) === 'function') {
          callback(removed);
        }
      });
    }else if (typeof(callback) === 'function') {
      callback(0);
    }
  }
  
  removeMulti(collection, query, callback) {
    if (!query) callback(0);
    if (this.hasCollection(collection)) {
      console.log('Storage::removeMulti', collection, query);
      this.db[collection].remove(query, { multi: true }, function(err, removed) {
        if (err) throw new Error(err);
        console.log('Storage::removeMulti', removed);
        if (typeof(callback) === 'function') {
          callback(removed);
        }
      });
    }else if (typeof(callback) === 'function') {
      callback(0);
    }
  }
}