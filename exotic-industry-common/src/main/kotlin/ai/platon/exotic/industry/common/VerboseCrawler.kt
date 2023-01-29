package ai.platon.exotic.industry.common

import ai.platon.pulsar.common.options.LoadOptions
import ai.platon.pulsar.context.PulsarContext
import ai.platon.pulsar.context.PulsarContexts
import ai.platon.pulsar.dom.FeaturedDocument
import ai.platon.pulsar.persist.WebPage
import ai.platon.pulsar.session.PulsarSession
import org.slf4j.LoggerFactory

open class VerboseCrawler(
    val context: PulsarContext
) {
    private val logger = LoggerFactory.getLogger(VerboseCrawler::class.java)

    open val session: PulsarSession = PulsarContexts.createSession()

    fun loadDocument(url: String, args: String): FeaturedDocument {
        val options = session.options(args)
        return loadDocument(url, options)
    }

    fun loadDocument(url: String, options: LoadOptions): FeaturedDocument {
        val page = session.load(url, options)

        val doc = session.parse(page)
        doc.absoluteLinks()
        doc.stripScripts()

        return doc
    }

    fun detectLinks(url: String, options: LoadOptions) {
        val page = session.load(url, options)

        val doc = session.parse(page)
        doc.absoluteLinks()
        doc.stripScripts()

        doc.selectHyperlinks(options.outLinkSelector)
            .distinct()
            .take(10)
            .joinToString("\n") { it.url }
            .also { println(it) }
    }

    fun loadOutPages(portalUrl: String, args: String): Collection<WebPage> {
        return loadOutPages(portalUrl, LoadOptions.parse(args, session.sessionConfig))
    }

    fun loadOutPages(portalUrl: String, options: LoadOptions): Collection<WebPage> {
        val page = session.load(portalUrl, options)

//        val page = session.load(portalUrl, options)
        if (!page.protocolStatus.isSuccess) {
            logger.warn("Failed to load page | {}", portalUrl)
        }

        val document = session.parse(page)
        document.absoluteLinks()
        document.stripScripts()

        val links = document.select(options.outLinkSelector) { it.attr("abs:href") }
            .mapTo(mutableSetOf()) { session.normalize(it, options) }
            .take(options.topLinks).map { it.spec }
        logger.info("Total {} items to load", links.size)

        val itemOptions = options.createItemOptions().apply { parse = true }

        return session.loadAll(links, itemOptions)
    }
}
