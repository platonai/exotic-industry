package ai.platon.exotic.examples.sites

import ai.platon.pulsar.browser.common.BrowserSettings
import ai.platon.pulsar.browser.common.InteractSettings
import ai.platon.pulsar.context.PulsarContexts

fun main() {
    BrowserSettings.interactSettings = InteractSettings.DEFAULT.noScroll()
    BrowserSettings.withSystemDefaultBrowser()
    val session = PulsarContexts.createSession()
    val args = "-i 7s -ii 7s"

    val url = "https://twitter.com/home"
    val options = session.options(args)
    val be = options.event.browseEvent

    be.onDidScroll.addLast { page, driver ->
        // login
        if (page.url.contains("login")) {
//            driver.findElementByCssSelector("input[name='session[username_or_email]']").sendKeys("username")
//            driver.findElementByCssSelector("input[name='session[password]']").sendKeys("password")
//            driver.findElementByCssSelector("div[data-testid='LoginForm_Login_Button']").click()

            val username = System.getProperty("TWITTER_USERNAME")
            val password = System.getProperty("TWITTER_PASSWORD")
            if (driver.visible("")) {
                driver.type("input[name='session[username_or_email]']", username)
                driver.type("input[name='session[username_or_email]']", password)
                driver.click("div[data-testid='LoginForm_Login_Button']")
            }

            driver.waitForNavigation()
        }
        
        driver.browser.drivers.forEach { url, driver ->
            // println(driver.currentUrl)
        }
    }

    session.load(url, options)
    
    PulsarContexts.await()
    
    readlnOrNull()
}
