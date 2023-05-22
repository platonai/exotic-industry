package ai.platon.exotic.bidding.sites.hbbidcloud

import ai.platon.pulsar.common.getLogger
import ai.platon.scent.context.ScentContexts
import java.io.FileWriter
import java.nio.file.Files
import java.nio.file.Paths

class HbbidcloudExporter {
    private val logger = getLogger(this)
    private val context = ScentContexts.create()
    private val session = context.createSession()
    private val textFileName = Paths.get("/tmp/hbbidcloud20230522.txt")
    private val textFileWriter = FileWriter(textFileName.toFile(), true)

    private val csvFileName = Paths.get("/tmp/hbbidcloud20230522.csv")
    private val csvFileWriter = FileWriter(csvFileName.toFile(), true)

    fun export() {
        val urlPrefix = "http://www.hbbidcloud.cn/"

        var i = 0
        val pages = context.scan(urlPrefix).asSequence().filter { it.url.startsWith(urlPrefix) }
        pages.forEach { page ->
            val document = session.parse(page)

            val title = document.firstTextOrNull(".news-article h3") ?: ""
            val publishTime = document.firstTextOrNull(".news-article .ewb-article-sources") ?: ""
            val article = document.firstTextOrNull(".news-article") ?: ""

            if (title.isNotBlank()) {
                if (++i % 100 == 0) {
                    logger.info("Processing the {}th page", i)
                }

                textFileWriter.append("" + page.id + ".\t" + page.url).append("\n")
                    .append(title).append("\n")
                    .append(publishTime).append("\n")
                    .append(article).append("\n")
                    .append("\n\n\n")

                csvFileWriter.append(csvClean(page.url)).append(",")
                    .append(csvClean(title)).append(",")
                    .append(csvClean(publishTime)).append(",")
                    .append(csvClean(article))
                    .append("\n")
            }
        }
    }

    private fun csvClean(text: String): String {
        return text.replace(",", "，")
    }
}

fun main() {
    HbbidcloudExporter().export()
}
