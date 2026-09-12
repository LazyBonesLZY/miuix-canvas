package canvas.renderer

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.unit.dp
import top.yukonga.miuix.kmp.basic.Badge
import top.yukonga.miuix.kmp.basic.BreadcrumbBar
import top.yukonga.miuix.kmp.basic.IconButton
import top.yukonga.miuix.kmp.basic.BreadcrumbItem
import top.yukonga.miuix.kmp.basic.FloatingNavigationBar
import top.yukonga.miuix.kmp.basic.FloatingNavigationBarItem
import top.yukonga.miuix.kmp.basic.InputField
import top.yukonga.miuix.kmp.basic.NavigationBar
import top.yukonga.miuix.kmp.basic.NavigationBarDisplayMode
import top.yukonga.miuix.kmp.basic.NavigationBarItem
import top.yukonga.miuix.kmp.basic.NavigationItem
import top.yukonga.miuix.kmp.basic.NavigationRail
import top.yukonga.miuix.kmp.basic.NavigationRailItem
import top.yukonga.miuix.kmp.basic.NavigationRailState
import top.yukonga.miuix.kmp.basic.NavigationRailValue
import top.yukonga.miuix.kmp.basic.SearchBar
import top.yukonga.miuix.kmp.basic.TabRow
import top.yukonga.miuix.kmp.basic.TabRowWithContour
import top.yukonga.miuix.kmp.basic.Text
import top.yukonga.miuix.kmp.basic.TopAppBar
import top.yukonga.miuix.kmp.basic.SmallTopAppBar
import top.yukonga.miuix.kmp.theme.MiuixTheme
import top.yukonga.miuix.kmp.blur.LayerBackdrop
import top.yukonga.miuix.kmp.blur.BlendColorEntry
import top.yukonga.miuix.kmp.blur.BlurDefaults
import top.yukonga.miuix.kmp.blur.highlight.Highlight
import upstream.liquid.IosLiquidGlassNavigationBar

@Composable
internal fun RenderTopAppBar(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val navigationIcon: @Composable () -> Unit = {
        if (!item.icon.isNullOrBlank() || !item.to.isNullOrBlank()) {
            IconButton(onClick = events::click, enabled = item.enabled) {
                RendererIcon(item.icon ?: "back", item.label.ifBlank { "Back" })
            }
        }
    }
    if (item.variant == "large") {
        TopAppBar(
            title = item.label,
            largeTitle = item.largeTitle ?: item.label,
            subtitle = item.subtitle.orEmpty(),
            modifier = modifier,
            navigationIcon = navigationIcon,
            defaultWindowInsetsPadding = false,
        )
    } else {
        SmallTopAppBar(
            title = item.label,
            subtitle = item.subtitle.orEmpty(),
            modifier = modifier,
            navigationIcon = navigationIcon,
            defaultWindowInsetsPadding = false,
        )
    }
}

@Composable
internal fun RenderNavigationBar(
    item: ItemDto,
    modifier: Modifier,
    events: RendererEvents,
    backdrop: LayerBackdrop?,
) {
    val blurred = item.effect == "textureBlur" || item.effect == "progressiveTextureBlur"
    val content: @Composable BoxScope.() -> Unit = {
        NavigationBar(
            modifier = if (blurred) Modifier.fillMaxSize() else modifier,
            color = if (blurred) Color.Transparent else MiuixTheme.colorScheme.surface,
            showDivider = !blurred,
            defaultWindowInsetsPadding = false,
            mode = when (item.variant) {
                "iconOnly" -> NavigationBarDisplayMode.IconOnly
                "iconWithSelectedLabel" -> NavigationBarDisplayMode.IconWithSelectedLabel
                else -> NavigationBarDisplayMode.IconAndText
            },
        ) {
            item.options().forEachIndexed { index, tab ->
                NavigationBarItem(
                    selected = index == item.selectedIndex(),
                    onClick = { events.select(index, tab) },
                    icon = rendererIcon(tab.icon),
                    label = tab.label,
                    enabled = item.enabled,
                    badge = tab.badge?.let { badge -> { Badge { Text(badge) } } },
                )
            }
        }
    }
    if (blurred) {
        TextureBlurHost(
            modifier = modifier,
            backdrop = backdrop,
            progressive = item.effect == "progressiveTextureBlur",
            blurRadius = item.blurRadius ?: 25f,
            noiseCoefficient = item.noiseCoefficient ?: if (item.effect == "progressiveTextureBlur") 0f else 0.0045f,
            colors = BlurDefaults.blurColors(
                blendColors = listOf(BlendColorEntry(MiuixTheme.colorScheme.surface.copy(alpha = 0.8f))),
            ),
            direction = item.effectDirection,
            content = content,
        )
    } else {
        Box { content() }
    }
}

@Composable
internal fun RenderFloatingNavigationBar(
    item: ItemDto,
    modifier: Modifier,
    events: RendererEvents,
    backdrop: LayerBackdrop?,
) {
    if (item.variant == "iosLike" || item.variant == "glass") {
        val tabs = item.options()
        IosLiquidGlassNavigationBar(
            items = tabs.map { NavigationItem(label = it.label, icon = rendererIcon(it.icon)) },
            selectedIndex = item.selectedIndex(),
            onItemClick = { index -> events.select(index, tabs[index]) },
            backdrop = backdrop,
            isBlurActive = backdrop != null,
            modifier = modifier,
            badge = { index ->
                tabs[index].badge?.let { badge -> { Badge { Text(badge) } } }
            },
        )
        return
    }
    val blurred = item.effect == "textureBlur" || item.effect == "progressiveTextureBlur"
    val content: @Composable BoxScope.() -> Unit = {
        FloatingNavigationBar(
            modifier = if (blurred) Modifier.fillMaxSize() else modifier,
            color = if (blurred) Color.Transparent else MiuixTheme.colorScheme.surfaceContainer,
            defaultWindowInsetsPadding = false,
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
            ) {
                item.options().forEachIndexed { index, tab ->
                    FloatingNavigationBarItem(
                        selected = index == item.selectedIndex(),
                        onClick = { events.select(index, tab) },
                        icon = rendererIcon(tab.icon),
                        label = tab.label,
                        enabled = item.enabled,
                        badge = tab.badge?.let { badge -> { Badge { Text(badge) } } },
                    )
                }
            }
        }
    }
    if (blurred) {
        val dark = MiuixTheme.colorScheme.surface.luminance() < 0.5f
        TextureBlurHost(
            modifier = modifier,
            shape = CircleShape,
            backdrop = backdrop,
            progressive = item.effect == "progressiveTextureBlur",
            blurRadius = item.blurRadius ?: 25f,
            noiseCoefficient = item.noiseCoefficient ?: if (item.effect == "progressiveTextureBlur") 0f else 0.0045f,
            colors = BlurDefaults.blurColors(
                blendColors = listOf(BlendColorEntry(MiuixTheme.colorScheme.surfaceContainer.copy(alpha = 0.6f))),
            ),
            highlight = if (dark) Highlight.GlassStrokeMiddleDark else Highlight.GlassStrokeMiddleLight,
            direction = item.effectDirection,
            content = content,
        )
    } else {
        Box { content() }
    }
}

@Composable
internal fun RenderNavigationRail(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val state = when (item.variant) {
        "collapsed" -> androidx.compose.runtime.remember(item.variant) { NavigationRailState(NavigationRailValue.Collapsed) }
        "expanded" -> androidx.compose.runtime.remember(item.variant) { NavigationRailState(NavigationRailValue.Expanded) }
        else -> null
    }
    NavigationRail(
        modifier = modifier,
        state = state,
        defaultWindowInsetsPadding = false,
    ) {
        item.options().forEachIndexed { index, tab ->
            NavigationRailItem(
                selected = index == item.selectedIndex(),
                onClick = { events.select(index, tab) },
                icon = rendererIcon(tab.icon),
                label = tab.label,
                enabled = item.enabled,
                badge = tab.badge?.let { badge -> { Badge { Text(badge) } } },
            )
        }
    }
}

@Composable
internal fun RenderTabRow(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val tabs = item.options()
    val labels = tabs.map { it.label }
    val onSelected: (Int) -> Unit = { events.select(it, tabs[it]) }
    if (item.variant == "contour") {
        TabRowWithContour(
            tabs = labels,
            selectedTabIndex = item.selectedIndex(),
            onTabSelected = onSelected,
            modifier = modifier,
        )
    } else {
        TabRow(
            tabs = labels,
            selectedTabIndex = item.selectedIndex(),
            onTabSelected = onSelected,
            modifier = modifier,
        )
    }
}

@Composable
internal fun RenderSearchBar(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val expanded = item.variant == "expanded"
    SearchBar(
        inputField = {
            InputField(
                query = item.label,
                onQueryChange = { events.patch(action = "input", label = it) },
                onSearch = { events.patch(action = "search", label = it) },
                expanded = expanded,
                onExpandedChange = {
                    events.patch(action = if (it) "expand" else "collapse", variant = if (it) "expanded" else "field")
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = item.enabled,
            )
        },
        onExpandedChange = {
            events.patch(action = if (it) "expand" else "collapse", variant = if (it) "expanded" else "field")
        },
        modifier = modifier,
        expanded = expanded,
    ) {
        item.supporting?.let { Text(it, Modifier.padding(16.dp)) }
    }
}

@Composable
internal fun RenderBreadcrumb(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val crumbs = item.label
        .split('/')
        .map(String::trim)
        .filter(String::isNotEmpty)
        .ifEmpty { listOf(item.label) }
        .mapIndexed { index, text -> BreadcrumbItem(path = index.toString(), text = text) }
    BreadcrumbBar(
        items = crumbs,
        onItemClick = { events.patch(action = "breadcrumb", selected = it) },
        modifier = modifier,
        highlightIndex = item.selected?.coerceIn(crumbs.indices) ?: crumbs.lastIndex,
        enabled = item.enabled,
    )
}
