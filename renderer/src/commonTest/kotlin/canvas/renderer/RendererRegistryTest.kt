package canvas.renderer

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlinx.serialization.json.Json
import top.yukonga.miuix.kmp.icon.MiuixIcons
import top.yukonga.miuix.kmp.icon.extended.Back

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
    fun mapsMaterialBackNameOntoOfficialIcon() {
        assertEquals(MiuixIcons.Back, rendererIcon("arrow_back"))
    }

    @Test
    fun ignoresComposeInternalPostMessages() {
        assertEquals(false, isRenderPayload("dispatchCoroutine"))
        assertEquals(false, isRenderPayload("ready"))
        assertEquals(true, isRenderPayload("""{"type":"render","screen":{}}"""))
    }

    @Test
    fun decodesTheEditorJsonShape() {
        val request = testJson.decodeFromString<RenderRequest>(
            """{"type":"render","requestId":"s:1","interactive":false,"lang":"zh","theme":{"mode":"light","seed":"#3482FF","monet":true},"screen":{"id":"s","name":"Home","x":0,"y":0,"preset":"phone","items":[{"id":"bar","kind":"topAppBar","x":0,"y":0,"w":412,"h":72,"label":"设置","icon":"arrow_back","to":"back","variant":"small"},{"id":"b","kind":"button","x":16,"y":80,"w":180,"h":50,"label":"OK","icon":null}]}}""",
        )
        assertEquals("topAppBar", request.screen.items.first().kind)
        assertEquals("arrow_back", request.screen.items.first().icon)
        assertEquals("back", request.screen.items.first().to)
        assertEquals(null, request.screen.items.last().icon)
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
