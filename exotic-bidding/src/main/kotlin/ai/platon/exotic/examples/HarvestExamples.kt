package ai.platon.exotic.examples

import ai.platon.exotic.examples.common.VerboseHarvester
import ai.platon.pulsar.browser.common.BrowserSettings
import ai.platon.pulsar.common.LinkExtractors
import ai.platon.pulsar.common.ResourceLoader
import ai.platon.scent.ScentContext
import ai.platon.scent.ql.h2.context.ScentSQLContexts
import org.slf4j.LoggerFactory

class HarvestExamples(
    context: ScentContext = ScentSQLContexts.create()
): VerboseHarvester(context) {

    private val seeds = LinkExtractors.fromResource("seeds/bidding.txt").toList()

    fun arrangeDocuments() {
        listOf(seeds).flatten().filter { it.isNotBlank() }.forEach { url ->
            arrangeDocument(url)
        }
    }

    fun harvest() {
        val url = seeds[0]
        harvest(url)
    }

    fun harvestAll() {
//        seeds.forEach { println(it) }
        seeds.forEach { harvest(it) }
    }
}

fun main() {
//    BrowserSettings.headless()
    HarvestExamples().harvestAll()
}
