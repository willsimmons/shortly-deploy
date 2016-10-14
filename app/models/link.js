var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');



var urlSchema = new mongoose.Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: {type: Number, default: 0},
  timestamps: {type: Date, default: Date.now} // Date.now
});

var Link = mongoose.model('Link', urlSchema);
// urlSchema.methods.shorten = function(cb) {
//   var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       this.set('code', shasum.digest('hex').slice(0, 5));
//   return this.model('Link').
// }
// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

module.exports = Link;
