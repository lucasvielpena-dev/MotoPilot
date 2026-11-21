package com.rota.entregadores.ui.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

object RotaColors {
    val NavyBg = Color(0xFF1D2232)
    val CardBg = Color(0xFF252B3D)
    val TileBg = Color(0xFF22283A)
    val InsetBg = Color(0xFF1A1F2E)
    val ButtonSecondary = Color(0xFF282F44)
    val BlueLight = Color(0xFF4AA3FF)
    val BlueDeep = Color(0xFF2F5BEA)
    val BlueSoftText = Color(0xFF9EC4FF)
    val GreenGanho = Color(0xFF4ADE9A)
    val RedGasto = Color(0xFFFF6B86)
    val TextPrimary = Color(0xFFF1F5FF)
    val TextMuted = Color(0xFF94A3B8)
}

val BlueGradientBrush = Brush.linearGradient(
    colors = listOf(RotaColors.BlueLight, RotaColors.BlueDeep)
)

val GlassOdometerBrush = Brush.linearGradient(
    colors = listOf(
        Color(0x334AA3FF),
        Color(0x1F2F5BEA),
        Color(0x7A1E263C)
    )
)

fun Modifier.neuCardModifier(): Modifier = this
    .shadow(
        elevation = 14.dp,
        shape = RoundedCornerShape(26.dp),
        ambientColor = Color(0xB80C0F19),
        spotColor = Color(0xB80C0F19)
    )
    .clip(RoundedCornerShape(26.dp))
    .background(RotaColors.CardBg)
    .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(26.dp))

fun Modifier.glassOdometerModifier(): Modifier = this
    .shadow(
        elevation = 16.dp,
        shape = RoundedCornerShape(26.dp),
        ambientColor = Color(0xB00B0E18),
        spotColor = Color(0x552F5BEA)
    )
    .clip(RoundedCornerShape(26.dp))
    .background(GlassOdometerBrush)
    .border(1.dp, Color(0x47A4D2FF), RoundedCornerShape(26.dp))

fun Modifier.neuInsetModifier(radiusDp: Int = 18): Modifier = this
    .clip(RoundedCornerShape(radiusDp.dp))
    .background(RotaColors.InsetBg)
    .border(1.dp, Color.Black.copy(alpha = 0.35f), RoundedCornerShape(radiusDp.dp))

private val RotaDarkScheme = darkColorScheme(
    primary = RotaColors.BlueLight,
    secondary = RotaColors.BlueDeep,
    background = RotaColors.NavyBg,
    surface = RotaColors.CardBg,
    onPrimary = Color.White,
    onBackground = RotaColors.TextPrimary,
    onSurface = RotaColors.TextPrimary
)

@Composable
fun RotaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = RotaDarkScheme,
        content = content
    )
}
