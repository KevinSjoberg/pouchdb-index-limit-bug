const assert = require('assert')
const PouchDB = require('pouchdb');

PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-debug'));

const local = new PouchDB('tmp/dbs/local');
const remote = new PouchDB('tmp/dbs/remote');

(async () => {
  await remote.createIndex({ index: { fields: ['type', '_id'] } });
  await remote.bulkDocs([
    { _id: '1', type: 'style' },
    { _id: '2', type: 'style' },
    { _id: '3', type: 'style' },
    { _id: '4', type: 'style' },
  ]);

  await local.replicate.from(remote);
  const { docs: page1 } =  await local.find({
    selector: {
      type: { $eq: 'style' },
      _id: { $gt: null }
    },
    limit: 2
  });

  if (page1.length !== 2 || page1[0]._id !== '1' || page1[1]._id !== '2') {
    console.error('expected ids 1 and 2, got', page1.map(doc => doc._id));
  }

  const { docs: page2 } = await local.find({
    selector: {
      type: { $eq: 'style' },
      _id: { $gt: '2' }
    },
    limit: 2
  });

  if (page2.length !== 2 || page2[0]._id !== '3' || page2[1]._id !== '4') {
    console.error('expected ids 3 and 4, got', page2.map(doc => doc._id));
  }
})()
