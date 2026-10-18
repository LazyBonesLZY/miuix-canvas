package webfont

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class FontFaceDeclTest {
    @Test
    fun selectsTheSmallestSupportedFormat() {
        val face = parseCssFontFaces("""
            @font-face { src: url('large.ttf') format('truetype'), url('small.woff2') format('woff2'); }
        """.trimIndent(), "https://fonts.example/css/font.css").single()
        assertEquals("https://fonts.example/css/small.woff2", face.url)
        assertTrue(face.covers(0x4e00))
    }

    @Test
    fun matchesUnsortedUnicodeRangesAndWildcards() {
        val face = parseCssFontFaces("""
            @font-face { src: url('subset.woff2'); unicode-range: U+9FFF, U+4E00-4EFF, U+30??; }
        """.trimIndent()).single()
        assertTrue(face.covers(0x4e2d))
        assertTrue(face.covers(0x3042))
        assertTrue(face.covers(0x9fff))
        assertFalse(face.covers(0x6000))
    }
    @Test
    fun overlappingRangesDoNotHideCoveredCodepoints() {
        val face = parseCssFontFaces("""
            @font-face { src: url('subset.woff2'); unicode-range: U+0000-FFFF, U+0100-0200, U+0300-0400; }
        """.trimIndent()).single()
        assertTrue(face.covers(0x4e2d))
        assertFalse(face.covers(0x10000))
    }

}
