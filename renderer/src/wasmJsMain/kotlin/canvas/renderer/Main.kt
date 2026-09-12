package canvas.renderer

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.ComposeViewport
import kotlinx.browser.window
import kotlinx.serialization.encodeToString
import kotlin.js.ExperimentalWasmJsInterop
import kotlin.js.JsAny

private val json = rendererJson

private var request by mutableStateOf(RenderRequest())
private var acceptedRender = false

@OptIn(ExperimentalComposeUiApi::class, ExperimentalWasmJsInterop::class)
fun main() {
    runCatching {
        window.addEventListener("message", { event ->
            val payload = stringMessage(event as JsAny, window.location.origin) ?: return@addEventListener
            accept(payload)
        })
        announceReady()
        ComposeViewport(viewportContainerId = "ComposeTarget") {
            RendererApp(request = request, emit = ::post)
        }
    }.onFailure {
        post(RendererEvent(type = "error", message = it.message ?: "Miuix renderer failed to start"))
    }
}

private fun accept(payload: String) {
    if (!isRenderPayload(payload)) return
    runCatching { json.decodeFromString<RenderRequest>(payload) }
        .onSuccess {
            if (it.type == "render") {
                acceptedRender = true
                request = it
                post(RendererEvent(type = "rendered", requestId = it.requestId))
            }
        }
        .onFailure {
            post(RendererEvent(type = "error", message = it.message ?: "Invalid render request"))
        }
}

@OptIn(ExperimentalWasmJsInterop::class)
private fun announceReady() {
    post(RendererEvent(type = "ready"))
    if (!acceptedRender) {
        window.setTimeout({
            if (!acceptedRender) announceReady()
            null
        }, 400)
    }
}

private fun post(event: RendererEvent) {
    postToParent(json.encodeToString(event))
}

@OptIn(ExperimentalWasmJsInterop::class)
@JsFun("(event, origin) => { if (!event || event.origin !== origin || event.source !== window.parent) return null; const data = event.data; return (typeof data === 'string' && data.charCodeAt(0) === 123) ? data : null; }")
private external fun stringMessage(event: JsAny, origin: String): String?

@OptIn(ExperimentalWasmJsInterop::class)
@JsFun("(message) => window.parent.postMessage(message, window.location.origin)")
private external fun postToParent(message: String)
