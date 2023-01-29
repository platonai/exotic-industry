package ai.platon.exotic.automobile

import ai.platon.pulsar.common.LinkExtractors
import ai.platon.pulsar.common.ResourceLoader

class LogAnalyzer {
    fun extractFailedLinks() {
        val links = LinkExtractors.fromResource("result/failed.1.log")
        println("=== Failed links ===")
        links.distinct().forEach { println(it) }

        println("=== Failed hosts ===")
        links.distinct().map { it.split("/").take(3).joinToString("/") }
            .distinct().forEach { println(it) }
    }

    fun extractFailedLinks2() {
        val links = ResourceLoader.readAllLines("result/arrange.2.log")
        println("=== Failed links ===")
        links.filter { it.startsWith("!!! No navigate") }.distinct().forEach { println(it) }
    }
}

fun main() {
    val analyzer = LogAnalyzer()
    analyzer.extractFailedLinks2()
}
