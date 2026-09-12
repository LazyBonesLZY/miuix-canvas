package canvas.renderer

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlinx.serialization.json.Json

private val testJson = Json { ignoreUnknownKeys = true }

class RendererRegistryTest {
    @Test
    fun handlesEveryEditorKind() {
        assertEquals(
            setOf(
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
            ),
            HANDLED_ITEM_KINDS,
        )
    }

    @Test
    fun requestIgnoresForwardCompatibleFields() {
        val request = testJson.decodeFromString<RenderRequest>(
            """{"type":"render","future":true,"screen":{"items":[{"id":"a","kind":"button","label":"OK","future":1}]}}""",
        )
        assertEquals("button", request.screen.items.single().kind)
    }

    @Test
    fun mapsCanvasTransitionsOntoOfficialNavPresets() {
        assertEquals("miuixDefault", officialNavTransitionName("slide"))
        assertEquals("miuixDefault", officialNavTransitionName("slideLeft"))
        assertEquals("modal", officialNavTransitionName("slideUp"))
        assertEquals("modal", officialNavTransitionName("slideDown"))
        assertEquals("none", officialNavTransitionName("fade"))
        assertEquals("none", officialNavTransitionName("none"))
    }

    @Test
    fun swipePicksOfficialDirectionAndDestination() {
        val swipe = mapOf("left" to "gallery", "right" to "back")
        assertEquals("gallery" to "slide", swipeNavigate(swipe, androidx.compose.ui.geometry.Offset(-80f, 4f), 64f))
        assertEquals("back" to "slideLeft", swipeNavigate(swipe, androidx.compose.ui.geometry.Offset(80f, 2f), 64f))
        assertEquals(null, swipeNavigate(swipe, androidx.compose.ui.geometry.Offset(-10f, 0f), 64f))
    }
}
