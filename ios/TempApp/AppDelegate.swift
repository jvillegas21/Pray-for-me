import UIKit
import React

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    let jsCodeLocation: URL?

#if DEBUG
    jsCodeLocation = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    jsCodeLocation = Bundle.main.url(forResource: "main", withExtension: "jsbundle") ?? RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#endif

    guard let bundleURL = jsCodeLocation else {
      print("❌ Failed to get JavaScript bundle URL. Make sure Metro server is running.")
      return false
    }

    let rootView = RCTRootView(
      bundleURL: bundleURL,
      moduleName: "TempApp",
      initialProperties: nil,
      launchOptions: launchOptions
    )

    let rootViewController = UIViewController()
    rootViewController.view = rootView

    window = UIWindow(frame: UIScreen.main.bounds)
    window?.rootViewController = rootViewController
    window?.makeKeyAndVisible()

    return true
  }
}
