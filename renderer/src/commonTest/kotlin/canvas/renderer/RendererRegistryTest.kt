package canvas.renderer

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlinx.serialization.encodeToString
import top.yukonga.miuix.kmp.icon.MiuixIcons
import top.yukonga.miuix.kmp.icon.extended.Back
import top.yukonga.miuix.kmp.theme.ColorSchemeMode

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
        val request = rendererJson.decodeFromString<RenderRequest>(
            """{"type":"render","requestId":"s:1","interactive":false,"lang":"zh","theme":{"mode":"light","seed":"#3482FF","monet":true},"screen":{"id":"s","name":"Home","x":0,"y":0,"preset":"phone","items":[{"id":"bar","kind":"topAppBar","x":0,"y":0,"w":412,"h":72,"label":"设置","icon":"arrow_back","to":"back","variant":"small"},{"id":"b","kind":"button","x":16,"y":80,"w":180,"h":50,"label":"OK","icon":null}]}}""",
        )
        assertEquals("topAppBar", request.screen.items.first().kind)
        assertEquals("arrow_back", request.screen.items.first().icon)
        assertEquals("back", request.screen.items.first().to)
        assertEquals(null, request.screen.items.last().icon)
    }

    @Test
    fun coercesNullItemStringsAndOmitsNullEventFields() {
        val request = rendererJson.decodeFromString<RenderRequest>(
            """{"type":"render","screen":{"items":[{"id":"nav","kind":"floatingNav","x":0,"y":792,"w":412,"h":100,"label":null,"variant":null}]}}""",
        )
        assertEquals("", request.screen.items.single().label)
        assertEquals(null, request.screen.items.single().variant)
        val encoded = rendererJson.encodeToString(RendererEvent(type = "patch", itemId = "nav", selected = 1))
        assertFalse(encoded.contains("label"))
        assertFalse(encoded.contains("variant"))
    }

    @Test
    fun requestIgnoresForwardCompatibleFields() {
        val request = rendererJson.decodeFromString<RenderRequest>(
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
    fun skipsRenderedUntilARealScreenArrives() {
        assertEquals(false, hasRenderableRequest(RenderRequest()))
        assertEquals(false, hasRenderableRequest(RenderRequest(requestId = "x")))
        assertEquals(true, hasRenderableRequest(RenderRequest(requestId = "x", screen = ScreenDto(id = "home"))))
    }

    @Test
    fun officialThemeUsesHyperOSUnlessMonetIsOn() {
        assertEquals(ColorSchemeMode.Light, officialSchemeMode("light", monet = false))
        assertEquals(ColorSchemeMode.Dark, officialSchemeMode("dark", monet = false))
        assertEquals(ColorSchemeMode.MonetLight, officialSchemeMode("light", monet = true))
        assertEquals(ColorSchemeMode.MonetDark, officialSchemeMode("dark", monet = true))
        assertEquals(ColorSchemeMode.Light, officialThemeController(dark = false, monet = true, seed = null).colorSchemeMode)
        assertEquals(
            ColorSchemeMode.MonetLight,
            officialThemeController(dark = false, monet = true, seed = androidx.compose.ui.graphics.Color(0xFF3482FF)).colorSchemeMode,
        )
    }

    @Test
    fun officialPartsDoNotFillABoxThatWouldSquashThem() {
        assertEquals(ItemRenderFit.Hug, itemRenderFit("switch"))
        assertEquals(ItemRenderFit.Hug, itemRenderFit("checkbox"))
        assertEquals(ItemRenderFit.Hug, itemRenderFit("radio"))
        assertEquals(ItemRenderFit.WidthHug, itemRenderFit("switchPref"))
        assertEquals(ItemRenderFit.WidthHug, itemRenderFit("arrowPref"))
        assertEquals(ItemRenderFit.WidthHug, itemRenderFit("smallTitle"))
        assertEquals(ItemRenderFit.WidthHug, itemRenderFit("text"))
        assertEquals(ItemRenderFit.WidthHug, itemRenderFit("button"))
        assertEquals(ItemRenderFit.WidthHug, itemRenderFit("textField"))
        assertEquals(ItemRenderFit.WidthHug, itemRenderFit("numberPicker"))
        assertEquals(ItemRenderFit.WidthHug, itemRenderFit("searchBar"))
        assertEquals(ItemRenderFit.WidthHug, itemRenderFit("topAppBar"))
        assertEquals(ItemRenderFit.Fill, itemRenderFit("card"))
        HANDLED_ITEM_KINDS.forEach { itemRenderFit(it) }
    }

    @Test
    fun stackedPreferencesShareOneCard() {
        val items = listOf(
            ItemDto(id = "a", kind = "switchPref", x = 16f, y = 100f, w = 380f, h = 56f),
            ItemDto(id = "b", kind = "switchPref", x = 16f, y = 156f, w = 380f, h = 56f),
            ItemDto(id = "c", kind = "arrowPref", x = 16f, y = 300f, w = 380f, h = 80f),
            ItemDto(id = "d", kind = "card", x = 16f, y = 400f, w = 380f, h = 88f, parentId = null),
        )
        val groups = preferenceGroups(items)
        assertEquals(2, groups.size)
        assertEquals(listOf("a", "b"), groups[0].items.map { it.id })
        assertEquals(112f, groups[0].h)
        assertEquals(listOf("c"), groups[1].items.map { it.id })
        assertEquals(false, items[3].sitsInPreferenceCard())
    }

    @Test
    fun swipePicksOfficialDirectionAndDestination() {
        val swipe = mapOf("left" to "gallery", "right" to "back")
        assertEquals("gallery" to "slide", swipeNavigate(swipe, androidx.compose.ui.geometry.Offset(-80f, 4f), 64f))
        assertEquals("back" to "slideLeft", swipeNavigate(swipe, androidx.compose.ui.geometry.Offset(80f, 2f), 64f))
        assertEquals(null, swipeNavigate(swipe, androidx.compose.ui.geometry.Offset(-10f, 0f), 64f))
    }
}
