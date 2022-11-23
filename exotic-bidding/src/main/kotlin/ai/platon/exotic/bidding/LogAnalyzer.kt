package ai.platon.exotic.bidding

import ai.platon.pulsar.common.LinkExtractors

class LogAnalyzer {
    fun extractFailedLinks() {
        val links = LinkExtractors.fromResource("result/failed.1.log")
        println("=== Failed links ===")
        links.distinct().forEach { println(it) }

        println("=== Failed hosts ===")
        links.distinct().map { it.split("/").take(3).joinToString("/") }
            .distinct().forEach { println(it) }
    }
}

fun main() {
    val analyzer = LogAnalyzer()
    analyzer.extractFailedLinks()
}
