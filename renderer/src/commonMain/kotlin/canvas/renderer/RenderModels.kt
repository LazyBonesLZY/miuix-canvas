package canvas.renderer

import kotlinx.serialization.Serializable
import top.yukonga.miuix.kmp.nav.core.NavKey

@Serializable
data class RenderRequest(
    val type: String = "render",
    val requestId: String = "",
    val interactive: Boolean = false,
    val lang: String = "zh",
    val theme: ThemeDto = ThemeDto(),
    val screen: ScreenDto = ScreenDto(),
    val screens: List<ScreenDto> = emptyList(),
    val currentScreenId: String? = null,
)

@Serializable
data class ThemeDto(
    val mode: String = "light",
    val seed: String = "#3482FF",
    val monet: Boolean = true,
)

@Serializable
data class ScreenDto(
    val id: String = "",
    val name: String = "",
    val preset: String = "phone",
    val note: String? = null,
    val swipe: Map<String, String> = emptyMap(),
    val items: List<ItemDto> = emptyList(),
)

@Serializable
data class ScreenKey(
    val id: String,
) : NavKey

@Serializable
data class ItemDto(
    val id: String = "",
    val kind: String = "text",
    val x: Float = 0f,
    val y: Float = 0f,
    val w: Float = 0f,
    val h: Float = 0f,
    val label: String = "",
    val supporting: String? = null,
    val icon: String? = null,
    val variant: String? = null,
    val checked: Boolean? = null,
    val value: Float? = null,
    val from: Float? = null,
    val tabs: List<NavTabDto>? = null,
    val selected: Int? = null,
    val note: String? = null,
    val to: String? = null,
    val transition: String? = null,
    val enabled: Boolean = true,
    val show: Boolean = true,
    val refreshing: Boolean = false,
    val badge: String? = null,
    val parentId: String? = null,
    val slot: String = "content",
    val subtitle: String? = null,
    val largeTitle: String? = null,
    val actionLabel: String? = null,
    val textStyle: String? = null,
    val multiline: Boolean = false,
    val source: String? = null,
    val contentDescription: String? = null,
    val color: String? = null,
    val effect: String? = null,
    val blurRadius: Float? = null,
    val effectDirection: String? = null,
    val noiseCoefficient: Float? = null,
    val group: String? = null,
)

@Serializable
data class NavTabDto(
    val icon: String = "",
    val label: String = "",
    val to: String? = null,
    val transition: String? = null,
    val badge: String? = null,
)

internal fun isRenderPayload(payload: String): Boolean {
    val text = payload.trimStart()
    return text.startsWith('{') && text.contains("\"type\"") && text.contains("\"render\"")
}

@Serializable
data class RendererEvent(
    val type: String,
    val requestId: String = "",
    val itemId: String? = null,
    val action: String? = null,
    val to: String? = null,
    val checked: Boolean? = null,
    val value: Float? = null,
    val from: Float? = null,
    val selected: Int? = null,
    val label: String? = null,
    val color: String? = null,
    val variant: String? = null,
    val refreshing: Boolean? = null,
    val dataUrl: String? = null,
    val message: String? = null,
)
