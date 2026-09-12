package canvas.renderer

import androidx.compose.foundation.Image as ComposeImage
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.state.ToggleableState
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import top.yukonga.miuix.kmp.basic.Badge
import top.yukonga.miuix.kmp.basic.BasicComponent
import top.yukonga.miuix.kmp.basic.Button
import top.yukonga.miuix.kmp.basic.ButtonDefaults
import top.yukonga.miuix.kmp.basic.Card
import top.yukonga.miuix.kmp.basic.Checkbox
import top.yukonga.miuix.kmp.basic.CircularProgressIndicator
import top.yukonga.miuix.kmp.basic.ColorPalette
import top.yukonga.miuix.kmp.basic.ColorPicker
import top.yukonga.miuix.kmp.basic.FloatingActionButton
import top.yukonga.miuix.kmp.basic.FloatingToolbar
import top.yukonga.miuix.kmp.basic.HorizontalDivider
import top.yukonga.miuix.kmp.basic.Icon
import top.yukonga.miuix.kmp.basic.IconButton
import top.yukonga.miuix.kmp.basic.InfiniteProgressIndicator
import top.yukonga.miuix.kmp.basic.LinearProgressIndicator
import top.yukonga.miuix.kmp.basic.NumberPicker
import top.yukonga.miuix.kmp.basic.PullToRefresh
import top.yukonga.miuix.kmp.basic.PullToRefreshDefaults
import top.yukonga.miuix.kmp.basic.RadioButton
import top.yukonga.miuix.kmp.basic.RangeSlider
import top.yukonga.miuix.kmp.basic.Slider
import top.yukonga.miuix.kmp.basic.SmallTitle
import top.yukonga.miuix.kmp.basic.Surface
import top.yukonga.miuix.kmp.basic.Switch
import top.yukonga.miuix.kmp.basic.Text
import top.yukonga.miuix.kmp.basic.TextButton
import top.yukonga.miuix.kmp.basic.TextField
import top.yukonga.miuix.kmp.basic.VerticalDivider
import top.yukonga.miuix.kmp.basic.VerticalSlider
import top.yukonga.miuix.kmp.preference.ArrowPreference
import top.yukonga.miuix.kmp.preference.CheckboxPreference
import top.yukonga.miuix.kmp.preference.RadioButtonPreference
import top.yukonga.miuix.kmp.preference.RangeSliderPreference
import top.yukonga.miuix.kmp.preference.SliderPreference
import top.yukonga.miuix.kmp.preference.SwitchPreference
import top.yukonga.miuix.kmp.blur.LayerBackdrop
import top.yukonga.miuix.kmp.theme.MiuixTheme

/**
 * Renders one DTO with actual Miuix 0.9.4-rc01 composables (generic Compose Image for `image`).
 *
 * Position and freeform size remain the caller's responsibility: [modifier] is always received
 * from and applied at the component boundary.
 */
@Composable
fun ComponentRenderer(
    item: ItemDto,
    modifier: Modifier = Modifier,
    interactive: Boolean = true,
    requestId: String = "",
    backdrop: LayerBackdrop? = null,
    emit: (RendererEvent) -> Unit = {},
) {
    val events = RendererEvents(item, interactive, requestId, emit)
    if (
        backdrop != null &&
        item.kind != "blur" &&
        item.kind != "navigationBar" &&
        item.kind != "floatingNav" &&
        (item.effect == "textureBlur" || item.effect == "progressiveTextureBlur")
    ) {
        TextureBlurHost(
            modifier = modifier,
            backdrop = backdrop,
            progressive = item.effect == "progressiveTextureBlur",
            blurRadius = item.blurRadius ?: 20f,
            noiseCoefficient = item.noiseCoefficient ?: if (item.effect == "progressiveTextureBlur") 0f else 0.0045f,
            direction = item.effectDirection,
        ) {
            ComponentRenderer(
                item = item.copy(effect = null),
                modifier = Modifier.fillMaxSize(),
                interactive = interactive,
                requestId = requestId,
                backdrop = backdrop,
                emit = emit,
            )
        }
        return
    }
    when (item.kind) {
        "button" -> RenderButton(item, modifier, events)
        "iconButton" -> IconButton(
            onClick = events::click,
            modifier = modifier,
            enabled = item.enabled,
        ) {
            RendererIcon(item.icon, item.label.ifBlank { "More" })
        }

        // FloatingActionButton has no enabled parameter; enabled gates its emitted callback.
        "fab" -> FloatingActionButton(onClick = events::click, modifier = modifier) {
            RendererIcon(item.icon ?: "add", item.label.ifBlank { "Add" })
        }

        "floatingToolbar" -> FloatingToolbar(modifier = modifier) {
            Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                item.options().forEachIndexed { index, tab ->
                    IconButton(
                        onClick = { events.select(index, tab) },
                        enabled = item.enabled,
                    ) {
                        RendererIcon(tab.icon, tab.label)
                    }
                }
            }
        }

        "topAppBar" -> RenderTopAppBar(item, modifier)
        "smallTitle" -> SmallTitle(text = item.label, modifier = modifier)
        "navigationBar" -> RenderNavigationBar(item, modifier, events, backdrop)
        "floatingNav" -> RenderFloatingNavigationBar(item, modifier, events, backdrop)
        "navigationRail" -> RenderNavigationRail(item, modifier, events)
        "tabRow" -> RenderTabRow(item, modifier, events)
        "searchBar" -> RenderSearchBar(item, modifier, events)
        "breadcrumb" -> RenderBreadcrumb(item, modifier, events)

        "card" -> Card(
            modifier = modifier,
            onClick = events::click,
        ) {
            Text(text = item.label, style = MiuixTheme.textStyles.title3)
            item.supporting?.let {
                Text(
                    text = it,
                    style = MiuixTheme.textStyles.body2,
                    color = MiuixTheme.colorScheme.onSurfaceVariantSummary,
                )
            }
        }

        "surface" -> {
            if (item.enabled) {
                Surface(onClick = events::click, modifier = modifier) {
                    if (item.label.isNotBlank()) Text(item.label, Modifier.padding(12.dp))
                }
            } else {
                Surface(modifier = modifier) {
                    if (item.label.isNotBlank()) Text(item.label, Modifier.padding(12.dp))
                }
            }
        }

        "divider" -> if (item.variant == "vertical") {
            VerticalDivider(modifier = modifier)
        } else {
            HorizontalDivider(modifier = modifier)
        }

        "snackbar" -> RenderSnackbar(item, modifier, events)
        "dialog" -> RenderDialog(item, modifier, events)
        "bottomSheet" -> RenderBottomSheet(item, modifier, events)
        "listPopup" -> RenderListPopup(item, modifier, events)
        "cascadingPopup" -> RenderCascadingPopup(item, modifier, events)
        "dropdownMenu" -> RenderDropdownMenu(item, modifier, events)
        "iconDropdownMenu" -> RenderIconDropdownMenu(item, modifier, events)
        "iconCascadingMenu" -> RenderIconCascadingMenu(item, modifier, events)
        "tooltip" -> RenderTooltip(item, modifier, events)

        "textField" -> TextField(
            value = item.label,
            onValueChange = { events.patch(action = "input", label = it) },
            modifier = modifier,
            label = item.supporting ?: item.label,
            useLabelAsPlaceholder = item.supporting.isNullOrBlank(),
            enabled = item.enabled,
            singleLine = !item.multiline,
        )

        "switch" -> Switch(
            checked = item.checked ?: false,
            onCheckedChange = events::checked,
            modifier = modifier,
            enabled = item.enabled,
        )

        "checkbox" -> Checkbox(
            state = if (item.checked == true) ToggleableState.On else ToggleableState.Off,
            onClick = { events.checked(item.checked != true) },
            modifier = modifier,
            enabled = item.enabled,
        )

        "radio" -> RadioButton(
            selected = item.checked ?: false,
            onClick = { events.checked(item.checked != true) },
            modifier = modifier,
            enabled = item.enabled,
        )

        "slider" -> RenderSlider(item, modifier, events)
        "rangeSlider" -> RangeSlider(
            value = item.normalizedRange(),
            onValueChange = events::range,
            modifier = modifier,
            enabled = item.enabled,
        )

        "dropdown" -> RenderDropdownPreference(item, modifier, events)
        "numberPicker" -> {
            // ItemDto has no picker range, wrapAround, or visibleItemCount fields.
            val number = item.label.toIntOrNull()?.coerceIn(0, 99) ?: 12
            NumberPicker(
                value = number,
                onValueChange = {
                    events.patch(action = "number", value = it.toFloat(), label = it.toString())
                },
                modifier = modifier,
                enabled = item.enabled,
                range = 0..99,
            )
        }

        "colorPicker" -> {
            ColorPicker(
                color = item.seedColor(),
                onColorChanged = { events.patch(action = "color", color = it.toHex()) },
                modifier = modifier,
            )
        }

        "colorPalette" -> {
            ColorPalette(
                color = item.seedColor(),
                onColorChanged = { events.patch(action = "color", color = it.toHex()) },
                modifier = modifier,
            )
        }

        "text" -> Text(
            text = item.label,
            modifier = modifier,
            style = when (item.textStyle) {
                "body2" -> MiuixTheme.textStyles.body2
                "button" -> MiuixTheme.textStyles.button
                "footnote1" -> MiuixTheme.textStyles.footnote1
                "footnote2" -> MiuixTheme.textStyles.footnote2
                "headline1" -> MiuixTheme.textStyles.headline1
                "headline2" -> MiuixTheme.textStyles.headline2
                "subtitle" -> MiuixTheme.textStyles.subtitle
                "title1" -> MiuixTheme.textStyles.title1
                "title2" -> MiuixTheme.textStyles.title2
                "title3" -> MiuixTheme.textStyles.title3
                "title4" -> MiuixTheme.textStyles.title4
                else -> MiuixTheme.textStyles.body1
            },
        )

        "image" -> if (!item.source.isNullOrBlank()) {
            AsyncImage(
                model = item.source,
                contentDescription = item.contentDescription ?: item.label.ifBlank { null },
                modifier = modifier,
            )
        } else {
            ComposeImage(
                imageVector = rendererIcon(item.icon ?: "image"),
                contentDescription = item.contentDescription ?: item.label.ifBlank { null },
                modifier = modifier,
            )
        }

        "badge" -> Badge(
            modifier = modifier,
            content = if (item.variant == "dot" || item.label.isBlank()) {
                null
            } else {
                { Text(item.label) }
            },
        )

        "icon" -> Icon(
            imageVector = rendererIcon(item.icon),
            contentDescription = item.label.ifBlank { null },
            modifier = modifier,
        )

        "progress" -> when (item.variant) {
            "circular" -> CircularProgressIndicator(
                progress = item.normalizedValue(),
                modifier = modifier,
            )

            "infinite" -> InfiniteProgressIndicator(modifier = modifier)
            else -> LinearProgressIndicator(
                progress = item.normalizedValue(),
                modifier = modifier,
            )
        }

        "pullToRefresh" -> PullToRefresh(
            isRefreshing = item.refreshing,
            onRefresh = { events.patch(action = "refresh", refreshing = true) },
            modifier = modifier,
            circleSize = PullToRefreshDefaults.circleSize,
        ) {
            Box(Modifier.fillMaxSize())
        }

        "scrollBar" -> RenderScrollBar(item, modifier)
        "blur" -> TextureBlurHost(
            modifier = modifier,
            backdrop = backdrop,
            blurRadius = item.blurRadius ?: 20f,
            noiseCoefficient = item.noiseCoefficient ?: 0.0045f,
        ) {
            Text(
                text = item.label,
                modifier = Modifier.align(Alignment.Center),
                style = MiuixTheme.textStyles.title3,
            )
        }

        "basicPref" -> BasicComponent(
            modifier = modifier,
            title = item.label,
            summary = item.supporting,
            enabled = item.enabled,
            onClick = events::click,
        )

        "switchPref" -> SwitchPreference(
            checked = item.checked ?: false,
            onCheckedChange = events::checked,
            title = item.label,
            modifier = modifier,
            summary = item.supporting,
            enabled = item.enabled,
        )

        "checkboxPref" -> CheckboxPreference(
            title = item.label,
            checked = item.checked ?: false,
            onCheckedChange = events::checked,
            modifier = modifier,
            summary = item.supporting,
            enabled = item.enabled,
        )

        "radioPref" -> RadioButtonPreference(
            title = item.label,
            selected = item.checked ?: false,
            onClick = { events.checked(item.checked != true) },
            modifier = modifier,
            summary = item.supporting,
            enabled = item.enabled,
        )

        "sliderPref" -> SliderPreference(
            value = item.normalizedValue(),
            onValueChange = events::value,
            modifier = modifier,
            title = item.label,
            summary = item.supporting,
            enabled = item.enabled,
        )

        "rangeSliderPref" -> RangeSliderPreference(
            value = item.normalizedRange(),
            onValueChange = events::range,
            modifier = modifier,
            title = item.label,
            summary = item.supporting,
            enabled = item.enabled,
        )

        "dropdownPref" -> RenderDropdownPreference(item, modifier, events)
        "spinnerPref" -> RenderSpinnerPreference(item, modifier, events)
        "arrowPref" -> ArrowPreference(
            title = item.label,
            modifier = modifier,
            summary = item.supporting,
            onClick = events::click,
            enabled = item.enabled,
        )

        else -> error("No official renderer registered for ${item.kind}")
    }
}

@Composable
private fun RenderButton(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    val enabled = item.enabled && item.variant != "disabled"
    if (item.variant == "text") {
        TextButton(
            text = item.label,
            onClick = events::click,
            modifier = modifier,
            enabled = enabled,
        )
    } else {
        Button(
            onClick = events::click,
            modifier = modifier,
            enabled = enabled,
            colors = if (item.variant == "primary") {
                ButtonDefaults.buttonColorsPrimary()
            } else {
                ButtonDefaults.buttonColors()
            },
        ) {
            item.icon?.let {
                RendererIcon(it, null)
                Spacer(Modifier.width(6.dp))
            }
            Text(item.label)
        }
    }
}

@Composable
private fun RenderSlider(item: ItemDto, modifier: Modifier, events: RendererEvents) {
    if (item.variant == "vertical") {
        VerticalSlider(
            value = item.normalizedValue(),
            onValueChange = events::value,
            modifier = modifier,
            enabled = item.enabled,
        )
    } else {
        Slider(
            value = item.normalizedValue(),
            onValueChange = events::value,
            modifier = modifier,
            enabled = item.enabled && item.variant != "disabled",
            steps = if (item.variant == "steps") 4 else 0,
            showKeyPoints = item.variant == "steps",
        )
    }
}
