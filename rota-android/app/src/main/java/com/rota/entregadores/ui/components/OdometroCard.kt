package com.rota.entregadores.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Navigation
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Save
import androidx.compose.material.icons.rounded.WarningAmber
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rota.entregadores.model.OdometerState
import com.rota.entregadores.model.StatusOdometro
import com.rota.entregadores.ui.theme.BlueGradientBrush
import com.rota.entregadores.ui.theme.RotaColors
import com.rota.entregadores.ui.theme.glassOdometerModifier
import com.rota.entregadores.ui.theme.neuInsetModifier
import com.rota.entregadores.util.formatarKm
import com.rota.entregadores.util.parseValorNumerico

@Composable
fun OdometroCard(
    odometerState: OdometerState,
    onIniciarOuContinuar: () -> Unit,
    onPausar: () -> Unit,
    onSalvarTrajeto: (Double, String) -> Unit,
    onZerar: () -> Unit
) {
    var kmManualTexto by remember { mutableStateOf("") }
    var erroManual by remember { mutableStateOf<String?>(null) }
    var feedback by remember { mutableStateOf<String?>(null) }

    val statusTexto = when (odometerState.status) {
        StatusOdometro.RUNNING -> {
            val base = if (odometerState.aguardandoSinal) {
                "Buscando sinal GPS..."
            } else {
                "Registrando via GPS (2º plano ativo)"
            }
            val precisao = odometerState.precisaoMetros?.let { " · Precisão ${it} m" } ?: ""
            base + precisao
        }
        StatusOdometro.PAUSED -> "Trajeto pausado"
        StatusOdometro.IDLE -> "Pronto para rodar"
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .glassOdometerModifier()
            .padding(20.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(RotaColors.BlueLight.copy(alpha = 0.2f))
                        .border(
                            1.dp,
                            RotaColors.BlueLight.copy(alpha = 0.35f),
                            RoundedCornerShape(12.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Navigation,
                        contentDescription = null,
                        tint = Color(0xFF7DC0FF),
                        modifier = Modifier.size(18.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "Odômetro GPS",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = statusTexto,
                        color = Color(0xFFB7C8EA),
                        fontSize = 11.sp,
                        maxLines = 1
                    )
                }
            }

            if (feedback != null) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Rounded.Check,
                        contentDescription = null,
                        tint = RotaColors.GreenGanho,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = feedback!!,
                        color = RotaColors.GreenGanho,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Leitura grande dos km
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.Bottom
        ) {
            Text(
                text = formatarKm(odometerState.kmAtual),
                color = Color.White,
                fontSize = 48.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "km",
                color = RotaColors.BlueSoftText,
                fontSize = 18.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }

        // Alerta de erro específico da API de localização
        if (odometerState.erroMensagem != null) {
            Spacer(modifier = Modifier.height(14.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(RotaColors.RedGasto.copy(alpha = 0.16f))
                    .border(
                        1.dp,
                        RotaColors.RedGasto.copy(alpha = 0.35f),
                        RoundedCornerShape(16.dp)
                    )
                    .padding(12.dp),
                verticalAlignment = Alignment.Top
            ) {
                Icon(
                    imageVector = Icons.Rounded.WarningAmber,
                    contentDescription = null,
                    tint = RotaColors.RedGasto,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = odometerState.erroMensagem,
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    if (odometerState.erroSugestao != null) {
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = odometerState.erroSugestao,
                            color = Color(0xFFFFD3DC),
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Botões principais
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (odometerState.status == StatusOdometro.RUNNING) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(RotaColors.ButtonSecondary)
                        .clickable { onPausar() },
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Rounded.Pause,
                            contentDescription = null,
                            tint = RotaColors.BlueLight,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Pausar",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            } else {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(BlueGradientBrush)
                        .clickable {
                            feedback = null
                            onIniciarOuContinuar()
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Rounded.PlayArrow,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (odometerState.status == StatusOdometro.PAUSED) "Continuar" else "Iniciar",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            val podeSalvar = odometerState.kmAtual > 0.0
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(
                        if (podeSalvar && odometerState.status == StatusOdometro.RUNNING) {
                            BlueGradientBrush
                        } else if (podeSalvar) {
                            SolidColor(RotaColors.ButtonSecondary)
                        } else {
                            SolidColor(Color(0xB31B2133))
                        }
                    )
                    .clickable(enabled = podeSalvar) {
                        onSalvarTrajeto(odometerState.kmAtual, "gps")
                        feedback = "Trajeto salvo!"
                    },
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Rounded.Save,
                        contentDescription = null,
                        tint = if (podeSalvar) {
                            if (odometerState.status == StatusOdometro.RUNNING) Color.White else RotaColors.GreenGanho
                        } else {
                            Color(0xFF64748B)
                        },
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Salvar trajeto",
                        color = if (podeSalvar) Color.White else Color(0xFF64748B),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1
                    )
                }
            }

            if (odometerState.status == StatusOdometro.PAUSED && odometerState.kmAtual > 0.0) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(RotaColors.ButtonSecondary)
                        .clickable { onZerar() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Refresh,
                        contentDescription = "Descartar trajeto atual",
                        tint = RotaColors.TextMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        HorizontalDivider(color = Color.White.copy(alpha = 0.1f))
        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "Ou adicione km manualmente",
            color = Color(0xFFB9C7E4),
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier
                    .weight(1f)
                    .height(46.dp)
                    .neuInsetModifier(16)
                    .padding(horizontal = 14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(modifier = Modifier.weight(1f)) {
                    if (kmManualTexto.isEmpty()) {
                        Text(
                            text = "Ex: 38,5",
                            color = Color(0xFF64748B),
                            fontSize = 14.sp
                        )
                    }
                    BasicTextField(
                        value = kmManualTexto,
                        onValueChange = {
                            kmManualTexto = it
                            erroManual = null
                        },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        textStyle = TextStyle(
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        ),
                        cursorBrush = SolidColor(RotaColors.BlueLight),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                Text(
                    text = "km",
                    color = RotaColors.TextMuted,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Box(
                modifier = Modifier
                    .height(46.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(RotaColors.ButtonSecondary)
                    .clickable {
                        val valor = parseValorNumerico(kmManualTexto)
                        if (valor == null) {
                            erroManual = "Digite uma distância válida em km."
                        } else {
                            onSalvarTrajeto(valor, "manual")
                            kmManualTexto = ""
                            erroManual = null
                            feedback = "${formatarKm(valor)} km adicionados!"
                        }
                    }
                    .padding(horizontal = 14.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Rounded.Add,
                        contentDescription = null,
                        tint = RotaColors.BlueLight,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Adicionar",
                        color = Color(0xFFCFE4FF),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        if (erroManual != null) {
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = erroManual!!,
                color = RotaColors.RedGasto,
                fontSize = 12.sp
            )
        }
    }
}
