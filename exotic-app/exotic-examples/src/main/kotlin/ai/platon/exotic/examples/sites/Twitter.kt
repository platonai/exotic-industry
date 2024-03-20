package ai.platon.exotic.examples.sites

import ai.platon.pulsar.browser.common.BrowserSettings
import ai.platon.pulsar.context.PulsarContexts

fun main() {
    BrowserSettings.withSystemDefaultBrowser()
    val session = PulsarContexts.createSession()
    val args = "-i 7s -ii 7s"

    val url = "https://twitter.com/home"
    val options = session.options(args)
    val be = options.event.browseEvent
    
    be.onDidScroll.addLast { page, driver ->
        // close mask
    }
    
    session.load(url, options)
    
    PulsarContexts.await()
    
    readlnOrNull()
}
