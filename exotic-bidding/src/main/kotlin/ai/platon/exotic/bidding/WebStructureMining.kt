package ai.platon.exotic.bidding

import ai.platon.exotic.bidding.common.VerboseHarvester
import ai.platon.pulsar.common.LinkExtractors
import ai.platon.scent.ScentContext
import ai.platon.scent.ql.h2.context.ScentSQLContexts

class WebStructureMining(
    context: ScentContext = ScentSQLContexts.create()
): VerboseHarvester(context) {

    private val seeds = LinkExtractors.fromResource("seeds/bidding.txt").toList()
    private val args = """-requireSize 1000 -requireItemSize 1000 -ignoreFailure"""

    fun arrangeDocuments() {
        seeds.map { "$it $args" }.forEach { url ->
            arrangeDocument(url)
        }
    }

    fun harvest() {
        val url = seeds[0]
        harvest(url, "$defaultArgs $args")
    }

    fun loadAll() {
        session.loadAll(seeds.map { "$it $args" })
    }

    fun harvestAll() {
//        seeds.forEach { println(it) }
        seeds.forEach { harvest(it, "$defaultArgs $args") }
    }
}

fun main() {
//    BrowserSettings.headless()
    val miner = WebStructureMining()
    miner.harvest()
    // miner.harvestAll()
}
