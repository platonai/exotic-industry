package ai.platon.exotic.industry.common

import ai.platon.pulsar.common.AppPaths
import ai.platon.pulsar.common.config.CapabilityTypes
import ai.platon.pulsar.common.sql.ResultSetFormatter
import ai.platon.pulsar.common.urls.UrlUtils
import ai.platon.pulsar.dom.FeaturedDocument
import ai.platon.pulsar.dom.nodes.node.ext.ExportPaths
import ai.platon.scent.ScentContext
import ai.platon.scent.ScentSession
import ai.platon.scent.dom.HNormUrl
import ai.platon.scent.dom.HarvestOptions
import ai.platon.scent.dom.nodes.AnchorGroup
import ai.platon.scent.dom.nodes.annotateNodes
import ai.platon.scent.entities.HarvestResult
import ai.platon.scent.ql.h2.context.ScentSQLContexts
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import java.nio.file.Files
import java.time.Duration
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

open class VerboseHarvester(
    context: ScentContext = ScentSQLContexts.create()
): VerboseCrawler(context) {

    private val logger = LoggerFactory.getLogger(VerboseHarvester::class.java)
    private val counter = AtomicInteger(0)
    private val taskTimes = ConcurrentHashMap<String, Duration>()
    override val session: ScentSession = context.createSession()

    init {
        System.setProperty(CapabilityTypes.BROWSER_IMAGES_ENABLED, "true")
    }

    val defaultArgs = "" +
//                " -scrollCount 6" +
//                " -itemScrollCount 4" +
            " -nScreens 5" +
//                " -polysemous" +
            " -diagnose" +
            " -nVerbose 1" +
            " -preferParallel false" +
//                " -pageLoadTimeout 60s" +
            " -showTip" +
            " -showImage" +
//                " -cellType PLAIN_TEXT" +
            ""

    fun arrangeLinks(portalUrl: String): SortedSet<AnchorGroup> {
        logger.info("Arranging links in page $portalUrl")
        val normUrl = HNormUrl.parse(portalUrl, session.sessionConfig.toVolatileConfig())
        val doc = session.load(portalUrl).let { session.parse(it) }
        doc.also { it.annotateNodes(normUrl.hOptions) }.also { session.export(it) }
        return session.arrangeLinks(normUrl, doc)
    }

    fun arrangeLinks(portalUrls: List<String>): List<SortedSet<AnchorGroup>> {
        return  portalUrls.map { url -> arrangeLinks(url) }
    }

    fun printAnchorGroups(anchorGroups: Collection<AnchorGroup>, showBestGroups: Boolean = false) {
        if (anchorGroups.isEmpty()) {
            return
        }

        println(anchorGroups.first().urlStrings.first())
        println(ResultSetFormatter(AnchorGroup.toResultSet(anchorGroups), withHeader = true))
        if (showBestGroups) {
            println("The urls in the best group: ")
            anchorGroups.first().anchorSpecs.forEachIndexed { i, anchorSpec ->
                println("${i.inc()}.\t${anchorSpec.url}")
            }
        }
    }

    fun submitAllArrangedLinks(portalUrl: String, args: String = "") {
        val normUrl = session.normalize(portalUrl, session.options(args))
        val options = normUrl.hOptions
        val itemOptions = options.createItemOptions()
        val portalPage = session.load(normUrl)
        val portalDocument = session.parse(portalPage)
        val anchorGroups = session.arrangeLinks(normUrl, portalDocument)

        logger.info("------------------------------")
        // Take the best group
        anchorGroups.take(1).forEach {
            val n = 10
            logger.info("Top group has {} links, showing {} random links", it.size, n)
            it.urlStrings.shuffled().take(n).forEachIndexed { i, url -> println("${1 + i}.\t$url") }

            val urls = it.urlStrings.take(options.topLinks)
            session.submitAll(urls, itemOptions)
        }

        portalDocument.also { it.annotateNodes(options) }.also { session.export(it, type = "portal") }
    }

    fun arrangeDocument(portalUrl: String, args: String = "") {
        val normUrl = session.normalize(portalUrl, session.options(args))
        val options = normUrl.hOptions
        val itemOptions = options.createItemOptions()
        val portalPage = session.load(normUrl)
        val portalDocument = session.parse(portalPage)
        val anchorGroups = session.arrangeLinks(normUrl, portalDocument)

        logger.info("------------------------------")
        // Take the best group
        anchorGroups.take(1).forEach {
            val n = 10
            logger.info("Top group has {} links, showing {} random links", it.size, n)
            it.urlStrings.shuffled().take(n).forEachIndexed { i, url -> println("${1 + i}.\t$url") }

            val itemUrls = it.urlStrings.take(options.topLinks)
            val pages = session.loadAll(itemUrls, itemOptions).filter { it.contentLength > 1000 }
            val documents = pages.map { session.parse(it) }
            val visualDocuments = session.arrangeDocuments(normUrl, portalPage, documents)

            // do something with the visual documents


//            val domain = AppPaths.fromDomain(portalUrl)
            documents.forEachIndexed { i, doc ->
                val ident = counter.incrementAndGet() % 7
                val fileName = AppPaths.fromUri(doc.baseUri, "", ".htm")
                doc.annotateNodes(options)
                val path = ExportPaths.get("annotated", "$ident").resolve(fileName)
                Files.createDirectories(path.parent)
                session.exportTo(doc, path, type = "annotated")
            }
        }

        portalDocument.also { it.annotateNodes(options) }.also { session.export(it, type = "portal") }
    }

    fun harvest(url: String, args: String = "") = harvest(url, session.options(args))

    fun harvest(url: String, options: HarvestOptions) = harvest(session, url, options)

    fun harvest(documents: List<FeaturedDocument>, options: HarvestOptions): HarvestResult {
        val result = runBlocking { session.harvest(documents, options) }
        report(result, options)
        return result
    }

    fun harvest(session: ScentSession, url: String, options: HarvestOptions) {
        val (url0, args0) = UrlUtils.splitUrlArgs(url)
        val result = runBlocking { session.harvest(url0, session.options("$options $args0")) }
        report(result, options)
    }

    private fun report(result: HarvestResult, options: HarvestOptions) {
        val exports = session.buildAll(result.tableGroup, options)

        val json = session.buildJson(result.tableGroup)
        val path = AppPaths.REPORT_DIR.resolve("harvest/corpus/last-page-tables.json")
        Files.createDirectories(path.parent)
        Files.writeString(path, json)

        logger.info("Harvest reports: {}", path.parent)
//        exports.keys.map { it.toString() }
//            .filter { it.matches(".+/tables/.+".toRegex()) }
//            .forEach { ExoticUtils.openBrowser(it) }
    }
}
