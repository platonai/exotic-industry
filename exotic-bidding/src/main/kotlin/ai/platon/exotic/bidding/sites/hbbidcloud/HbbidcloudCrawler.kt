package ai.platon.exotic.bidding.sites.hbbidcloud

import ai.platon.pulsar.browser.common.BrowserSettings
import ai.platon.pulsar.browser.common.InteractSettings
import ai.platon.pulsar.common.Priority13
import ai.platon.pulsar.common.getLogger
import ai.platon.pulsar.common.options.LoadOptions
import ai.platon.pulsar.common.urls.Hyperlink
import ai.platon.pulsar.context.PulsarContexts
import ai.platon.pulsar.crawl.PageEvent
import ai.platon.pulsar.crawl.common.url.ListenableHyperlink
import ai.platon.pulsar.crawl.event.impl.DefaultPageEvent
import ai.platon.pulsar.dom.FeaturedDocument
import ai.platon.scent.context.ScentContexts
import ai.platon.scent.dom.HarvestOptions
import java.util.concurrent.atomic.AtomicInteger

class HbbidcloudCrawler {
    private val logger = getLogger(this)
    private val urls0 = listOf("http://www.hbbidcloud.cn/shengbenji/jyxx/004001/about.html")
    private val urlTemplate = "http://www.hbbidcloud.cn/shengbenji/jyxx/004001/{pageNo}.html"
    private val urlTemplate2 = "http://www.hbbidcloud.cn/shengbenji/jyxx/004001/about.html?categoryNum=004001&pageIndex={pageNo}"
    private val session = ScentContexts.createSession()
    private val interactSettings = InteractSettings(initScrollPositions = "", scrollCount = 0)
    private val submittedCount = AtomicInteger()

    fun crawl() {
        val urls1 = IntRange(1, 13)
            .map { urlTemplate.replace("{pageNo}", "$it") }
        val urls2 = IntRange(101, 167)
            .map { urlTemplate2.replace("{pageNo}", "$it") }

//        val urls = urls1 + urls2
        val urls = urls0

        urls.forEach { url ->
            session.submit(url, createOptions())
        }

        PulsarContexts.await()
    }

    private fun createOptions(): LoadOptions {
        val options = session.options("-i 1d -ignoreFailure -parse")
        val be = options.event.browseEvent

        be.onWillNavigate.addLast { page, driver ->
            page.setVar("InteractSettings", interactSettings)
        }

        be.onDocumentActuallyReady.addLast { page, driver ->

        }

        val le = options.event.loadEvent
        le.onHTMLDocumentParsed.addLast { page, document ->
            val links = document.selectHyperlinks("ul.wb-data-item li a")
                .map { ListenableHyperlink(it.url, event = createItemPageEvent()) }
//                .onEach { it.priority = Priority13.HIGHER2.value }
                .onEach { it.args += " -parse" }
            session.submitAll(links)
            submittedCount.addAndGet(links.size)
            logger.info("Submitted {}/{} item links", links.size, submittedCount)
            null
        }

        return options
    }

    private fun createItemPageEvent(): PageEvent {
        val event = session.options().event

        val le = event.loadEvent
        le.onHTMLDocumentParsed.addLast { page, articleDocument ->
            val title = articleDocument.firstTextOrNull(".news-article h3") ?: ""
            val publishTime = articleDocument.firstTextOrNull(".news-article .ewb-article-sources") ?: ""
            val article = articleDocument.firstTextOrNull(".news-article") ?: ""

            println("" + page.id + ".\t$title | $publishTime | " + page.url)
//            println(title)
//            println(publishTime)
//            println(article.replace("\n", "\t"))
        }

        return event
    }
}

fun main() {
    BrowserSettings.privacy(3).maxTabs(8).headless()
    HbbidcloudCrawler().crawl()
}
