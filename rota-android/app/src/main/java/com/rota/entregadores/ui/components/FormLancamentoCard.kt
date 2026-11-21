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
import androidx.compose.material.icons.rounded.AddCircleOutline
import androidx.compose.material.icons.rounded.Check
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
import com.rota.entregadores.model.CategoriaGasto
import com.rota.entregadores.model.Plataforma
import com.rota.entregadores.model.TipoLancamento
import com.rota.entregadores.ui.theme.BlueGradientBrush
import com.rota.entregadores.ui.theme.RotaColors
import com.rota.entregadores.ui.theme.neuCardModifier
import com.rota.entregadores.ui.theme.neuInsetModifier
import com.rota.entregadores.util.parseValorNumerico

@Composable
fun FormLancamentoCard(
    onAdicionar: (TipoLancamento, String, Double) -> Unit
) {
    var tipo by remember { mutableStateOf(TipoLancamento.GANHO) }
    var plataforma by remember { mutableStateOf(Plataforma.IFOOD) }
    var categoriaGasto by remember { mutableStateOf(CategoriaGasto.COMBUSTIVEL) }
    var valorTexto by remember { mutableStateOf("") }
    var erro by remember { mutableStateOf<String?>(null) }
    var confirmado by remember { mutableStateOf<String?>(null) }

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
                text = "Novo lançamento",
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold
            )

            if (confirmado != null) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    val corConfirmado = if (tipo == TipoLancamento.GANHO) {
                        RotaColors.GreenGanho
                    } else {
                        RotaColors.RedGasto
                    }
                    Icon(
                        imageVector = Icons.Rounded.Check,
                        contentDescription = null,
                        tint = corConfirmado,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = confirmado!!,
                        color = corConfirmado,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Barra afundada Ganho / Gasto
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .neuInsetModifier(16)
                .padding(6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            TipoLancamento.entries.forEach { item ->
                val ativo = tipo == item
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            if (ativo) BlueGradientBrush else SolidColor(Color.Transparent)
                        )
                        .clickable {
                            tipo = item
                            erro = null
                            confirmado = null
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = item.rotulo,
                        color = if (ativo) Color.White else RotaColors.TextMuted,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = if (tipo == TipoLancamento.GANHO) "Plataforma" else "Categoria",
            color = Color(0xFFCBD5E1),
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )

        Spacer(modifier = Modifier.height(8.dp))

        val opcoes = if (tipo == TipoLancamento.GANHO) {
            Plataforma.entries.map { it.rotulo }
        } else {
            CategoriaGasto.entries.map { it.rotulo }
        }

        val selecionado = if (tipo == TipoLancamento.GANHO) {
            plataforma.rotulo
        } else {
            categoriaGasto.rotulo
        }

        val corAtivo = if (tipo == TipoLancamento.GANHO) {
            RotaColors.GreenGanho
        } else {
            RotaColors.RedGasto
        }

        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            opcoes.chunked(2).forEach { linha ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    linha.forEach { rotulo ->
                        val ehAtivo = rotulo == selecionado
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(46.dp)
                                .then(
                                    if (ehAtivo) {
                                        Modifier
                                            .neuInsetModifier(16)
                                            .border(
                                                1.dp,
                                                corAtivo.copy(alpha = 0.55f),
                                                RoundedCornerShape(16.dp)
                                            )
                                    } else {
                                        Modifier
                                            .clip(RoundedCornerShape(16.dp))
                                            .background(RotaColors.ButtonSecondary)
                                    }
                                )
                                .clickable {
                                    if (tipo == TipoLancamento.GANHO) {
                                        plataforma = Plataforma.entries.first { it.rotulo == rotulo }
                                    } else {
                                        categoriaGasto = CategoriaGasto.entries.first { it.rotulo == rotulo }
                                    }
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = rotulo,
                                color = if (ehAtivo) corAtivo else Color(0xFFE2E8F0),
                                fontSize = 13.sp,
                                fontWeight = if (ehAtivo) FontWeight.SemiBold else FontWeight.Medium,
                                maxLines = 1
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Valor",
            color = Color(0xFFCBD5E1),
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .neuInsetModifier(16)
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "R$",
                color = corAtivo,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.width(8.dp))
            Box(modifier = Modifier.weight(1f)) {
                if (valorTexto.isEmpty()) {
                    Text(
                        text = "0,00",
                        color = Color(0xFF64748B),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                BasicTextField(
                    value = valorTexto,
                    onValueChange = {
                        valorTexto = it
                        erro = null
                    },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    textStyle = TextStyle(
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold
                    ),
                    cursorBrush = SolidColor(RotaColors.BlueLight),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }

        if (erro != null) {
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = erro!!, color = RotaColors.RedGasto, fontSize = 12.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(BlueGradientBrush)
                .clickable {
                    val valor = parseValorNumerico(valorTexto)
                    if (valor == null) {
                        erro = "Informe um valor maior que R$ 0,00."
                        return@clickable
                    }
                    onAdicionar(tipo, selecionado, valor)
                    valorTexto = ""
                    erro = null
                    confirmado = if (tipo == TipoLancamento.GANHO) {
                        "Ganho registrado!"
                    } else {
                        "Gasto registrado!"
                    }
                },
            contentAlignment = Alignment.Center
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Rounded.AddCircleOutline,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (tipo == TipoLancamento.GANHO) "Salvar ganho" else "Salvar gasto",
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}
