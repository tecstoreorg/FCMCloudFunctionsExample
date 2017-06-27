package com.devlomi.fcmcloudfunctions;

import android.app.IntentService;
import android.content.Intent;
import android.util.Log;

import com.google.firebase.iid.FirebaseInstanceId;

/**
 * An {@link IntentService} subclass for handling asynchronous task requests in
 * a service on a separate handler thread.
 * <p>
 * TODO: Customize class - update intent actions, extra parameters and static
 * helper methods.
 */
public class FCMRegistrationService extends IntentService {

    public FCMRegistrationService() {
        super("FCM");
    }

    @Override
    protected void onHandleIntent(Intent intent) {

        // get token from Firebase
        String token = FirebaseInstanceId.getInstance().getToken();
        if (token != null)
            Log.d("TOKEN is: ", token);

    }

}


