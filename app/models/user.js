// Example model

var mongoose = require('mongoose'),
   md5 = require('md5'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: { type:String,require:true},
  email: { type:String,require:true},
  password: { type:String,require:true},
  slug: { type:String,require:true},
  created:{type:Date}
});

UserSchema.methods.verifyPassword = function(password){
	var isMatch = md5(password) === this.password;
	console.log('UserSchema.methods.verifyPassword',password,this.password,isMatch);
	return isMatch;
}

mongoose.model('User', UserSchema);

