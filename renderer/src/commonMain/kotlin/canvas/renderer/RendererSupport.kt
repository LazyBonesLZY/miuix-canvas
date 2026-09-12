package canvas.renderer

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import top.yukonga.miuix.kmp.basic.HorizontalScrollBar
import top.yukonga.miuix.kmp.basic.Icon
import top.yukonga.miuix.kmp.basic.Surface
import top.yukonga.miuix.kmp.basic.Text
import top.yukonga.miuix.kmp.basic.VerticalScrollBar
import top.yukonga.miuix.kmp.basic.rememberScrollBarAdapter
import top.yukonga.miuix.kmp.blur.LayerBackdrop
import top.yukonga.miuix.kmp.blur.BlurColors
import top.yukonga.miuix.kmp.blur.BlurDefaults
import top.yukonga.miuix.kmp.blur.ProgressiveBlur
import top.yukonga.miuix.kmp.blur.highlight.Highlight
import top.yukonga.miuix.kmp.blur.progressiveTextureBlur
import top.yukonga.miuix.kmp.blur.textureBlur
import top.yukonga.miuix.kmp.icon.MiuixIcons
import top.yukonga.miuix.kmp.icon.extended.Add
import top.yukonga.miuix.kmp.icon.extended.Back
import top.yukonga.miuix.kmp.icon.extended.Contacts
import top.yukonga.miuix.kmp.icon.extended.Copy
import top.yukonga.miuix.kmp.icon.extended.Delete
import top.yukonga.miuix.kmp.icon.extended.Edit
import top.yukonga.miuix.kmp.icon.extended.Favorites
import top.yukonga.miuix.kmp.icon.extended.Filter
import top.yukonga.miuix.kmp.icon.extended.GridView
import top.yukonga.miuix.kmp.icon.extended.Home
import top.yukonga.miuix.kmp.icon.extended.Image
import top.yukonga.miuix.kmp.icon.extended.ListView
import top.yukonga.miuix.kmp.icon.extended.More
import top.yukonga.miuix.kmp.icon.extended.Refresh
import top.yukonga.miuix.kmp.icon.extended.Search
import top.yukonga.miuix.kmp.icon.extended.Settings
import top.yukonga.miuix.kmp.icon.extended.Share
import top.yukonga.miuix.kmp.icon.extended.Sort
import top.yukonga.miuix.kmp.icon.extended.Tune
import top.yukonga.miuix.kmp.interfaces.ExperimentalScrollBarApi
import top.yukonga.miuix.kmp.theme.MiuixTheme

/** How an official composable should sit inside the editor's positioned box. */
internal enum class ItemRenderFit {
    /** Stretch to the box (bars, cards, images, sliders, fields). */
    Fill,
    /** Keep the official intrinsic size and center it (Switch 49×28, Checkbox 26×26). */
    Hug,
    /**
     * Fill width, wrap height without the box's max-height.
     * Preference rows and text clip when `fillMaxSize()` is forced into 56–64dp.
     */
    WidthHug,
}

internal fun itemRenderFit(kind: String): ItemRenderFit = when (kind) {
    "switch",
    "checkbox",
    "radio",
    "badge",
    "icon",
    "pullToRefresh",
    "iconButton",
    "fab",
    -> ItemRenderFit.Hug

    "text",
    "smallTitle",
    "button",
    "breadcrumb",
    "snackbar",
    "tooltip",
    "dropdown",
    "textField",
    "numberPicker",
    "searchBar",
    "floatingToolbar",
    "topAppBar",
    "floatingNav",
    "basicPref",
    "switchPref",
    "checkboxPref",
    "radioPref",
    "sliderPref",
    "rangeSliderPref",
    "dropdownPref",
    "spinnerPref",
    "arrowPref",
    -> ItemRenderFit.WidthHug

    else -> ItemRenderFit.Fill
}

internal data class PreferenceGroup(
    val items: List<ItemDto>,
    val x: Float,
    val y: Float,
    val w: Float,
    val h: Float,
)

internal fun ItemDto.sitsInPreferenceCard(): Boolean =
    parentId == null && (kind.endsWith("Pref") || kind == "dropdown")

/** Adjacent preference rows share one official Card (16.dp squircle, 0 inside margin). */
internal fun preferenceGroups(items: List<ItemDto>): List<PreferenceGroup> {
    val prefs = items.filter { it.sitsInPreferenceCard() }.sortedWith(compareBy({ it.y }, { it.x }))
    if (prefs.isEmpty()) return emptyList()
    val buckets = mutableListOf<MutableList<ItemDto>>()
    for (item in prefs) {
        val prev = buckets.lastOrNull()?.lastOrNull()
        val joins = prev != null &&
            kotlin.math.abs(prev.x - item.x) < 8f &&
            kotlin.math.abs(prev.w - item.w) < 8f &&
            kotlin.math.abs(prev.y + prev.h - item.y) < 4f
        if (joins) buckets.last().add(item) else buckets.add(mutableListOf(item))
    }
    return buckets.map { rows ->
        val x = rows.minOf { it.x }
        val y = rows.minOf { it.y }
        PreferenceGroup(
            items = rows,
            x = x,
            y = y,
            w = rows.maxOf { it.x + it.w } - x,
            h = rows.maxOf { it.y + it.h } - y,
        )
    }
}

/** The complete renderer registry, directly comparable with the editor's Kind union. */
val HANDLED_ITEM_KINDS: Set<String> = setOf(
    "button", "iconButton", "fab", "floatingToolbar",
    "topAppBar", "smallTitle", "navigationBar", "floatingNav", "navigationRail",
    "tabRow", "searchBar", "breadcrumb",
    "card", "surface", "divider", "snackbar", "dialog", "bottomSheet",
    "listPopup", "cascadingPopup", "dropdownMenu", "iconDropdownMenu",
    "iconCascadingMenu", "tooltip",
    "textField", "switch", "checkbox", "radio", "slider", "rangeSlider",
    "dropdown", "numberPicker", "colorPicker", "colorPalette",
    "text", "image", "badge", "icon",
    "progress", "pullToRefresh", "scrollBar", "blur",
    "basicPref", "switchPref", "checkboxPref", "radioPref", "sliderPref",
    "rangeSliderPref", "dropdownPref", "spinnerPref", "arrowPref",
)

/** Lower-camel alias for Kotlin tests and callers avoiding constant-style collection names. */
val handledItemKinds: Set<String> = HANDLED_ITEM_KINDS

internal val LocalRendererLang = staticCompositionLocalOf { "en" }

@Composable
internal fun localized(zh: String, en: String, ja: String, ko: String): String = when (LocalRendererLang.current) {
    "zh" -> zh
    "ja" -> ja
    "ko" -> ko
    else -> en
}

internal fun ItemDto.options(): List<NavTabDto> {
    val raw = tabs?.takeIf { it.isNotEmpty() }
        ?: listOf(NavTabDto(icon = icon.orEmpty(), label = label.ifBlank { kind }))
    val fallback = badge?.takeIf(String::isNotBlank) ?: return raw
    val selected = selectedIndex()
    return raw.mapIndexed { index, tab ->
        if (index == selected && tab.badge.isNullOrBlank()) tab.copy(badge = fallback) else tab
    }
}

internal fun ItemDto.selectedIndex(): Int = selected?.coerceIn(options().indices) ?: 0

internal fun ItemDto.normalizedValue(): Float = (value ?: 0.5f).coerceIn(0f, 1f)

internal fun ItemDto.normalizedRange(): ClosedFloatingPointRange<Float> {
    val first = (from ?: 0.2f).coerceIn(0f, 1f)
    return first..(value ?: 0.8f).coerceIn(first, 1f)
}

internal fun ItemDto.seedColor(): Color =
    color?.let(::parseHexColor)
        ?: Color.hsv(hue = normalizedValue() * 360f, saturation = 0.8f, value = 0.9f)

internal fun parseHexColor(hex: String): Color? {
    val raw = hex.removePrefix("#")
    if (raw.length != 6 && raw.length != 8) return null
    return raw.toLongOrNull(16)?.let {
        if (raw.length == 6) Color(0xFF000000L or it) else Color(it)
    }
}

internal fun Color.toHex(): String =
    "#${toArgb().toUInt().toString(16).padStart(8, '0').uppercase()}"

@Composable
internal fun RendererIcon(
    name: String?,
    contentDescription: String?,
    modifier: Modifier = Modifier,
) {
    Icon(
        imageVector = rendererIcon(name),
        contentDescription = contentDescription,
        modifier = modifier,
    )
}

internal fun rendererIcon(name: String?): ImageVector = when (name?.lowercase()) {
    "add", "add_circle", "addcircle" -> MiuixIcons.Add
    "back", "arrow_back", "arrowback", "chevron_backward" -> MiuixIcons.Back
    "home" -> MiuixIcons.Home
    "search", "explore" -> MiuixIcons.Search
    "person", "contacts", "account_circle" -> MiuixIcons.Contacts
    "settings" -> MiuixIcons.Settings
    "edit" -> MiuixIcons.Edit
    "delete" -> MiuixIcons.Delete
    "copy", "content_copy" -> MiuixIcons.Copy
    "share" -> MiuixIcons.Share
    "refresh" -> MiuixIcons.Refresh
    "image", "photo" -> MiuixIcons.Image
    "tune", "construction" -> MiuixIcons.Tune
    "sort" -> MiuixIcons.Sort
    "filter", "filter_list" -> MiuixIcons.Filter
    "grid_view" -> MiuixIcons.GridView
    "list", "list_view", "menu" -> MiuixIcons.ListView
    "star", "favorite", "favorites" -> MiuixIcons.Favorites
    else -> MiuixIcons.More
}

internal class RendererEvents(
    private val item: ItemDto,
    private val interactive: Boolean,
    private val requestId: String,
    private val emit: (RendererEvent) -> Unit,
) {
    fun click() {
        if (!item.enabled) return
        if (item.to != null) {
            send(RendererEvent(type = "navigate", action = item.transition ?: "slide", to = item.to))
        } else {
            patch(action = "click")
        }
    }

    fun dismiss() = send(RendererEvent(type = "dismiss", action = "dismiss"))
    fun checked(checked: Boolean) = patch(action = "toggle", checked = checked)
    fun value(value: Float) = patch(action = "value", value = value)
    fun range(value: ClosedFloatingPointRange<Float>) =
        patch(action = "range", from = value.start, value = value.endInclusive)

    fun select(index: Int, tab: NavTabDto) {
        if (!item.enabled) return
        if (tab.to != null) {
            send(RendererEvent(type = "navigate", action = tab.transition ?: item.transition ?: "slide", to = tab.to, selected = index))
        } else {
            patch(action = "select", selected = index)
        }
    }

    fun patch(
        action: String,
        checked: Boolean? = null,
        value: Float? = null,
        from: Float? = null,
        selected: Int? = null,
        label: String? = null,
        supporting: String? = null,
        color: String? = null,
        variant: String? = null,
        refreshing: Boolean? = null,
    ) {
        if (!item.enabled) return
        send(
            RendererEvent(
                type = "patch",
                action = action,
                checked = checked,
                value = value,
                from = from,
                selected = selected,
                label = label,
                supporting = supporting,
                color = color,
                variant = variant,
                refreshing = refreshing,
            ),
        )
    }

    private fun send(event: RendererEvent) {
        if (interactive) {
            emit(event.copy(requestId = requestId, itemId = item.id))
        }
    }
}

/** Applies the real miuix-blur textureBlur modifier node over a captured Miuix Surface. */
@Composable
internal fun TextureBlurHost(
    modifier: Modifier,
    shape: Shape = RoundedCornerShape(24.dp),
    backdrop: LayerBackdrop?,
    progressive: Boolean = false,
    blurRadius: Float = BlurDefaults.BlurRadius,
    noiseCoefficient: Float = if (progressive) BlurDefaults.ProgressiveNoiseCoefficient else BlurDefaults.NoiseCoefficient,
    colors: BlurColors = BlurColors(),
    highlight: Highlight? = null,
    direction: String? = null,
    content: @Composable BoxScope.() -> Unit,
) {
    if (backdrop == null) {
        Surface(
            modifier = modifier,
            color = MiuixTheme.colorScheme.surfaceContainer,
        ) {
            Box(modifier = Modifier.fillMaxSize(), content = content)
        }
    } else {
        Box(
            modifier = if (progressive) {
                modifier.progressiveTextureBlur(
                    backdrop = backdrop,
                    shape = shape,
                    blurRadius = blurRadius,
                    gradient = when (direction) {
                        "bottom" -> ProgressiveBlur.Bottom
                        "left" -> ProgressiveBlur.Left
                        "right" -> ProgressiveBlur.Right
                        else -> ProgressiveBlur.Top
                    },
                    noiseCoefficient = noiseCoefficient,
                    colors = colors,
                    highlight = highlight,
                )
            } else {
                modifier.textureBlur(
                    backdrop = backdrop,
                    shape = shape,
                    blurRadius = blurRadius,
                    noiseCoefficient = noiseCoefficient,
                    colors = colors,
                    highlight = highlight,
                )
            },
            content = content,
        )
    }
}

@OptIn(ExperimentalScrollBarApi::class)
@Composable
internal fun RenderScrollBar(item: ItemDto, modifier: Modifier) {
    // ItemDto has no ScrollState or scroll-content reference, so the official adapter is backed by
    // an internal scroll state whose invisible extent gives the real scrollbar a viewport ratio.
    val scrollState = rememberScrollState()
    val adapter = rememberScrollBarAdapter(scrollState)
    Box(modifier = modifier) {
        if (item.variant == "horizontal") {
            Row(Modifier.matchParentSize().horizontalScroll(scrollState)) {
                Spacer(Modifier.width(1000.dp).fillMaxHeight())
            }
            HorizontalScrollBar(adapter = adapter, modifier = Modifier.matchParentSize())
        } else {
            Column(Modifier.matchParentSize().verticalScroll(scrollState)) {
                Spacer(Modifier.height(1000.dp).fillMaxWidth())
            }
            VerticalScrollBar(adapter = adapter, modifier = Modifier.matchParentSize())
        }
        LaunchedEffect(scrollState.maxValue, item.value) {
            if (scrollState.maxValue > 0) {
                scrollState.scrollTo((scrollState.maxValue * item.normalizedValue()).toInt())
            }
        }
    }
}
