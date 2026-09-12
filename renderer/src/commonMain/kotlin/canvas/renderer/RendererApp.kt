package canvas.renderer

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import top.yukonga.miuix.kmp.basic.Card
import top.yukonga.miuix.kmp.basic.CardDefaults
import androidx.compose.foundation.layout.PaddingValues
import top.yukonga.miuix.kmp.blur.LayerBackdrop
import top.yukonga.miuix.kmp.blur.layerBackdrop
import top.yukonga.miuix.kmp.blur.rememberLayerBackdrop
import top.yukonga.miuix.kmp.nav.core.NavDisplay
import top.yukonga.miuix.kmp.nav.core.rememberNavController
import top.yukonga.miuix.kmp.nav.transition.NavTransition
import top.yukonga.miuix.kmp.nav.transition.NavTransitions
import top.yukonga.miuix.kmp.theme.ColorSchemeMode
import top.yukonga.miuix.kmp.theme.MiuixTheme
import top.yukonga.miuix.kmp.theme.ThemeController

@Composable
fun RendererApp(
    request: RenderRequest,
    emit: (RendererEvent) -> Unit,
) {
    val dark = request.theme.mode == "dark"
    val seed = remember(request.theme.seed) { parseHexColor(request.theme.seed) }
    val controller = remember(request.theme.mode, request.theme.monet, seed) {
        officialThemeController(dark = dark, monet = request.theme.monet, seed = seed)
    }

    LaunchedEffect(request) {
        if (!hasRenderableRequest(request)) return@LaunchedEffect
        withFrameNanos {}
        withFrameNanos {}
        emit(RendererEvent(type = "rendered", requestId = request.requestId))
    }

    MiuixTheme(controller = controller) {
        CompositionLocalProvider(LocalRendererLang provides request.lang) {
            if (request.screens.isNotEmpty()) {
                NavigableRenderer(request = request, emit = emit)
            } else {
                ScreenRenderer(request = request, emit = emit)
            }
        }
    }
}

@Composable
internal fun NavigableRenderer(
    request: RenderRequest,
    emit: (RendererEvent) -> Unit,
) {
    val screens = request.screens.ifEmpty { listOf(request.screen) }
    val startId = request.currentScreenId?.takeIf { id -> screens.any { it.id == id } }
        ?: request.screen.id.takeIf { id -> screens.any { it.id == id } }
        ?: screens.first().id
    val nav = rememberNavController(ScreenKey(startId))
    var transitionName by remember { mutableStateOf("slide") }

    fun applyNavigate(to: String, action: String?) {
        if (!action.isNullOrBlank()) transitionName = action
        val current = (nav.backStack.lastOrNull() as? ScreenKey)?.id
        when {
            to == BACK_TARGET -> nav.pop()
            current == to -> Unit
            nav.backStack.any { (it as? ScreenKey)?.id == to } ->
                nav.popUntil { (it as? ScreenKey)?.id == to }
            screens.any { it.id == to } -> nav.push(ScreenKey(to))
        }
    }

    LaunchedEffect(request.currentScreenId) {
        val target = request.currentScreenId ?: return@LaunchedEffect
        applyNavigate(target, null)
    }

    val forward: (RendererEvent) -> Unit = { event ->
        val destination = event.to
        if (event.type == "navigate" && !destination.isNullOrBlank()) {
            applyNavigate(destination, event.action)
        }
        emit(event)
    }

    NavDisplay(
        navController = nav,
        modifier = Modifier.fillMaxSize(),
        transition = officialNavTransition(transitionName),
    ) {
        entry<ScreenKey> { key ->
            val screen = screens.firstOrNull { it.id == key.id } ?: request.screen
            ScreenRenderer(
                request = request.copy(screen = screen, screens = emptyList(), currentScreenId = screen.id),
                emit = forward,
            )
        }
    }
}

internal fun officialThemeController(
    dark: Boolean,
    monet: Boolean,
    seed: Color?,
): ThemeController = if (monet && seed != null) {
    ThemeController(
        colorSchemeMode = if (dark) ColorSchemeMode.MonetDark else ColorSchemeMode.MonetLight,
        keyColor = seed,
    )
} else {
    ThemeController(
        colorSchemeMode = if (dark) ColorSchemeMode.Dark else ColorSchemeMode.Light,
    )
}

internal fun hasRenderableRequest(request: RenderRequest): Boolean =
    request.screen.id.isNotBlank() && request.requestId.isNotBlank()

internal fun officialSchemeMode(mode: String, monet: Boolean): ColorSchemeMode = when {
    monet && mode == "dark" -> ColorSchemeMode.MonetDark
    monet -> ColorSchemeMode.MonetLight
    mode == "dark" -> ColorSchemeMode.Dark
    else -> ColorSchemeMode.Light
}

internal const val BACK_TARGET = "back"

internal fun officialNavTransitionName(name: String?): String = when (name) {
    "slideUp", "slideDown" -> "modal"
    "fade", "none" -> "none"
    else -> "miuixDefault"
}

internal fun officialNavTransition(name: String?): NavTransition = when (officialNavTransitionName(name)) {
    "modal" -> NavTransitions.Modal
    "none" -> NavTransitions.None
    else -> NavTransitions.MiuixDefault
}

@Composable
internal fun ScreenRenderer(
    request: RenderRequest,
    emit: (RendererEvent) -> Unit,
) {
    val backdrop = rememberLayerBackdrop()
    val groups = remember(request.screen.items) { preferenceGroups(request.screen.items) }
    val groupedIds = remember(groups) { groups.flatMap { group -> group.items.map { it.id } }.toSet() }
    val roots = request.screen.items.filter { item ->
        (item.parentId == null || request.screen.items.none { parent -> parent.id == item.parentId }) &&
            item.id !in groupedIds
    }
    val density = LocalDensity.current
    val swipeThreshold = with(density) { 64.dp.toPx() }
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MiuixTheme.colorScheme.surface)
            .screenSwipe(request.screen.swipe, request.interactive, swipeThreshold, emit),
    ) {
        Box(modifier = Modifier.fillMaxSize().layerBackdrop(backdrop)) {
            Box(modifier = Modifier.fillMaxSize().background(MiuixTheme.colorScheme.surface))
            groups.forEach { group ->
                PreferenceGroupCard(
                    group = group,
                    allItems = request.screen.items,
                    interactive = request.interactive,
                    requestId = request.requestId,
                    backdrop = backdrop,
                    emit = emit,
                )
            }
            roots
                .filterNot(ItemDto::usesBackdrop)
                .forEach { item ->
                    PositionedItem(
                        item = item,
                        allItems = request.screen.items,
                        interactive = request.interactive,
                        requestId = request.requestId,
                        backdrop = backdrop,
                        emit = emit,
                    )
                }
        }
        roots
            .filter(ItemDto::usesBackdrop)
            .forEach { item ->
                PositionedItem(
                    item = item,
                    allItems = request.screen.items,
                    interactive = request.interactive,
                    requestId = request.requestId,
                    backdrop = backdrop,
                    emit = emit,
                )
            }
    }
}

@Composable
private fun PreferenceGroupCard(
    group: PreferenceGroup,
    allItems: List<ItemDto>,
    interactive: Boolean,
    requestId: String,
    backdrop: LayerBackdrop,
    emit: (RendererEvent) -> Unit,
) {
    val host = ItemDto(id = "card:${group.items.first().id}", x = group.x, y = group.y, w = group.w, h = group.h)
    Box(
        modifier = Modifier
            .offset(group.x.dp, group.y.dp)
            .size(group.w.coerceAtLeast(1f).dp, group.h.coerceAtLeast(1f).dp),
    ) {
        Card(
            modifier = Modifier.fillMaxSize(),
            cornerRadius = CardDefaults.CornerRadius,
            insideMargin = PaddingValues(0.dp),
        ) {}
        group.items.forEach { item ->
            PositionedItem(
                item = item,
                allItems = allItems,
                interactive = interactive,
                requestId = requestId,
                backdrop = backdrop,
                emit = emit,
                parent = host,
            )
        }
    }
}

@Composable
private fun PositionedItem(
    item: ItemDto,
    allItems: List<ItemDto>,
    interactive: Boolean,
    requestId: String,
    backdrop: LayerBackdrop,
    emit: (RendererEvent) -> Unit,
    parent: ItemDto? = null,
) {
    val x = if (parent == null) item.x else item.x - parent.x
    val y = if (parent == null) item.y else item.y - parent.y
    val fit = itemRenderFit(item.kind)
    Box(
        modifier = Modifier
            .offset(x.dp, y.dp)
            .size(item.w.coerceAtLeast(1f).dp, item.h.coerceAtLeast(1f).dp),
        contentAlignment = when (fit) {
            ItemRenderFit.Hug -> Alignment.Center
            ItemRenderFit.WidthHug -> Alignment.TopStart
            ItemRenderFit.Fill -> Alignment.TopStart
        },
    ) {
        ComponentRenderer(
            item = item,
            modifier = when (fit) {
                ItemRenderFit.Hug -> Modifier.wrapContentSize(Alignment.Center)
                ItemRenderFit.WidthHug -> Modifier
                    .fillMaxWidth()
                    .wrapContentHeight(align = Alignment.Top, unbounded = true)
                ItemRenderFit.Fill -> Modifier.fillMaxSize()
            },
            interactive = interactive,
            requestId = requestId,
            backdrop = backdrop,
            emit = emit,
        )
        allItems.filter { it.parentId == item.id }.forEach { child ->
            PositionedItem(
                item = child,
                allItems = allItems,
                interactive = interactive,
                requestId = requestId,
                backdrop = backdrop,
                emit = emit,
                parent = item,
            )
        }
    }
}

private fun ItemDto.usesBackdrop(): Boolean =
    kind == "blur" ||
        effect == "textureBlur" ||
        effect == "progressiveTextureBlur" ||
        (kind == "floatingNav" && (variant == "iosLike" || variant == "glass"))

internal fun swipeNavigate(swipe: Map<String, String>, delta: Offset, threshold: Float): Pair<String, String>? {
    val absX = kotlin.math.abs(delta.x)
    val absY = kotlin.math.abs(delta.y)
    if (absX < threshold && absY < threshold) return null
    val (dir, action) = if (absX > absY) {
        if (delta.x < 0f) "left" to "slide" else "right" to "slideLeft"
    } else {
        if (delta.y < 0f) "up" to "slideUp" else "down" to "slideDown"
    }
    val to = swipe[dir]?.takeIf(String::isNotBlank) ?: return null
    return to to action
}

private fun Modifier.screenSwipe(
    swipe: Map<String, String>,
    interactive: Boolean,
    threshold: Float,
    emit: (RendererEvent) -> Unit,
): Modifier {
    if (!interactive || swipe.isEmpty()) return this
    return pointerInput(swipe, threshold) {
        var total = Offset.Zero
        detectDragGestures(
            onDrag = { _, dragAmount -> total += dragAmount },
            onDragEnd = {
                swipeNavigate(swipe, total, threshold)?.let { (to, action) ->
                    emit(RendererEvent(type = "navigate", action = action, to = to))
                }
                total = Offset.Zero
            },
            onDragCancel = { total = Offset.Zero },
        )
    }
}

