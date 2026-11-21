package com.rota.entregadores.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.TrendingDown
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
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rota.entregadores.data.RotaStorage
import com.rota.entregadores.model.FiltroPeriodo
import com.rota.entregadores.model.Lancamento
import com.rota.entregadores.model.Plataforma
import com.rota.entregadores.model.TipoLancamento
import com.rota.entregadores.model.Trajeto
import com.rota.entregadores.ui.theme.BlueGradientBrush
import com.rota.entregadores.ui.theme.RotaColors
import com.rota.entregadores.ui.theme.neuCardModifier
import com.rota.entregadores.ui.theme.neuInsetModifier
import com.rota.entregadores.util.filtrarPorPeriodo
import com.rota.entregadores.util.formatarKm
import com.rota.entregadores.util.formatarMoeda
import com.rota.entregadores.util.parseValorNumerico
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.Locale

@Composable
fun ResumoCard(
    periodo: FiltroPeriodo,
    onMudarPeriodo: (FiltroPeriodo) -> Unit,
    lancamentosPeriodo: List<Lancamento>,
    todosLancamentos: List<Lancamento>,
    trajetosPeriodo: List<Trajeto>
) {
    val context = LocalContext.current
    val storage = remember { RotaStorage(context) }
    var metaDiaria by remember { mutableStateOf(storage.carregarMetaDiaria()) }
    var metaTexto by remember {
        mutableStateOf(
            if (metaDiaria > 0.0) String.format(Locale("pt", "BR"), "%.2f", metaDiaria) else ""
        )
    }

    val ganhosHoje = remember(todosLancamentos) {
        filtrarPorPeriodo(todosLancamentos, FiltroPeriodo.HOJE) { it.dataIso }
            .filter { it.tipo == TipoLancamento.GANHO }
            .sumOf { it.valor }
    }
    val faltaParaMeta = (metaDiaria - ganhosHoje).coerceAtLeast(0.0)
    val progressoMeta = if (metaDiaria > 0.0) (ganhosHoje / metaDiaria).toFloat().coerceIn(0f, 1f) else 0f
    val metaAlcancada = metaDiaria > 0.0 && ganhosHoje >= metaDiaria

    val totalGanhos = lancamentosPeriodo
        .filter { it.tipo == TipoLancamento.GANHO }
        .sumOf { it.valor }
    val totalGastos = lancamentosPeriodo
        .filter { it.tipo == TipoLancamento.GASTO }
        .sumOf { it.valor }
    val lucro = totalGanhos - totalGastos
    val totalKm = trajetosPeriodo.sumOf { it.km }
    val ganhoPorKm = if (totalKm > 0.0) totalGanhos / totalKm else 0.0
    val lucroPorKm = if (totalKm > 0.0) lucro / totalKm else 0.0

    val temDados = lancamentosPeriodo.isNotEmpty() || trajetosPeriodo.isNotEmpty()
    val lucroPositivo = lucro > 0.0

    val dados7Dias = remember(todosLancamentos) {
        val zone = ZoneId.systemDefault()
        val hoje = LocalDate.now(zone)
        val nomesDias = listOf("Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb")
        val mapa = mutableMapOf<LocalDate, Double>()

        todosLancamentos.filter { it.tipo == TipoLancamento.GANHO }.forEach { item ->
            runCatching {
                val dia = Instant.parse(item.dataIso).atZone(zone).toLocalDate()
                mapa[dia] = (mapa[dia] ?: 0.0) + item.valor
            }
        }

        (6L downTo 0L).map { offset ->
            val data = hoje.minusDays(offset)
            val rotulo = if (offset == 0L) "Hoje" else nomesDias[data.dayOfWeek.value % 7]
            rotulo to (mapa[data] ?: 0.0)
        }
    }

    val total7Dias = dados7Dias.sumOf { it.second }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .neuCardModifier()
            .padding(20.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Resumo",
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = "${lancamentosPeriodo.size} ${if (lancamentosPeriodo.size == 1) "lançamento" else "lançamentos"}",
                color = RotaColors.TextMuted,
                fontSize = 12.sp
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Filtro Hoje / 7 dias / Mês
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .neuInsetModifier(16)
                .padding(6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            FiltroPeriodo.entries.forEach { opcao ->
                val ativo = periodo == opcao
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            if (ativo) BlueGradientBrush else SolidColor(Color.Transparent)
                        )
                        .clickable { onMudarPeriodo(opcao) },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = opcao.rotulo,
                        color = if (ativo) Color.White else RotaColors.TextMuted,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Aviso de resultado
        if (temDados) {
            val corAviso = if (lucroPositivo) RotaColors.GreenGanho else RotaColors.RedGasto
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(corAviso.copy(alpha = 0.14f))
                    .border(1.dp, corAviso.copy(alpha = 0.35f), RoundedCornerShape(16.dp))
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = if (lucroPositivo) Icons.Rounded.CheckCircle else Icons.Rounded.TrendingDown,
                        contentDescription = null,
                        tint = corAviso,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (lucroPositivo) "Você saiu ganhando ✓" else "Você saiu no prejuízo",
                        color = corAviso,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Text(
                    text = "${formatarMoeda(lucroPorKm)}/km",
                    color = corAviso,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        } else {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .neuInsetModifier(16)
                    .padding(14.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Registre ganhos, gastos ou trajetos para ver o balanço do período.",
                    color = RotaColors.TextMuted,
                    fontSize = 12.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Grade dos 6 indicadores
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricaTile("Ganhos", formatarMoeda(totalGanhos), RotaColors.GreenGanho, Modifier.weight(1f))
                MetricaTile("Gastos", formatarMoeda(totalGastos), RotaColors.RedGasto, Modifier.weight(1f))
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                val corLucro = when {
                    lucro > 0.0 -> RotaColors.GreenGanho
                    lucro < 0.0 -> RotaColors.RedGasto
                    else -> Color.White
                }
                MetricaTile("Lucro", formatarMoeda(lucro), corLucro, Modifier.weight(1f))
                MetricaTile("Km rodados", "${formatarKm(totalKm)} km", Color.White, Modifier.weight(1f))
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricaTile("Ganho por km", "${formatarMoeda(ganhoPorKm)}/km", Color(0xFF7DC0FF), Modifier.weight(1f))
                val corLucroKm = when {
                    lucroPorKm > 0.0 -> RotaColors.GreenGanho
                    lucroPorKm < 0.0 -> RotaColors.RedGasto
                    else -> Color(0xFFE2E8F0)
                }
                MetricaTile("Lucro por km", "${formatarMoeda(lucroPorKm)}/km", corLucroKm, Modifier.weight(1f))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        HorizontalDivider(color = Color.White.copy(alpha = 0.1f))
        Spacer(modifier = Modifier.height(14.dp))

        // Meta de ganho diário
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Rounded.Flag,
                    contentDescription = null,
                    tint = RotaColors.BlueLight,
                    modifier = Modifier.size(15.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Meta de ganho diário",
                    color = Color(0xFFE2E8F0),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
            Text(
                text = "Hoje: ${formatarMoeda(ganhosHoje)}",
                color = RotaColors.GreenGanho,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(46.dp)
                .neuInsetModifier(16)
                .padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "R$",
                color = RotaColors.BlueLight,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.width(8.dp))
            Box(modifier = Modifier.weight(1f)) {
                if (metaTexto.isEmpty()) {
                    Text(
                        text = "Ex: 200,00",
                        color = Color(0xFF64748B),
                        fontSize = 14.sp
                    )
                }
                BasicTextField(
                    value = metaTexto,
                    onValueChange = { digitado ->
                        metaTexto = digitado
                        if (digitado.trim().isEmpty()) {
                            metaDiaria = 0.0
                            storage.salvarMetaDiaria(0.0)
                        } else {
                            parseValorNumerico(digitado)?.let { v ->
                                metaDiaria = v
                                storage.salvarMetaDiaria(v)
                            }
                        }
                    },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    textStyle = TextStyle(
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold
                    ),
                    cursorBrush = SolidColor(RotaColors.BlueLight),
                    modifier = Modifier.fillMaxWidth()
                )
            }
            if (metaDiaria > 0.0) {
                Text(
                    text = "${(progressoMeta * 100).toInt()}%",
                    color = RotaColors.BlueSoftText,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(10.dp)
                .neuInsetModifier(10)
        ) {
            if (progressoMeta > 0f) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(progressoMeta)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(10.dp))
                        .background(
                            if (metaAlcancada) {
                                SolidColor(RotaColors.GreenGanho)
                            } else {
                                Brush.horizontalGradient(
                                    listOf(RotaColors.BlueDeep, RotaColors.BlueLight, RotaColors.GreenGanho)
                                )
                            }
                        )
                )
            }
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = when {
                metaDiaria <= 0.0 -> "Defina um valor acima para acompanhar quanto falta até a meta."
                metaAlcancada -> "Meta diária alcançada ✓"
                else -> "Faltam ${formatarMoeda(faltaParaMeta)} para alcançar a meta de ${formatarMoeda(metaDiaria)}."
            },
            color = if (metaAlcancada) RotaColors.GreenGanho else RotaColors.TextMuted,
            fontSize = 12.sp,
            fontWeight = if (metaAlcancada) FontWeight.SemiBold else FontWeight.Normal
        )

        Spacer(modifier = Modifier.height(16.dp))
        HorizontalDivider(color = Color.White.copy(alpha = 0.1f))
        Spacer(modifier = Modifier.height(14.dp))

        // Gráfico de barras dos últimos 7 dias
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Evolução dos ganhos (7 dias)",
                color = Color(0xFFCBD5E1),
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = formatarMoeda(total7Dias),
                color = RotaColors.GreenGanho,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
        Spacer(modifier = Modifier.height(10.dp))

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .neuInsetModifier(16)
                .padding(12.dp)
        ) {
            val maxVal = (dados7Dias.maxOfOrNull { it.second } ?: 0.0).coerceAtLeast(1.0)
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp)
            ) {
                val barSlotWidth = size.width / dados7Dias.size
                val barWidth = (barSlotWidth * 0.45f).coerceAtMost(30.dp.toPx())
                val grad = Brush.verticalGradient(
                    colors = listOf(RotaColors.GreenGanho, RotaColors.BlueDeep)
                )

                dados7Dias.forEachIndexed { idx, (_, valor) ->
                    val ratio = (valor / maxVal).toFloat().coerceIn(0f, 1f)
                    val barHeight = (size.height - 8.dp.toPx()) * ratio
                    val x = idx * barSlotWidth + (barSlotWidth - barWidth) / 2f
                    val y = size.height - barHeight
                    if (barHeight > 2f) {
                        drawRoundRect(
                            brush = grad,
                            topLeft = Offset(x, y),
                            size = Size(barWidth, barHeight),
                            cornerRadius = CornerRadius(8.dp.toPx(), 8.dp.toPx())
                        )
                    } else {
                        drawRoundRect(
                            color = Color.White.copy(alpha = 0.08f),
                            topLeft = Offset(x, size.height - 4.dp.toPx()),
                            size = Size(barWidth, 4.dp.toPx()),
                            cornerRadius = CornerRadius(4.dp.toPx(), 4.dp.toPx())
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(6.dp))
            Row(modifier = Modifier.fillMaxWidth()) {
                dados7Dias.forEach { (rotulo, _) ->
                    Box(
                        modifier = Modifier.weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = rotulo,
                            color = RotaColors.TextMuted,
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        HorizontalDivider(color = Color.White.copy(alpha = 0.1f))
        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "Ganhos por plataforma",
            color = Color(0xFFCBD5E1),
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(10.dp))

        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Plataforma.entries.forEach { plat ->
                val soma = lancamentosPeriodo
                    .filter { it.tipo == TipoLancamento.GANHO && it.categoria == plat.rotulo }
                    .sumOf { it.valor }
                val percentual = if (totalGanhos > 0.0) (soma / totalGanhos).toFloat().coerceIn(0f, 1f) else 0f

                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = plat.rotulo, color = Color(0xFFE2E8F0), fontSize = 12.sp)
                        Text(
                            text = formatarMoeda(soma),
                            color = RotaColors.GreenGanho,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    Spacer(modifier = Modifier.height(5.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .neuInsetModifier(8)
                    ) {
                        if (percentual > 0f) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth(percentual)
                                    .fillMaxHeight()
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(
                                        Brush.horizontalGradient(
                                            listOf(RotaColors.BlueDeep, RotaColors.GreenGanho)
                                        )
                                    )
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricaTile(
    titulo: String,
    valor: String,
    corValor: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(RotaColors.TileBg)
            .border(1.dp, Color.White.copy(alpha = 0.04f), RoundedCornerShape(18.dp))
            .padding(14.dp)
    ) {
        Text(text = titulo, color = RotaColors.TextMuted, fontSize = 11.sp)
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = valor,
            color = corValor,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            maxLines = 1
        )
    }
}
