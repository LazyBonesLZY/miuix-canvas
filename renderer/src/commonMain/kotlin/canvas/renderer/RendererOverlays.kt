package canvas.renderer

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import top.yukonga.miuix.kmp.basic.BasicComponent
import top.yukonga.miuix.kmp.basic.ButtonDefaults
import top.yukonga.miuix.kmp.basic.DropdownEntry
import top.yukonga.miuix.kmp.basic.DropdownImpl
import top.yukonga.miuix.kmp.basic.DropdownItem
import top.yukonga.miuix.kmp.basic.IconButton
import top.yukonga.miuix.kmp.basic.ListPopupColumn
import top.yukonga.miuix.kmp.basic.RichTooltipBox
import top.yukonga.miuix.kmp.basic.Snackbar
import top.yukonga.miuix.kmp.basic.SnackbarData
import top.yukonga.miuix.kmp.basic.SnackbarDuration
import top.yukonga.miuix.kmp.basic.SnackbarVisuals
import top.yukonga.miuix.kmp.basic.Text
import top.yukonga.miuix.kmp.basic.TextButton
import top.yukonga.miuix.kmp.basic.TooltipBox
import top.yukonga.miuix.kmp.basic.rememberTooltipState
import top.yukonga.miuix.kmp.menu.OverlayDropdownMenu
import top.yukonga.miuix.kmp.menu.OverlayIconCascadingDropdownMenu
import top.yukonga.miuix.kmp.menu.OverlayIconDropdownMenu
import top.yukonga.miuix.kmp.menu.WindowDropdownMenu
import top.yukonga.miuix.kmp.menu.WindowIconCascadingDropdownMenu
import top.yukonga.miuix.kmp.menu.WindowIconDropdownMenu
import top.yukonga.miuix.kmp.overlay.OverlayBottomSheet
import top.yukonga.miuix.kmp.overlay.OverlayCascadingListPopup
import top.yukonga.miuix.kmp.overlay.OverlayDialog
import top.yukonga.miuix.kmp.overlay.OverlayListPopup
import top.yukonga.miuix.kmp.preference.OverlayDropdownPreference
import top.yukonga.miuix.kmp.preference.OverlaySpinnerPreference
import top.yukonga.miuix.kmp.preference.WindowDropdownPreference
import top.yukonga.miuix.kmp.preference.WindowSpinnerPreference
import top.yukonga.miuix.kmp.window.WindowBottomSheet
import top.yukonga.miuix.kmp.window.WindowCascadingListPopup
import top.yukonga.miuix.kmp.window.WindowDialog
import top.yukonga.miuix.kmp.window.WindowListPopup

@Composable
internal fun RenderSnackbar(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val data = object : SnackbarData {
        override val visuals = SnackbarVisuals(
            message = item.label,
            actionLabel = item.actionLabel,
            withDismissAction = false,
            duration = SnackbarDuration.Indefinite,
        )

        override suspend fun dismiss() = events.dismiss()
        override suspend fun performAction() = events.patch(action = "action")
    }
    Snackbar(data = data, modifier = modifier)
}

@Composable
internal fun RenderDialog(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val confirm = item.actionLabel?.takeIf(String::isNotBlank) ?: localized("确定", "OK", "OK", "확인")
    val content: @Composable () -> Unit = {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End),
        ) {
            TextButton(text = localized("取消", "Cancel", "キャンセル", "취소"), onClick = events::dismiss)
            TextButton(
                text = confirm,
                onClick = events::click,
                colors = ButtonDefaults.textButtonColorsPrimary(),
            )
        }
    }
    if (item.variant == "window") {
        WindowDialog(
            show = item.show,
            modifier = modifier,
            title = item.label,
            summary = item.supporting,
            defaultWindowInsetsPadding = false,
            onDismissRequest = events::dismiss,
            content = content,
        )
    } else {
        OverlayDialog(
            show = item.show,
            modifier = modifier,
            title = item.label,
            summary = item.supporting,
            defaultWindowInsetsPadding = false,
            renderInRootScaffold = false,
            onDismissRequest = events::dismiss,
            content = content,
        )
    }
}

@Composable
internal fun RenderBottomSheet(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val content: @Composable () -> Unit = {
        item.options().forEachIndexed { index, tab ->
            BasicComponent(
                title = tab.label,
                startAction = tab.icon.takeIf(String::isNotBlank)?.let {
                    { RendererIcon(it, null) }
                },
                onClick = { events.select(index, tab) },
                enabled = item.enabled,
            )
        }
        item.supporting?.let { Text(it, Modifier.padding(16.dp)) }
    }
    if (item.variant == "window") {
        WindowBottomSheet(
            show = item.show,
            modifier = modifier,
            title = item.label,
            defaultWindowInsetsPadding = false,
            onDismissRequest = events::dismiss,
            content = content,
        )
    } else {
        OverlayBottomSheet(
            show = item.show,
            modifier = modifier,
            title = item.label,
            defaultWindowInsetsPadding = false,
            renderInRootScaffold = false,
            onDismissRequest = events::dismiss,
            content = content,
        )
    }
}

@Composable
internal fun RenderListPopup(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val content: @Composable () -> Unit = {
        val choices = item.options()
        ListPopupColumn {
            choices.forEachIndexed { index, tab ->
                DropdownImpl(
                    text = tab.label,
                    optionSize = choices.size,
                    isSelected = index == item.selectedIndex(),
                    index = index,
                    enabled = item.enabled,
                    onSelectedIndexChange = { events.select(it, choices[it]) },
                )
            }
        }
    }
    if (item.variant == "window") {
        WindowListPopup(
            show = item.show,
            popupModifier = modifier,
            onDismissRequest = events::dismiss,
            content = content,
        )
    } else {
        OverlayListPopup(
            show = item.show,
            popupModifier = modifier,
            renderInRootScaffold = false,
            onDismissRequest = events::dismiss,
            content = content,
        )
    }
}

@Composable
internal fun RenderCascadingPopup(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    // NavTabDto has no nested children field. A single official child is derived from each tab.
    val entries = listOf(item.cascadingEntry(events))
    if (item.variant == "window") {
        WindowCascadingListPopup(
            show = item.show,
            entries = entries,
            onDismissRequest = events::dismiss,
            popupModifier = modifier,
        )
    } else {
        OverlayCascadingListPopup(
            show = item.show,
            entries = entries,
            onDismissRequest = events::dismiss,
            popupModifier = modifier,
            renderInRootScaffold = false,
        )
    }
}

@Composable
internal fun RenderDropdownMenu(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    // These official menu wrappers own expanded state and expose no ItemDto.show parameter.
    val entry = item.dropdownEntry(events)
    val expanded: (Boolean) -> Unit = {
        events.patch(action = if (it) "expand" else "collapse")
    }
    if (item.variant == "window") {
        WindowDropdownMenu(
            entry = entry,
            title = item.label,
            summary = item.supporting,
            modifier = modifier,
            enabled = item.enabled,
            onExpandedChange = expanded,
        )
    } else {
        OverlayDropdownMenu(
            entry = entry,
            title = item.label,
            summary = item.supporting,
            modifier = modifier,
            enabled = item.enabled,
            renderInRootScaffold = false,
            onExpandedChange = expanded,
        )
    }
}

@Composable
internal fun RenderIconDropdownMenu(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    // These official icon-menu wrappers own expanded state and expose no ItemDto.show parameter.
    val entry = item.dropdownEntry(events)
    val expanded: (Boolean) -> Unit = {
        events.patch(action = if (it) "expand" else "collapse")
    }
    if (item.variant == "window") {
        WindowIconDropdownMenu(
            entry = entry,
            modifier = modifier,
            enabled = item.enabled,
            onExpandedChange = expanded,
        ) { RendererIcon(item.icon ?: "more", item.label) }
    } else {
        OverlayIconDropdownMenu(
            entry = entry,
            modifier = modifier,
            enabled = item.enabled,
            renderInRootScaffold = false,
            onExpandedChange = expanded,
        ) { RendererIcon(item.icon ?: "more", item.label) }
    }
}

@Composable
internal fun RenderIconCascadingMenu(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    // NavTabDto has no nested children; official wrappers also expose no ItemDto.show parameter.
    val entry = item.cascadingEntry(events)
    val expanded: (Boolean) -> Unit = {
        events.patch(action = if (it) "expand" else "collapse")
    }
    if (item.variant == "window") {
        WindowIconCascadingDropdownMenu(
            entry = entry,
            modifier = modifier,
            enabled = item.enabled,
            onExpandedChange = expanded,
        ) { RendererIcon(item.icon ?: "tune", item.label) }
    } else {
        OverlayIconCascadingDropdownMenu(
            entry = entry,
            modifier = modifier,
            enabled = item.enabled,
            renderInRootScaffold = false,
            onExpandedChange = expanded,
        ) { RendererIcon(item.icon ?: "tune", item.label) }
    }
}

@Composable
internal fun RenderTooltip(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val state = rememberTooltipState(initialIsVisible = item.show, isPersistent = true)
    if (item.variant == "rich") {
        RichTooltipBox(
            text = item.supporting ?: item.label,
            title = item.label.takeIf { item.supporting != null },
            actionText = item.actionLabel,
            onActionClick = events::click,
            modifier = modifier,
            state = state,
            enabled = item.enabled,
        ) {
            IconButton(onClick = events::click, enabled = item.enabled) {
                RendererIcon(item.icon ?: "more", item.label)
            }
        }
    } else {
        TooltipBox(
            text = item.label,
            modifier = modifier,
            state = state,
            enabled = item.enabled,
        ) {
            IconButton(onClick = events::click, enabled = item.enabled) {
                RendererIcon(item.icon ?: "more", item.label)
            }
        }
    }
}

@Composable
internal fun RenderDropdownPreference(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val tabs = item.options()
    val choices = tabs.map { it.label }
    if (item.variant == "window") {
        WindowDropdownPreference(
            items = choices,
            selectedIndex = item.selectedIndex(),
            title = item.label,
            summary = item.supporting,
            modifier = modifier,
            enabled = item.enabled,
            onSelectedIndexChange = { events.select(it, tabs[it]) },
        )
    } else {
        OverlayDropdownPreference(
            items = choices,
            selectedIndex = item.selectedIndex(),
            title = item.label,
            summary = item.supporting,
            modifier = modifier,
            enabled = item.enabled,
            renderInRootScaffold = false,
            onSelectedIndexChange = { events.select(it, tabs[it]) },
        )
    }
}

@Composable
internal fun RenderSpinnerPreference(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val tabs = item.options()
    val choices = tabs.map { tab ->
        DropdownItem(
            text = tab.label,
            icon = tab.icon.takeIf(String::isNotBlank)?.let {
                { iconModifier -> RendererIcon(it, null, iconModifier) }
            },
        )
    }
    if (item.variant == "overlay") {
        OverlaySpinnerPreference(
            items = choices,
            selectedIndex = item.selectedIndex(),
            title = item.label,
            summary = item.supporting,
            modifier = modifier,
            enabled = item.enabled,
            renderInRootScaffold = false,
            onSelectedIndexChange = { events.select(it, tabs[it]) },
        )
    } else {
        WindowSpinnerPreference(
            items = choices,
            selectedIndex = item.selectedIndex(),
            title = item.label,
            summary = item.supporting,
            modifier = modifier,
            enabled = item.enabled,
            onSelectedIndexChange = { events.select(it, tabs[it]) },
        )
    }
}

private fun ItemDto.dropdownEntry(events: RendererEvents): DropdownEntry {
    val choices = options()
    return DropdownEntry(
        choices.mapIndexed { index, tab ->
            DropdownItem(
                text = tab.label,
                enabled = enabled,
                selected = index == selectedIndex(),
                onClick = { events.select(index, tab) },
                icon = tab.icon.takeIf(String::isNotBlank)?.let {
                    { iconModifier -> RendererIcon(it, null, iconModifier) }
                },
            )
        },
    )
}

private fun ItemDto.cascadingEntry(events: RendererEvents): DropdownEntry {
    val choices = options()
    return DropdownEntry(
        choices.mapIndexed { index, tab ->
            DropdownItem(
                text = tab.label,
                enabled = enabled,
                selected = index == selectedIndex(),
                icon = tab.icon.takeIf(String::isNotBlank)?.let {
                    { iconModifier -> RendererIcon(it, null, iconModifier) }
                },
                children = listOf(
                    DropdownItem(
                        text = tab.label,
                        enabled = enabled,
                        selected = index == selectedIndex(),
                        onClick = { events.select(index, tab) },
                    ),
                ),
            )
        },
    )
}
