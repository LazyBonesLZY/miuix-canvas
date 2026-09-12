package canvas.renderer

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import top.yukonga.miuix.kmp.basic.Scaffold
import top.yukonga.miuix.kmp.blur.LayerBackdrop
import top.yukonga.miuix.kmp.blur.layerBackdrop
import top.yukonga.miuix.kmp.blur.rememberLayerBackdrop
import top.yukonga.miuix.kmp.nav.core.NavDisplay
import top.yukonga.miuix.kmp.nav.core.rememberNavController
import top.yukonga.miuix.kmp.nav.transition.NavTransition
import top.yukonga.miuix.kmp.nav.transition.NavTransitions
import top.yukonga.miuix.kmp.theme.ColorSchemeMode
import top.yukonga.miuix.kmp.theme.MiuixTheme
import top.yukonga.miuix.kmp.theme.ThemeColorSpec
import top.yukonga.miuix.kmp.theme.ThemeController
import top.yukonga.miuix.kmp.theme.ThemePaletteStyle

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
): ThemeController = if (monet) {
    ThemeController(
        colorSchemeMode = if (dark) ColorSchemeMode.MonetDark else ColorSchemeMode.MonetLight,
        keyColor = seed,
        colorSpec = ThemeColorSpec.Spec2021,
        paletteStyle = ThemePaletteStyle.Content,
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
    val roots = request.screen.items.filter { item ->
        item.parentId == null || request.screen.items.none { parent -> parent.id == item.parentId }
    }
    val topBar = roots.firstOrNull { it.effectiveSlot() == "topBar" }
    val bottomBar = roots.firstOrNull { it.effectiveSlot() == "bottomBar" }
    val fab = roots.firstOrNull { it.effectiveSlot() == "floatingActionButton" }
    val toolbar = roots.firstOrNull { it.effectiveSlot() == "floatingToolbar" }
    val snackbar = roots.firstOrNull { it.effectiveSlot() == "snackbarHost" }
    val contentRoots = roots.filter {
        it !== topBar && it !== bottomBar && it !== fab && it !== toolbar && it !== snackbar
    }
    val density = LocalDensity.current
    val swipeThreshold = with(density) { 64.dp.toPx() }
    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .screenSwipe(request.screen.swipe, request.interactive, swipeThreshold, emit),
        containerColor = MiuixTheme.colorScheme.surface,
        topBar = { topBar?.let { SlotItem(it, request, backdrop, emit) } },
        bottomBar = { bottomBar?.let { SlotItem(it, request, backdrop, emit) } },
        floatingActionButton = { fab?.let { SlotItem(it, request, backdrop, emit) } },
        floatingToolbar = { toolbar?.let { SlotItem(it, request, backdrop, emit) } },
        snackbarHost = { snackbar?.let { SlotItem(it, request, backdrop, emit) } },
    ) { _ ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MiuixTheme.colorScheme.surface),
        ) {
            Box(modifier = Modifier.fillMaxSize().layerBackdrop(backdrop)) {
                Box(modifier = Modifier.fillMaxSize().background(MiuixTheme.colorScheme.surface))
                contentRoots
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
            contentRoots
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
}

@Composable
private fun SlotItem(
    item: ItemDto,
    request: RenderRequest,
    backdrop: LayerBackdrop,
    emit: (RendererEvent) -> Unit,
) {
    ComponentRenderer(
        item = item,
        interactive = request.interactive,
        requestId = request.requestId,
        backdrop = backdrop,
        emit = emit,
    )
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
    Box(
        modifier = Modifier
            .offset(x.dp, y.dp)
            .size(item.w.coerceAtLeast(1f).dp, item.h.coerceAtLeast(1f).dp),
    ) {
        ComponentRenderer(
            item = item,
            modifier = Modifier.fillMaxSize(),
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

private fun ItemDto.effectiveSlot(): String = when {
    slot != "content" -> slot
    kind == "topAppBar" -> "topBar"
    kind == "navigationBar" || kind == "floatingNav" -> "bottomBar"
    kind == "fab" -> "floatingActionButton"
    kind == "floatingToolbar" -> "floatingToolbar"
    kind == "snackbar" -> "snackbarHost"
    else -> "content"
}

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

