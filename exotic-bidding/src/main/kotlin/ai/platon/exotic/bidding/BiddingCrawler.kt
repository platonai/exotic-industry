package ai.platon.exotic.bidding

import ai.platon.exotic.bidding.common.VerboseCrawler
import ai.platon.pulsar.browser.common.BrowserSettings
import ai.platon.pulsar.common.LinkExtractors
import ai.platon.pulsar.context.PulsarContexts
import ai.platon.scent.ScentContext
import ai.platon.scent.ql.h2.context.ScentSQLContexts

class BiddingCrawler(
    context: ScentContext = ScentSQLContexts.create()
): VerboseCrawler(context) {
    private val seeds = LinkExtractors.fromResource("seeds/bidding-detail.txt").toList().shuffled()
    
    fun crawl() {
        session.submitAll(seeds)
    }
}

fun main() {
    BrowserSettings.privacy(2).maxTabs(8)
    val crawler = BiddingCrawler()
    crawler.crawl()
    PulsarContexts.await()
}
