import { describe, expect, it } from "vitest";
import { LANGS } from "./types";
import { KIND_TEXT, kindShort } from "./i18n";
import { KIND_ORDER, KIND_SPEC, KIND_SET, composableOf, makeItem } from "./tokens";

describe("KIND_SPEC coverage", () => {
  it("has a spec, localized name, and composable for every kind", () => {
    for (const kind of KIND_ORDER) {
      expect(KIND_SPEC[kind].kind).toBe(kind);
      expect(KIND_SPEC[kind].composable.length).toBeGreaterThan(0);
      for (const { key } of LANGS) {
        expect(KIND_TEXT[key][kind].length).toBeGreaterThan(0);
      }
    }
    expect(KIND_SET.size).toBe(KIND_ORDER.length);
  });

  it("uses official Miuix default sizes", () => {
    expect(KIND_SPEC.switch).toMatchObject({ w: expect.any(Function), h: 28 });
    expect(KIND_SPEC.switch.w("phone")).toBe(49);
    expect(KIND_SPEC.checkbox.h).toBe(26);
    expect(KIND_SPEC.radio.h).toBe(26);
    expect(KIND_SPEC.fab.h).toBe(60);
    expect(KIND_SPEC.iconButton.h).toBe(40);
    expect(KIND_SPEC.searchBar.h).toBe(45);
    expect(KIND_SPEC.tabRow.h).toBe(42);
    expect(KIND_SPEC.slider.h).toBe(28);
    expect(KIND_SPEC.floatingNav.h).toBe(52);
    expect(KIND_SPEC.rangeSlider.from).toBe(0.2);
    expect(KIND_SPEC.button.variants?.[0]).toBe("secondary");
    expect(KIND_SPEC.topAppBar.h).toBe(72);
    expect(KIND_SPEC.pullToRefresh.h).toBe(20);
    expect(KIND_SPEC.breadcrumb.h).toBe(48);
  });

  it("maps variants to the real composable names", () => {
    expect(composableOf({ kind: "dialog", variant: "window" })).toBe("WindowDialog");
    expect(composableOf({ kind: "dialog", variant: "overlay" })).toBe("OverlayDialog");
    expect(composableOf({ kind: "tabRow", variant: "contour" })).toBe("TabRowWithContour");
    expect(composableOf({ kind: "slider", variant: "vertical" })).toBe("VerticalSlider");
    expect(composableOf({ kind: "progress", variant: "infinite" })).toBe("InfiniteProgressIndicator");
    expect(composableOf({ kind: "iconDropdownMenu", variant: "overlay" })).toBe("OverlayIconDropdownMenu");
    expect(composableOf({ kind: "iconDropdownMenu", variant: "window" })).toBe("WindowIconDropdownMenu");
    expect(composableOf({ kind: "iconCascadingMenu", variant: "window" })).toBe("WindowIconCascadingDropdownMenu");
    expect(composableOf({ kind: "spinnerPref", variant: "overlay" })).toBe("OverlaySpinnerPreference");
    expect(composableOf({ kind: "dropdownPref", variant: "window" })).toBe("WindowDropdownPreference");
    expect(composableOf({ kind: "listPopup", variant: "window" })).toBe("WindowListPopup");
    expect(composableOf({ kind: "cascadingPopup", variant: "overlay" })).toBe("OverlayCascadingListPopup");
    expect(composableOf({ kind: "button", variant: "text" })).toBe("TextButton");
    expect(composableOf({ kind: "topAppBar", variant: "small" })).toBe("SmallTopAppBar");
    expect(composableOf({ kind: "dropdown", variant: "overlay" })).toBe("OverlayDropdownPreference");
    expect(composableOf({ kind: "dropdown", variant: "window" })).toBe("WindowDropdownPreference");
  });

  it("can name every public composable from the official component index", () => {
    const named = new Set(
      KIND_ORDER.flatMap((kind) => {
        const variants = KIND_SPEC[kind].variants ?? [undefined];
        return variants.map((variant) => composableOf({ kind, variant }));
      }),
    );
    const official = [
      "Surface", "TopAppBar", "SmallTopAppBar", "NavigationBar", "FloatingNavigationBar", "NavigationRail",
      "TabRow", "TabRowWithContour", "BreadcrumbBar", "Card", "BasicComponent", "Button",
      "IconButton", "TextButton", "Text", "SmallTitle", "TextField", "Switch", "Checkbox", "RadioButton",
      "Slider", "VerticalSlider", "RangeSlider", "NumberPicker", "LinearProgressIndicator",
      "CircularProgressIndicator", "InfiniteProgressIndicator", "Snackbar", "Tooltip",
      "RichTooltipBox", "Badge", "Icon", "FloatingActionButton", "FloatingToolbar",
      "HorizontalDivider", "VerticalDivider", "PullToRefresh", "SearchBar", "ColorPalette",
      "ColorPicker", "ArrowPreference", "SwitchPreference", "CheckboxPreference",
      "RadioButtonPreference", "SliderPreference", "RangeSliderPreference",
      "OverlayListPopup", "OverlayCascadingListPopup", "OverlayDropdownPreference",
      "OverlaySpinnerPreference", "OverlayDropdownMenu", "OverlayIconDropdownMenu",
      "OverlayIconCascadingDropdownMenu", "OverlayBottomSheet", "OverlayDialog",
      "WindowListPopup", "WindowCascadingListPopup", "WindowDropdownPreference",
      "WindowSpinnerPreference", "WindowDropdownMenu", "WindowIconDropdownMenu",
      "WindowIconCascadingDropdownMenu", "WindowBottomSheet", "WindowDialog",
    ];
    for (const api of official) {
      expect(named.has(api), api).toBe(true);
    }
  });

  it("creates a gray default Button like Miuix ButtonDefaults.buttonColors()", () => {
    const item = makeItem("button", "phone", "zh", 0, 0);
    expect(item.variant).toBe("secondary");
    expect(item.h).toBe(50);
    expect(item.icon).toBeUndefined();
  });

  it("shortens long palette names without dropping the composable", () => {
    expect(kindShort("iconCascadingMenu", "zh")).toBe("图标级联");
    expect(kindShort("iconCascadingMenu", "en")).toBe("Icon cascade");
    expect(KIND_TEXT.en.iconCascadingMenu).toContain("OverlayIconCascadingDropdownMenu");
  });

  it("does not put the palette glyph on preference rows", () => {
    expect(makeItem("switchPref", "phone", "zh", 0, 0).icon).toBeUndefined();
    expect(makeItem("arrowPref", "phone", "zh", 0, 0).icon).toBeUndefined();
  });
});
