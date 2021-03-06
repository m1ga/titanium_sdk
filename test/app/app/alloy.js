var Adjust = require('ti.adjust');
var AdjustTest = require('ti.adjust.test');
var CommandExecutor = require('command_executor');

if (OS_ANDROID) {
    var platformTools = require('bencoding.android.tools').createPlatform(), wasInForeground = true;
    setInterval(function() {
        var isInForeground = platformTools.isInForeground();
        if (wasInForeground !== isInForeground) {
            Ti.App.fireEvent(isInForeground ? 'resumed' : 'paused');
            wasInForeground = isInForeground;
        }
    }, 1000);
}

if (OS_IOS) {
    Ti.App.iOS.addEventListener('continueactivity', function(e) {
        if (e.activityType === "NSUserActivityTypeBrowsingWeb"){
            var deeplink = e.webpageURL;
            if (deeplink) {
                Ti.API.info("[AdjustTest]: URL = " + deeplink);
                Adjust.appWillOpenUrl(deeplink);
            }
        }
    });
    Ti.App.addEventListener('resumed', function() {
        var args = Ti.App.getArguments();
        if (args.url) {
            Ti.API.info("[AdjustTest]: URL = " + args.url);
            Adjust.appWillOpenUrl(args.url);
        }
    });
} else if (OS_ANDROID) {
    var activity = Ti.Android.currentActivity;
    var url = activity.getIntent().getData(); 
    if (url) {
        Ti.API.info("[AdjustTest]: URL = " + url);
        Adjust.appWillOpenUrl(url);
    }
}

(function() {
    var baseUrl = "";
    var gdprUrl = "";

    // var baseAddress = "10.0.2.2"; // Emulator Android
    // var baseAddress = "127.0.0.1"; // Emulator iOS
    // var baseAddress = "192.168.9.145"; // Device

    if (OS_ANDROID) {
        baseUrl = "https://10.0.2.2:8443";
        gdprUrl = "https://10.0.2.2:8443";
    } else if (OS_IOS) {
        baseUrl = "http://127.0.0.1:8080";
        gdprUrl = "http://127.0.0.1:8080";
    }

    Ti.API.info('[AdjustTest]: Connecting to: ' + baseUrl);
    var commandExecutor = new CommandExecutor(baseUrl, gdprUrl);

    Ti.API.info('[AdjustTest]: Initializing Adjust Test Library ...');
    AdjustTest.initialize(baseUrl, function(json, order) {
        var jsonObject = JSON.parse(json);
        const className = jsonObject["className"];
        const functionName = jsonObject["functionName"];
        const params = jsonObject["params"];
        commandExecutor.scheduleCommand(className, functionName, params, order);
    });

    // AdjustTest.addTestDirectory("current/deeplink-deferred/");
    // AdjustTest.addTestDirectory("current/event-callbacks");
    // AdjustTest.addTest("current/deeplink-deferred/Test_DeferredDeeplink");
    // AdjustTest.addTest("current/event-callbacks/Test_EventCallback_success_callbackId_persistence");

    Adjust.getSdkVersion(function(sdkVersion) {
        AdjustTest.startTestSession(sdkVersion);
    });
})();
