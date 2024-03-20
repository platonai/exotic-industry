package ai.platon.exotic.examples.sites.github

import ai.platon.pulsar.context.PulsarContexts

fun main() {
    val portalUrl = "https://github.com/Significant-Gravitas/Auto-GPT"
    val args = "-i 1s -ii 5d -ol \"a[href~=master]\" -ignoreFailure"

    val session = PulsarContexts.createSession()
    session.loadOutPages(portalUrl, args)
}
