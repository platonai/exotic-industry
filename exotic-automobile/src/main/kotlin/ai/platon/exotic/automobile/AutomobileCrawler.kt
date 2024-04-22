package ai.platon.exotic.automobile

import ai.platon.exotic.industry.common.VerboseCrawler
import ai.platon.pulsar.common.urls.Hyperlink
import ai.platon.scent.ScentContext
import ai.platon.scent.ql.h2.context.ScentSQLContexts

class AutomobileCrawler(
    context: ScentContext = ScentSQLContexts.create()
): VerboseCrawler(context) {
    private val args = "-i 7s -ii 7s"
    private val links = mutableSetOf<Hyperlink>()

    fun crawlPickup() {
        var url = "https://www.cnpickups.com/pikazixun/"
        var options = session.options("$args -ol a[href~=/news/]")

        collectLinks(url, options).toCollection(links)

        url = "https://www.cnpickups.com/hangyezixun/"
        options = session.options("$args -ol a[href~=/news/]")

        collectLinks(url, options).toCollection(links)
    }

    fun crawlCheshi() {
        var url = "http://news.cheshi.com/jiangjia/"
        var options = session.options("$args -ol a[href*=news]")

        collectLinks(url, options).toCollection(links)

        url = "http://news.cheshi.com/djbd/"
        options = session.options("$args -ol a[href~=/dujia/]")

        collectLinks(url, options).toCollection(links)
    }

    fun crawlAutohome() {
        var url = "https://www.autohome.com.cn/bestauto"
        var options = session.options("$args -ol a[href~=v-]")

        collectLinks(url, options).toCollection(links)

        url = "https://www.autohome.com.cn/all"
        options = session.options("$args -ol a[href~=/news/]")

        collectLinks(url, options).toCollection(links)
    }

    fun crawlMafengwo() {
        var url = "https://www.mafengwo.cn/sales/"
        var options = session.options("$args -ol a[href*=/sales/]")

        collectLinks(url, options).toCollection(links)

        url = "https://www.mafengwo.cn/gonglve/"
        options = session.options("$args -ol a[href~=/gonglve/]")

        collectLinks(url, options).toCollection(links)

        url = "https://www.mafengwo.cn/gonglve/"
        options = session.options("$args -ol a[href~=/i/]")

        collectLinks(url, options).toCollection(links)
    }

    fun loadAll() {
        session.submitAll(links.shuffled())
        session.context.await()
    }
}

fun main() {
    val crawler = AutomobileCrawler()
    crawler.crawlCheshi()
    crawler.crawlPickup()
    crawler.crawlAutohome()
    crawler.crawlMafengwo()
    crawler.loadAll()
}
