package canvas.renderer

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.ComposeViewport
import coil3.ImageLoader
import coil3.compose.setSingletonImageLoaderFactory
import coil3.network.ktor3.KtorNetworkFetcherFactory
import kotlinx.browser.window
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.w3c.dom.MessageEvent

private val json = Json {
    ignoreUnknownKeys = true
    encodeDefaults = true
}

private var request by mutableStateOf(RenderRequest())

@OptIn(ExperimentalComposeUiApi::class, ExperimentalWasmJsInterop::class)
fun main() {
    window.addEventListener("message", { event ->
        val message = event as? MessageEvent ?: return@addEventListener
        if (message.origin != window.location.origin) return@addEventListener
        val payload = message.data?.toString() ?: return@addEventListener
        runCatching { json.decodeFromString<RenderRequest>(payload) }
            .onSuccess {
                if (it.type == "render") {
                    request = it
                    post(RendererEvent(type = "rendered", requestId = it.requestId))
                }
            }
            .onFailure {
                post(RendererEvent(type = "error", message = it.message ?: "Invalid render request"))
            }
    })

    ComposeViewport(viewportContainerId = "ComposeTarget") {
        setSingletonImageLoaderFactory { context ->
            ImageLoader.Builder(context)
                .components { add(KtorNetworkFetcherFactory()) }
                .build()
        }
        RendererApp(request = request, emit = ::post)
    }
    post(RendererEvent(type = "ready"))
}

private fun post(event: RendererEvent) {
    postToParent(json.encodeToString(event))
}

@OptIn(ExperimentalWasmJsInterop::class)
@JsFun("(message) => window.parent.postMessage(message, window.location.origin)")
private external fun postToParent(message: String)
