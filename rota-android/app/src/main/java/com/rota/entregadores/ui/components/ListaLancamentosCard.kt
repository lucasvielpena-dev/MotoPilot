package com.rota.entregadores.ui.components

import androidx.compose.foundation.background
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowDownward
import androidx.compose.material.icons.rounded.ArrowUpward
import androidx.compose.material.icons.rounded.DeleteOutline
import androidx.compose.material.icons.rounded.Navigation
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.rota.entregadores.model.FiltroPeriodo
import com.rota.entregadores.model.Lancamento
import com.rota.entregadores.model.TipoLancamento
import com.rota.entregadores.model.Trajeto
import com.rota.entregadores.ui.theme.BlueGradientBrush
import com.rota.entregadores.ui.theme.RotaColors
import com.rota.entregadores.ui.theme.neuCardModifier
import com.rota.entregadores.ui.theme.neuInsetModifier
import com.rota.entregadores.util.formatarDataHora
import com.rota.entregadores.util.formatarKm
import com.rota.entregadores.util.formatarMoeda

@Composable
fun ListaLancamentosCard(
    periodo: FiltroPeriodo,
    lancamentos: List<Lancamento>,
    trajetos: List<Trajeto>,
    onExcluirLancamento: (String) -> Unit,
    onExcluirTrajeto: (String) -> Unit
) {
    var abaLista by remember { mutableStateOf("lancamentos") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .neuCardModifier()
            .padding(20.dp)
    ) {
        Text(
            text = "Histórico · ${periodo.rotulo}",
            color = Color.White,
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(14.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .neuInsetModifier(16)
                .padding(6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            listOf(
                "lancamentos" to "Lançamentos (${lancamentos.size})",
                "trajetos" to "Trajetos (${trajetos.size})"
            ).forEach { (chave, rotulo) ->
                val ativo = abaLista == chave
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            if (ativo) BlueGradientBrush else SolidColor(Color.Transparent)
                        )
                        .clickable { abaLista = chave },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = rotulo,
                        color = if (ativo) Color.White else RotaColors.TextMuted,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (abaLista == "lancamentos") {
            if (lancamentos.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .neuInsetModifier(16)
                        .padding(20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Nenhum ganho ou gasto registrado neste período.",
                        color = RotaColors.TextMuted,
                        fontSize = 12.sp
                    )
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    lancamentos.forEach { item ->
                        val ehGanho = item.tipo == TipoLancamento.GANHO
                        val cor = if (ehGanho) RotaColors.GreenGanho else RotaColors.RedGasto

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(18.dp))
                                .background(RotaColors.TileBg)
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(38.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(cor.copy(alpha = 0.15f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = if (ehGanho) Icons.Rounded.ArrowUpward else Icons.Rounded.ArrowDownward,
                                        contentDescription = null,
                                        tint = cor,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = item.categoria,
                                        color = Color.White,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = "${formatarDataHora(item.dataIso)} · ${item.tipo.rotulo}",
                                        color = RotaColors.TextMuted,
                                        fontSize = 11.sp
                                    )
                                }
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "${if (ehGanho) "+ " else "- "}${formatarMoeda(item.valor)}",
                                    color = cor,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .clickable { onExcluirLancamento(item.id) },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Rounded.DeleteOutline,
                                        contentDescription = "Excluir lançamento",
                                        tint = RotaColors.TextMuted,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        } else {
            if (trajetos.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .neuInsetModifier(16)
                        .padding(20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Nenhum trajeto salvo neste período.",
                        color = RotaColors.TextMuted,
                        fontSize = 12.sp
                    )
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    trajetos.forEach { trajeto ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(18.dp))
                                .background(RotaColors.TileBg)
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(38.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(RotaColors.BlueLight.copy(alpha = 0.15f)),
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
                                        text = "${formatarKm(trajeto.km)} km",
                                        color = Color.White,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = "${formatarDataHora(trajeto.dataIso)} · ${if (trajeto.origem == "gps") "GPS automático" else "Manual"}",
                                        color = RotaColors.TextMuted,
                                        fontSize = 11.sp
                                    )
                                }
                            }

                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { onExcluirTrajeto(trajeto.id) },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.DeleteOutline,
                                    contentDescription = "Excluir trajeto",
                                    tint = RotaColors.TextMuted,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
