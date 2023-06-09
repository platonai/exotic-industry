package ai.platon.exotic.bidding.sites.aiqicha

import ai.platon.pulsar.browser.common.BrowserSettings
import ai.platon.pulsar.common.Systems
import ai.platon.pulsar.common.browser.BrowserType
import ai.platon.pulsar.common.config.CapabilityTypes
import ai.platon.pulsar.common.getLogger
import ai.platon.pulsar.common.options.LoadOptions
import ai.platon.pulsar.context.PulsarContexts
import ai.platon.pulsar.dom.Documents
import ai.platon.pulsar.dom.FeaturedDocument
import ai.platon.scent.context.ScentContexts
import kotlinx.coroutines.delay

class AiqichaCrawler {
    private val logger = getLogger(this)
    private val urls = listOf("https://aiqicha.baidu.com/detail/compinfo?pid=29249802271510&rq=ef&pd=ee&from=ps&tab=operatingCondition")
    private val session = ScentContexts.createSession()

    fun crawl() {
        Systems.setProperty(CapabilityTypes.PRIVACY_CONTEXT_ID_GENERATOR_CLASS, "ai.platon.pulsar.crawl.fetch.privacy.SystemDefaultPrivacyContextIdGenerator")

        urls.forEach { url ->
            session.submit(url, createOptions())
        }

        PulsarContexts.await()
    }

    private fun createOptions(): LoadOptions {
        val options = session.options("-refresh")
        val be = options.event.browseEvent

        be.onWillNavigate.addLast { page, driver ->
        }

        be.onDocumentActuallyReady.addLast { page, driver ->
            val nextAnchorSelector = "#operatingCondition-tenderbidding .ivu-page-next"
            driver.scrollTo(nextAnchorSelector)
            val dataSelector = "#operatingCondition-tenderbidding table"

            val baseURI = driver.evaluate("document.baseURI")?.toString() ?: page.url
            val destinationDocument = FeaturedDocument.createShell(baseURI)
            destinationDocument.head.append("<meta charset=\"UTF-8\">")
            driver.scrollTo(nextAnchorSelector)

            var pageNumber = 1
            var timeoutSeconds = 120
            while (timeoutSeconds-- > 0 && pageNumber < 20) {
                driver.scrollTo(nextAnchorSelector)
                if (driver.isVisible(nextAnchorSelector)) {
                    ++pageNumber

                    val outerHTML = driver.outerHTML(dataSelector)
                    if (outerHTML != null) {
                        destinationDocument.document.body().append(outerHTML)
                        destinationDocument.absoluteLinks()
                    }

//                    val records = driver.allTexts(dataSelector)
//                    val links = driver.allAttrs("$dataSelector a", "href")
//                    println(page.url)
//                    records.forEach { println(it) }
//                    links.forEach { println(it) }

                    driver.click(nextAnchorSelector)
                } else {
                    if (pageNumber >= 10) {
                        break
                    }
                }

                delay(1000)
            }

            val path = session.export(destinationDocument)
            logger.info("Document exported | {}", path)

            null
        }

        return options
    }
}

fun main() {
    BrowserSettings.privacy(1).withSPA().withSystemDefaultBrowser()
    AiqichaCrawler().crawl()
    readLine()
}
