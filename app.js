// set up ========================
//import * as admin from 'firebase-admin';     

var express = require('express');
var app = express();
var admin = require('firebase');
var bodyParser = require('body-parser');
var key;
var key_del;
var pass;
var user_delete_ref;
var createFriend;
app.use(function (req, res, next) { //allow cross origin requests
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
	res.header("Access-Control-Max-Age", "3600");
	res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
	next();
});
admin.initializeApp({
	databaseURL: "https://dangnhap-1d025.firebaseio.com",
	serviceAccount: './testapp.json',
});
var db = admin.database();
var usersRef = db.ref("users");
// configuration  
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.sendfile('./index.html')
})


// create user
app.post('/api/createUser', function (req, res) {
	var data = req.body;
	usersRef.push(data, function (err) {
		if (err) {
			res.send(err)
		} else {
			usersRef.once("child_added", function (snapshot) {
				res.json({ message: "Success: User Save.", result: true, "data": usersRef.push().key });
			});
		}
	});
});

//createFriend
app.post('/api/createFriend', function (req, res) {
	var uid = req.body.friend_of_user_name
	var data = req.body.data;
	usersRef.orderByChild("user_name").equalTo(uid).on('value', snapshot => {
		if (snapshot.val() != '' && snapshot.val() != null) {
			snapshot.forEach(function (childSnapshot) {
				key = childSnapshot.key;
				console.log(key);
			});
			createFriend = admin.database().ref("users/"+key+"/Friend")
			createFriend.push(data, function (err) {
				if (err) {
					res.send(err)
				} else {
					usersRef.once("child_added", function (snapshot) {
						res.json({ message: "Success: User Save.", result: true, "data": usersRef.push().key });
					});
				}
			});
		}else{

		}
	})
});

// update user
app.put('/api/updateUser', function (req, res) {
	var uid = req.body.user_name;
	var data = req.body;
	usersRef.orderByChild("user_name").equalTo(uid).on('value', function (snapshot) {
		if (snapshot.val() != '' && snapshot.val() != null) {
			snapshot.forEach(function (childSnapshot) {
				key = childSnapshot.key;
				console.log(key);
			});
			usersRef.child(key).update(data, function (err) {
				if (err) {
					res.send(err);
				} else {
					usersRef.child(key).once("value", function (snapshot) {
						if (snapshot.val() == null) {
							res.json({ message: "Error: No user found", "result": false });
						} else {
							res.json({ "message": "successfully update data", "result": true, "data": snapshot.val() });
						}
					});
				}
			})
		} else {
			return res.json({ "message": "Error: No user found", "user": req.body.user_name });
		}
	})

});

// delete user
app.delete('/api/removeUser', function (req, res) {
	var uid1 = req.body.user_name;
	var uid2 = req.body.user_name_delete
	usersRef.orderByChild("user_name").equalTo(uid1).on('value', function (snapshot) {
		snapshot.forEach(function (childSnapshot) {
			key = childSnapshot.key;
			console.log(key);
		});
		user_delete_ref = admin.database().ref("users/" + key +"/Friend");
		user_delete_ref.orderByChild("user_name").equalTo(uid2).on('value', function (snapshot) {
			snapshot.forEach(function (childSnapshot) {
				key_del = childSnapshot.key;
				console.log(key);
			});
			user_delete_ref.child(key_del).remove(function (err) {
				if (err) {
					res.send(err);
				} else {
					res.json({ message: "Success: User deleted.", result: true });
				}
			})
		})
	})
});

// get users
app.post('/api/getUsers', function (req, res) {
	var uid = req.body.user_name;
	if (uid.length <= 2) {
		res.json({ message: "Error: uid must be long." });
	} else {
		usersRef.orderByChild("user_name").equalTo(uid).on('value', snapshot => {
			if (snapshot.val() != '' && snapshot.val() != null) {
				snapshot.forEach(function (childSnapshot) {
					key = childSnapshot.key;
					console.log(key);
				});
				var infouser = admin.database().ref("users").child(key)
				infouser.on("value", function (snapshot) {
					//console.log(snapshot);
					if (snapshot.val() == null) {
						res.json({ message: "Error: No user found", "result": false });
					} else {
						res.json({ "message": "successfully fetch data", "result": true, "data": snapshot.val() });
					}
				});
			} else {
				res.json({ message: "Error: No user found", "result": false });
			}
		})
	}
});

//getFriend
app.post('/api/getFriend', function (req, res) {
	var uid = req.body.user_name;
	if (uid.length <= 2) {
		res.json({ message: "Error: uid must be long." });
	} else {
		usersRef.orderByChild("user_name").equalTo(uid).on('value', snapshot => {
			if (snapshot.val() != '' && snapshot.val() != null) {
				snapshot.forEach(function (childSnapshot) {
					key = childSnapshot.key;
					console.log(key);
				});
				var getFriend = admin.database().ref("users/"+key+"/Friend")
				getFriend.on("value", function (snapshot) {
					//console.log(snapshot);
					if (snapshot.val() == null) {
						res.json({ message: "Error: No user found", "result": false });
					} else {
						res.json({ "message": "successfully fetch data", "result": true, "data": snapshot.val() });
					}
				});
			} else {
				res.json({ message: "Error: No user found", "result": false });
			}
		})
	}
});

//login
app.post('/api/login', function (req, res) {
	usersRef.orderByChild("name").equalTo(req.body.user_name).on('value', function (snapshot) {
		snapshot.forEach(function (childSnapshot) {
			pass = childSnapshot.password;
			console.log(pass);
		});
		if (pass = req.body.password && req.body.password != '') {
			return res.json({ "message": "success", "result": true });
		} else {
			return res.json({ "message": "Invalid Username or Password.", "user": req.body.user_name, "test": snapshot.val() });
		}
	});

});

app.listen(3000);
console.log("port is 3000");