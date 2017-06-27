//Cloud Functions Modules
const functions = require('firebase-functions');
//Firebase Admin SDK Modules (it will send the Notifications to the user)
const admin = require('firebase-admin');
//init Admin SDK
admin.initializeApp(functions.config().firebase);

exports.sendNotificationOnNewFollow = functions.database.ref('/followers/{userId}/{followerId}/').onWrite(event => {
  const userId = event.params.userId;
  const followerId = event.params.followerId

  // If un-follow we exit the function.
  if (!event.data.exists()) {
    return;
  }

 
  // Get the list of device notification tokens.
  const getDeviceTokensPromise = admin.database().ref(`users/${userId}/notificationTokens/`).once('value');
  // Get the follower Info.
  const getFollowerInfo = admin.database().ref(`users/${followerId}/`).once('value');
  
//Execute the Functions
  return Promise.all([getDeviceTokensPromise, getFollowerInfo]).then(results => {
    const tokensSnapshot = results[0];
    const followerSnapshot = results[1];
  


    // Check if there are any device tokens.
    if (!tokensSnapshot.hasChildren()) {
      return console.log('There are no notification tokens to send to.');
    }

  const followerName = followerSnapshot.val().userName;
  const followerPhoto = followerSnapshot.val().photo;

    console.log('Follower Name is: ', followerName);
    console.log('Follower Photo is: ', followerPhoto);
    

    // Notification details.
    const payload = {
      data: {
        title: 'you have a New Follower',
        body: `${followerName} has followed You.`,
        imgUrl:  `${followerPhoto}`
      }
    };



    // Listing all tokens.
    const tokens = Object.keys(tokensSnapshot.val());

    // Send notifications to all tokens.
    return admin.messaging().sendToDevice(tokens, payload).then(response => {
      // For each message check if there was an error.
      const tokensToRemove = [];
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error('Failure sending notification to', tokens[index], error);
          // Cleanup the tokens who are not registered anymore.
          if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
          }
        }
      });
      return Promise.all(tokensToRemove);
    });
  });
});
