package com.rota.entregadores.model

enum class TipoLancamento(val valor: String, val rotulo: String) {
    GANHO("ganho", "Ganho"),
    GASTO("gasto", "Gasto");

    companion object {
        fun fromValor(v: String): TipoLancamento =
            entries.firstOrNull { it.valor == v } ?: GANHO
    }
}

enum class Plataforma(val rotulo: String) {
    IFOOD("iFood"),
    AIQFOME("aiqfome"),
    OUTRO_APP("Outro app"),
    PARTICULAR("Particular")
}

enum class CategoriaGasto(val rotulo: String) {
    COMBUSTIVEL("Combustível"),
    MANUTENCAO("Manutenção"),
    ALIMENTACAO("Alimentação"),
    OUTROS("Outros")
}

enum class FiltroPeriodo(val rotulo: String) {
    HOJE("Hoje"),
    SETE_DIAS("7 dias"),
    MES("Mês")
}

enum class StatusOdometro {
    IDLE,
    RUNNING,
    PAUSED
}

data class Lancamento(
    val id: String,
    val tipo: TipoLancamento,
    val categoria: String,
    val valor: Double,
    val dataIso: String
)

data class Trajeto(
    val id: String,
    val dataIso: String,
    val km: Double,
    val origem: String // "gps" ou "manual"
)

data class OdometerState(
    val status: StatusOdometro = StatusOdometro.IDLE,
    val kmAtual: Double = 0.0,
    val precisaoMetros: Int? = null,
    val aguardandoSinal: Boolean = false,
    val erroCodigo: String? = null,
    val erroMensagem: String? = null,
    val erroSugestao: String? = null
)
