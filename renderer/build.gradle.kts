import org.jetbrains.kotlin.gradle.ExperimentalWasmDsl

plugins {
    kotlin("multiplatform") version "2.4.20"
    kotlin("plugin.serialization") version "2.4.20"
    id("org.jetbrains.compose") version "1.12.0"
    id("org.jetbrains.kotlin.plugin.compose") version "2.4.20"
}

group = "io.github.lazyboneslzy.miuixcanvas"
version = "0.1.0"

kotlin {
    @OptIn(ExperimentalWasmDsl::class)
    wasmJs {
        outputModuleName = "miuixRenderer"
        browser {
            commonWebpackConfig {
                outputFileName = "miuixRenderer.js"
            }
            testTask {
                useKarma {
                    useChromeHeadlessNoSandbox()
                }
            }
        }
        binaries.executable()
    }

    sourceSets {
        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.components.resources)
            implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
            implementation("top.yukonga.miuix.kmp:miuix-ui:0.9.4-rc01")
            implementation("top.yukonga.miuix.kmp:miuix-preference:0.9.4-rc01")
            implementation("top.yukonga.miuix.kmp:miuix-icons:0.9.4-rc01")
            implementation("top.yukonga.miuix.kmp:miuix-blur:0.9.4-rc01")
            implementation("top.yukonga.miuix.kmp:miuix-nav:0.9.4-rc01")
            implementation("io.coil-kt.coil3:coil-compose:3.5.0")
            implementation("io.coil-kt.coil3:coil-network-ktor3:3.5.0")
            implementation("io.ktor:ktor-client-core:3.3.1")
        }
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
    }
}
