package ai.platon.exotic.industry.common

import ai.platon.pulsar.common.AppPaths
import ai.platon.pulsar.common.NetUtil
import ai.platon.pulsar.common.ProcessLauncher
import ai.platon.pulsar.common.browser.Browsers
import ai.platon.pulsar.common.options.LoadOptions
import ai.platon.pulsar.common.stringify
import ai.platon.pulsar.common.urls.Hyperlink
import ai.platon.pulsar.common.urls.UrlUtils
import ai.platon.pulsar.dom.FeaturedDocument
import ai.platon.pulsar.dom.nodes.node.ext.isRegularText
import ai.platon.pulsar.persist.WebPage
import ai.platon.scent.ScentContext
import ai.platon.scent.analysis.corpus.annotateNodes
import ai.platon.scent.context.ScentContexts
import ai.platon.scent.dom.HarvestOptions
import ai.platon.scent.dom.nodes.AnchorGroup
import ai.platon.scent.dom.nodes.node.ext.nthScreen
import ai.platon.scent.entities.HarvestResult
import ai.platon.scent.ml.EncodeOptions
import ai.platon.scent.ml.data.SimpleDataFrame
import ai.platon.scent.ql.h2.context.ScentSQLContexts
import kotlinx.coroutines.runBlocking
import org.jsoup.nodes.Element
import org.slf4j.LoggerFactory
import java.net.URL
import java.nio.file.Files
import java.util.*
import java.util.concurrent.atomic.AtomicBoolean

open class VerboseCrawler(
    val context: ScentContext = ScentSQLContexts.create()
) : AutoCloseable {
    val logger = LoggerFactory.getLogger(VerboseCrawler::class.java)
    val closed = AtomicBoolean()
    val isActive get() = !closed.get() && session.isActive
    
    val defaultHarvestArgs = "" +
        " -scrollCount 6" +
        " -itemScrollCount 4" +
        " -i 10d -ii 10000d" +
        " -requireSize 10000 -itemRequireSize 200000" +
        " -topLinks 100" +
        " -ignoreFailure" +
        " -showCombinedTable" +
        " -minimalColumnCount 3" +
        " -nScreens 5" +
//      " -polysemous" +
        " -diagnose" +
        " -nVerbose 1" +
//      " -pageLoadTimeout 60s" +
        " -showTip" +
//        " -showImage" +
//      " -cellType PLAIN_TEXT" +
        ""
    
    val session = ScentContexts.createSession()
    
    fun load(url: String, args: String) {
        return load(url, session.options(args))
    }
    
    fun load(url: String, options: LoadOptions) {
        val page = session.load(url)
        val doc = session.parse(page)
        doc.absoluteLinks()
        doc.stripScripts()
        
        doc.select(options.outLinkSelector) { it.attr("abs:href") }.asSequence()
            .filter { UrlUtils.isStandard(it) }
            .mapTo(HashSet()) { it.substringBefore(".com") }
            .asSequence()
            .filter { it.isNotBlank() }
            .mapTo(HashSet()) { "$it.com" }
            .filter { NetUtil.testHttpNetwork(URL(it)) }
            .take(10)
            .joinToString("\n") { it }
            .also { println(it) }
        
        val path = session.export(doc)
        logger.info("Export to: file://{}", path)
    }
    
    fun loadOutPages(portalUrl: String, args: String): Collection<WebPage> {
        return loadOutPages(portalUrl, session.options(args))
    }
    
    fun loadOutPages(portalUrl: String, options: LoadOptions): Collection<WebPage> {
        val page = session.load(portalUrl, options)
        if (!page.protocolStatus.isSuccess) {
            logger.warn("Failed to load page | {}", portalUrl)
        }
        
        val document = session.parse(page)
        document.absoluteLinks()
        document.stripScripts()
        val path = session.export(document)
        logger.info("Portal page is exported to: file://$path")
        
        val links = document.select(options.outLinkSelector) { it.attr("abs:href") }
            .mapTo(mutableSetOf()) { session.normalize(it, options) }
            .take(options.topLinks).map { it.spec }
        logger.info("Total {} items to load", links.size)
        
        val itemOptions = options.createItemOptions().apply { parse = true }
        return session.loadAll(links, itemOptions)
    }
    
    fun collectLinks(url: String, options: LoadOptions): List<Hyperlink> {
        val page = session.load(url, options)
        
        val doc = session.parse(page)
        doc.absoluteLinks()
        doc.stripScripts()
        
        val links = doc.selectHyperlinks(options.outLinkSelector)
            .distinct()
        
        links.take(10)
            .joinToString("\n") { it.url }
            .also { println(it) }
        
        return links
    }
    
    fun parseOutLinks(portalUrl: String, args: String): List<String> {
        val normUrl = session.normalize(portalUrl, session.options(args))
        val options = normUrl.hOptions
        val portalPage = session.load(normUrl)
        val portalDocument = session.parse(portalPage)
        return portalDocument.select(options.outLinkSelector)
            .take(options.topLinks)
            .map { it.attr("abs:href") }
    }
    
    fun arrangeLinks(portalUrl: String, args: String): SortedSet<AnchorGroup> {
        val normUrl = session.normalize(portalUrl, session.options(args))
        val portalPage = session.load(normUrl)
        val portalDocument = session.parse(portalPage)
        return session.arrangeLinks(normUrl, portalDocument)
    }
    
    fun arrangeDocument(portalUrl: String, args: String): AnchorGroup? {
        val normUrl = session.normalize(portalUrl, session.options(args))
        val options = normUrl.hOptions
        val portalPage = session.load(normUrl)
        val portalDocument = session.parse(portalPage)
        val anchorGroups = session.arrangeLinks(normUrl, portalDocument)
        
        logger.info("------------------------------")
        anchorGroups.take(1).forEach {
            it.urlStrings.shuffled().take(10).forEachIndexed { i, url -> println("${1 + i}.\t$url") }
            it.urlStrings.take(options.topLinks)
                .map { session.load(it, options) }
                .map { session.parse(it, options) }
                .let { session.arrangeDocuments(normUrl, portalPage, it.asSequence()) }
        }
        
        portalDocument.also { it.annotateNodes(options) }.also { session.export(it, type = "portal") }
        
        return anchorGroups.firstOrNull()
    }
    
    fun encodeOutDocuments(portalUrl: String, args: String, encodeOptions: EncodeOptions): SimpleDataFrame {
        val urls = parseOutLinks(portalUrl, args).map { session.normalize(it).spec }
        return session.encodeNodes(urls, args, encodeOptions) { it.isRegularText && it.nthScreen <= 2 }
    }
    
    fun encodeDocuments(
        documents: Iterable<FeaturedDocument>, encodeOptions: EncodeOptions
    ) = session.encodeDocuments(documents, encodeOptions) { it.isRegularText && it.nthScreen <= 2 }
    
    fun encodeElements(
        rootElements: Iterable<Element>, encodeOptions: EncodeOptions
    ) = session.encodeElements(rootElements, encodeOptions) { it.isRegularText && it.nthScreen <= 2 }
    
    fun harvest(url: String, args: String) = harvest(url, session.options(args))
    
    fun harvest(url: String, options: HarvestOptions): HarvestResult {
        val result = runBlocking { session.harvest(url, options) }
        report(result, options)
        return result
    }
    
    fun harvest(urls: Iterable<String>, args: String) =
        harvest(urls.asSequence().map { session.loadDocument(it) }, session.options(args))
    
    fun harvest(documents: Sequence<FeaturedDocument>, options: HarvestOptions): HarvestResult {
        val result = session.harvest(documents, options)
        logger.info("Harvest finished.")
        logger.info("Ready to report the harvest result ...")
        report(result, options)
        return result
    }
    
    fun report(result: HarvestResult, options: HarvestOptions) {
        try {
            session.buildAll(result.tableGroup, options)
            
            val json = session.buildJson(result.tableGroup)
            val path = AppPaths.REPORT_DIR.resolve("harvest/corpus/last-page-tables.json")
            val baseDir = path.parent
            Files.createDirectories(baseDir)
            Files.writeString(path, json)
            
            logger.info("Harvest result: file://$baseDir")
            
            // openBrowser("$baseDir")
        } catch (e: Exception) {
            logger.warn(e.stringify("Failed to report harvest result - "))
        }
    }
    
    fun openBrowser() {
        val path = AppPaths.REPORT_DIR.resolve("harvest/corpus/last-page-tables.json")
        val baseDir = path.parent
        openBrowser(baseDir.toString())
    }
    
    fun openBrowser(url: String) {
        val chromeBinary = Browsers.searchChromeBinary()
        val dataDir = AppPaths.getTmp("exotic-chrome")
        val args = listOf(
            url,
            "--user-data-dir=$dataDir",
            "--no-first-run",
            "--no-default-browser-check"
        )
        ProcessLauncher.launch("$chromeBinary", args)
    }
    
    override fun close() {
        if (closed.compareAndSet(false, true)) {
        }
    }
}
