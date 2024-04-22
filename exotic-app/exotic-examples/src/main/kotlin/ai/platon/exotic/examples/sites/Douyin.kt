package ai.platon.exotic.examples.sites

import ai.platon.pulsar.common.urls.Hyperlink
import ai.platon.pulsar.context.PulsarContexts

fun main() {
    val session = PulsarContexts.createSession()
    val args = "-i 7s -ii 7s"
    val links = mutableSetOf<Hyperlink>()
    
    val url = "https://www.douyin.com/channel/300204"
    val options = session.options("$args -ol a[href~=/video/]")
    val be = options.event.browseEvent
    be.onDocumentActuallyReady.addLast { page, driver ->
        // close mask
    }
    
    session.load(url, options)
    
    readlnOrNull()
}
