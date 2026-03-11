import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = scene as? UIWindowScene else { return }

        let window = UIWindow(windowScene: windowScene)
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateInitialViewController()

        window.rootViewController = vc
        self.window = window
        window.makeKeyAndVisible()
    }
}
