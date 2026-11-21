package com.rota.entregadores.util

import com.rota.entregadores.model.FiltroPeriodo
import java.text.NumberFormat
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

private val localePtBr = Locale("pt", "BR")
private val moedaFormat = NumberFormat.getCurrencyInstance(localePtBr)
private val dataHoraFormatter = DateTimeFormatter.ofPattern("dd/MM · HH:mm", localePtBr)

fun formatarMoeda(valor: Double): String {
    val seguro = if (valor.isFinite()) valor else 0.0
    return moedaFormat.format(seguro)
}

fun formatarKm(km: Double): String {
    val seguro = if (km.isFinite()) km else 0.0
    return String.format(localePtBr, "%.2f", seguro)
}

fun formatarDataHora(iso: String): String {
    return try {
        val instant = Instant.parse(iso)
        dataHoraFormatter.format(instant.atZone(ZoneId.systemDefault()))
    } catch (_: Exception) {
        "--/-- · --:--"
    }
}

fun parseValorNumerico(entrada: String): Double? {
    val limpo = entrada.trim().replace(" ", "").replace("R$", "", ignoreCase = true)
    if (limpo.isEmpty()) return null

    val normalizado = when {
        limpo.contains(",") && limpo.contains(".") ->
            limpo.replace(".", "").replace(",", ".")
        limpo.contains(",") ->
            limpo.replace(",", ".")
        else -> limpo
    }

    val num = normalizado.toDoubleOrNull() ?: return null
    return if (num.isFinite() && num > 0.0) num else null
}

fun <T> filtrarPorPeriodo(
    itens: List<T>,
    periodo: FiltroPeriodo,
    extrairDataIso: (T) -> String
): List<T> {
    val zone = ZoneId.systemDefault()
    val hoje = LocalDate.now(zone)
    val inicio7Dias = hoje.minusDays(6)

    return itens.filter { item ->
        val dataLocal = try {
            Instant.parse(extrairDataIso(item)).atZone(zone).toLocalDate()
        } catch (_: Exception) {
            return@filter false
        }

        when (periodo) {
            FiltroPeriodo.HOJE -> dataLocal == hoje
            FiltroPeriodo.SETE_DIAS -> !dataLocal.isBefore(inicio7Dias) && !dataLocal.isAfter(hoje)
            FiltroPeriodo.MES -> dataLocal.year == hoje.year && dataLocal.month == hoje.month
        }
    }
}

fun calcularDistanciaHaversineKm(
    lat1: Double,
    lon1: Double,
    lat2: Double,
    lon2: Double
): Double {
    val raioTerraKm = 6371.0
    val dLat = Math.toRadians(lat2 - lat1)
    val dLon = Math.toRadians(lon2 - lon1)
    val rLat1 = Math.toRadians(lat1)
    val rLat2 = Math.toRadians(lat2)

    val sinLat = sin(dLat / 2.0)
    val sinLon = sin(dLon / 2.0)
    val a = sinLat * sinLat + cos(rLat1) * cos(rLat2) * sinLon * sinLon
    val c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a))

    return raioTerraKm * c
}
