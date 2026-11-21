package com.rota.entregadores.data

import android.content.Context
import com.rota.entregadores.model.Lancamento
import com.rota.entregadores.model.TipoLancamento
import com.rota.entregadores.model.Trajeto
import org.json.JSONArray
import org.json.JSONObject

class RotaStorage(context: Context) {
    private val prefs = context.getSharedPreferences("rota_prefs_v1", Context.MODE_PRIVATE)

    fun carregarLancamentos(): List<Lancamento> {
        val raw = prefs.getString("lancamentos", null) ?: return emptyList()
        return try {
            val arr = JSONArray(raw)
            buildList {
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    add(
                        Lancamento(
                            id = obj.getString("id"),
                            tipo = TipoLancamento.fromValor(obj.getString("tipo")),
                            categoria = obj.getString("categoria"),
                            valor = obj.getDouble("valor"),
                            dataIso = obj.getString("dataIso")
                        )
                    )
                }
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun salvarLancamentos(lista: List<Lancamento>) {
        val arr = JSONArray()
        lista.forEach { item ->
            arr.put(
                JSONObject().apply {
                    put("id", item.id)
                    put("tipo", item.tipo.valor)
                    put("categoria", item.categoria)
                    put("valor", item.valor)
                    put("dataIso", item.dataIso)
                }
            )
        }
        prefs.edit().putString("lancamentos", arr.toString()).apply()
    }

    fun carregarTrajetos(): List<Trajeto> {
        val raw = prefs.getString("trajetos", null) ?: return emptyList()
        return try {
            val arr = JSONArray(raw)
            buildList {
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    add(
                        Trajeto(
                            id = obj.getString("id"),
                            dataIso = obj.getString("dataIso"),
                            km = obj.getDouble("km"),
                            origem = obj.optString("origem", "gps")
                        )
                    )
                }
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun salvarTrajetos(lista: List<Trajeto>) {
        val arr = JSONArray()
        lista.forEach { item ->
            arr.put(
                JSONObject().apply {
                    put("id", item.id)
                    put("dataIso", item.dataIso)
                    put("km", item.km)
                    put("origem", item.origem)
                }
            )
        }
        prefs.edit().putString("trajetos", arr.toString()).apply()
    }

    fun carregarKmEmAndamento(): Double {
        return java.lang.Double.longBitsToDouble(
            prefs.getLong("km_atual_bits", java.lang.Double.doubleToRawLongBits(0.0))
        ).takeIf { it.isFinite() && it >= 0.0 } ?: 0.0
    }

    fun salvarKmEmAndamento(km: Double) {
        prefs.edit()
            .putLong("km_atual_bits", java.lang.Double.doubleToRawLongBits(km))
            .apply()
    }

    fun carregarMetaDiaria(): Double {
        return java.lang.Double.longBitsToDouble(
            prefs.getLong("meta_diaria_bits", java.lang.Double.doubleToRawLongBits(0.0))
        ).takeIf { it.isFinite() && it >= 0.0 } ?: 0.0
    }

    fun salvarMetaDiaria(meta: Double) {
        prefs.edit()
            .putLong("meta_diaria_bits", java.lang.Double.doubleToRawLongBits(meta))
            .apply()
    }
}
