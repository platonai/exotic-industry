package ai.platon.exotic.bidding

import ai.platon.exotic.bidding.common.VerboseHarvester
import ai.platon.pulsar.browser.common.BrowserSettings
import ai.platon.pulsar.common.LinkExtractors
import ai.platon.pulsar.context.PulsarContexts
import ai.platon.scent.ScentContext
import ai.platon.scent.ql.h2.context.ScentSQLContexts

class WebStructureMining(
    context: ScentContext = ScentSQLContexts.create()
): VerboseHarvester(context) {

    private val seeds = LinkExtractors.fromResource("seeds/bidding-portal.txt").toList().shuffled()
    private val args = """-requireSize 1000 -requireItemSize 1000 -ignoreFailure"""

    fun arrangeDocuments() {
        seeds.map { "$it $args" }.forEach { url ->
            arrangeDocument(url, args)
        }
    }

    fun loadAllArrangedLinks() {
        seeds.map { "$it $args" }.forEach { url ->
            if (session.isActive) {
                submitAllArrangedLinks(url, "-topLinks 100")
            }
        }
    }

    fun harvest() {
        val url = seeds[0]
        harvest(url, "$defaultArgs $args")
    }

    fun loadAll() {
        session.loadAll(seeds.map { "$it $args" })
    }

    fun loadOutPages() {
        seeds.map { "$it $args" }.forEach {
            if (session.isActive) {
                arrangeDocument(it, "-topLinks 100")
            }
        }
    }

    fun harvestAll() {
//        seeds.forEach { println(it) }
        seeds.forEach {
            if (session.isActive) {
                harvest(it, "$defaultArgs $args")
            }
        }
    }
}

fun main() {
    BrowserSettings.privacy(2).maxTabs(8).headless()
    val miner = WebStructureMining()
    miner.loadOutPages()
//    miner.loadAllArrangedLinks()
//    miner.arrangeDocuments()
//    miner.harvest()
    // miner.harvestAll()
    PulsarContexts.await()
}
