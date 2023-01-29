package ai.platon.exotic.automobile

import ai.platon.exotic.industry.common.VerboseCrawler
import ai.platon.scent.ScentContext
import ai.platon.scent.ql.h2.context.ScentSQLContexts

class AutomobileCrawler(
    context: ScentContext = ScentSQLContexts.create()
): VerboseCrawler(context) {
    private val args = "-i 7s -ii 7s"

    fun crawlDouyin() {
        val url = "https://www.douyin.com/channel/300204"
        val options = session.options("$args -ol a[href~=/video/]")
        val be = options.event.browseEvent
        be.onDocumentActuallyReady.addLast { page, driver ->
            // close mask
        }

        detectLinks(url, options)
        loadOutPages(url, options)
    }

    fun crawlPickup() {
        var url = "https://www.cnpickups.com/pikazixun/"
        var options = session.options("$args -ol a[href~=/news/]")

        detectLinks(url, options)
        loadOutPages(url, options)

        url = "https://www.cnpickups.com/hangyezixun/"
        options = session.options("$args -ol a[href~=/news/]")

        detectLinks(url, options)
        loadOutPages(url, options)
    }

    fun crawlCheshi() {
        var url = "http://news.cheshi.com/jiangjia/"
        var options = session.options("$args -ol a[href*=news]")

        detectLinks(url, options)
        loadOutPages(url, options)

        url = "http://news.cheshi.com/djbd/"
        options = session.options("$args -ol a[href~=/dujia/]")

        detectLinks(url, options)
        loadOutPages(url, options)
    }

    fun crawlAutohome() {
        var url = "https://www.autohome.com.cn/bestauto"
        var options = session.options("$args -ol a[href~=v-]")

        detectLinks(url, options)
        loadOutPages(url, options)

        url = "https://www.autohome.com.cn/all"
        options = session.options("$args -ol a[href~=/news/]")

        detectLinks(url, options)
        loadOutPages(url, options)
    }

    fun crawlMafengwo() {
        var url = "https://www.mafengwo.cn/sales/"
        var options = session.options("$args -ol a[href*=/sales/]")

        detectLinks(url, options)
        loadOutPages(url, options)

        url = "https://www.mafengwo.cn/gonglve/"
        options = session.options("$args -ol a[href~=/gonglve/]")

        detectLinks(url, options)
        loadOutPages(url, options)

        url = "https://www.mafengwo.cn/gonglve/"
        options = session.options("$args -ol a[href~=/i/]")

        detectLinks(url, options)
        loadOutPages(url, options)
    }
}

fun main() {
    val crawler = AutomobileCrawler()
    crawler.crawlDouyin()
    crawler.crawlCheshi()
    crawler.crawlPickup()
    crawler.crawlAutohome()
    crawler.crawlMafengwo()
}
