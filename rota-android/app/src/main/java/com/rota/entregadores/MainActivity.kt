package com.rota.entregadores

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.BarChart
import androidx.compose.material.icons.rounded.BatteryChargingFull
import androidx.compose.material.icons.rounded.Navigation
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.rota.entregadores.data.RotaStorage
import com.rota.entregadores.model.FiltroPeriodo
import com.rota.entregadores.model.Lancamento
import com.rota.entregadores.model.StatusOdometro
import com.rota.entregadores.model.Trajeto
import com.rota.entregadores.service.OdometerForegroundService
import com.rota.entregadores.ui.components.FormLancamentoCard
import com.rota.entregadores.ui.components.ListaLancamentosCard
import com.rota.entregadores.ui.components.OdometroCard
import com.rota.entregadores.ui.components.ResumoCard
import com.rota.entregadores.ui.theme.BlueGradientBrush
import com.rota.entregadores.ui.theme.RotaColors
import com.rota.entregadores.ui.theme.RotaTheme
import com.rota.entregadores.ui.theme.neuInsetModifier
import com.rota.entregadores.util.filtrarPorPeriodo
import java.time.Instant
import java.util.UUID

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RotaTheme {
                RotaMainScreen()
            }
        }
    }
}

@Composable
fun RotaMainScreen() {
    val context = LocalContext.current
    val storage = remember { RotaStorage(context) }

    var abaAtiva by remember { mutableStateOf("registrar") }
    var lancamentos by remember { mutableStateOf(storage.carregarLancamentos()) }
    var trajetos by remember { mutableStateOf(storage.carregarTrajetos()) }
    var periodo by remember { mutableStateOf(FiltroPeriodo.HOJE) }

    val odometerState by OdometerForegroundService.state.collectAsState()

    val powerManager = remember {
        context.getSystemService(PowerManager::class.java)
    }
    var bateriaSemRestricoes by remember {
        mutableStateOf(powerManager?.isIgnoringBatteryOptimizations(context.packageName) ?: true)
    }

    val backgroundLocationLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { _ ->
        // Mesmo se usuário deixar "Durante o uso", o ForegroundService já garante rastreamento em segundo plano.
    }

    val permissionsLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { result ->
        val fineGranted = result[Manifest.permission.ACCESS_FINE_LOCATION] == true
        val coarseGranted = result[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (fineGranted || coarseGranted) {
            OdometerForegroundService.enviarAcao(context, OdometerForegroundService.ACTION_START)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val bgGranted = ContextCompat.checkSelfPermission(
                    context,
                    Manifest.permission.ACCESS_BACKGROUND_LOCATION
                ) == PackageManager.PERMISSION_GRANTED
                if (!bgGranted) {
                    backgroundLocationLauncher.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
                }
            }
        }
    }

    val iniciarOdometroComPermissao: () -> Unit = {
        val fineGranted = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        if (fineGranted) {
            val action = if (odometerState.status == StatusOdometro.PAUSED) {
                OdometerForegroundService.ACTION_RESUME
            } else {
                OdometerForegroundService.ACTION_START
            }
            OdometerForegroundService.enviarAcao(context, action)
        } else {
            val perms = buildList {
                add(Manifest.permission.ACCESS_FINE_LOCATION)
                add(Manifest.permission.ACCESS_COARSE_LOCATION)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    add(Manifest.permission.POST_NOTIFICATIONS)
                }
            }.toTypedArray()
            permissionsLauncher.launch(perms)
        }
    }

    val lancamentosPeriodo = remember(lancamentos, periodo) {
        filtrarPorPeriodo(lancamentos, periodo) { it.dataIso }
    }
    val trajetosPeriodo = remember(trajetos, periodo) {
        filtrarPorPeriodo(trajetos, periodo) { it.dataIso }
    }

    Scaffold(
        containerColor = RotaColors.NavyBg,
        bottomBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .background(RotaColors.CardBg.copy(alpha = 0.96f))
                        .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(24.dp))
                        .padding(6.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .neuInsetModifier(18)
                            .padding(4.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf(
                            Triple("registrar", "Registrar", Icons.Rounded.Navigation),
                            Triple("resumo", "Resumo", Icons.Rounded.BarChart)
                        ).forEach { (chave, rotulo, icone) ->
                            val ativo = abaAtiva == chave
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(46.dp)
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(
                                        if (ativo) BlueGradientBrush else SolidColor(Color.Transparent)
                                    )
                                    .clickable { abaAtiva = chave },
                                contentAlignment = Alignment.Center
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = icone,
                                        contentDescription = null,
                                        tint = if (ativo) Color.White else RotaColors.TextMuted,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = rotulo,
                                        color = if (ativo) Color.White else RotaColors.TextMuted,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            RotaColors.BlueLight.copy(alpha = 0.22f),
                            RotaColors.NavyBg
                        )
                    )
                )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .statusBarsPadding()
                    .padding(innerPadding)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(BlueGradientBrush),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Navigation,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Rota",
                            color = Color.White,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    if (!bateriaSemRestricoes) {
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(14.dp))
                                .background(RotaColors.ButtonSecondary)
                                .clickable {
                                    runCatching {
                                        val intent = Intent(
                                            Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
                                            Uri.parse("package:${context.packageName}")
                                        )
                                        context.startActivity(intent)
                                    }
                                    bateriaSemRestricoes =
                                        powerManager?.isIgnoringBatteryOptimizations(context.packageName) ?: true
                                }
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.BatteryChargingFull,
                                contentDescription = null,
                                tint = RotaColors.GreenGanho,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Liberar bateria",
                                color = Color(0xFFCFE4FF),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                if (abaAtiva == "registrar") {
                    OdometroCard(
                        odometerState = odometerState,
                        onIniciarOuContinuar = iniciarOdometroComPermissao,
                        onPausar = {
                            OdometerForegroundService.enviarAcao(
                                context,
                                OdometerForegroundService.ACTION_PAUSE
                            )
                        },
                        onSalvarTrajeto = { km, origem ->
                            val novo = Trajeto(
                                id = UUID.randomUUID().toString(),
                                dataIso = Instant.now().toString(),
                                km = (kotlin.math.round(km * 100.0) / 100.0),
                                origem = origem
                            )
                            val atualizados = listOf(novo) + trajetos
                            trajetos = atualizados
                            storage.salvarTrajetos(atualizados)
                            if (origem == "gps") {
                                OdometerForegroundService.enviarAcao(
                                    context,
                                    OdometerForegroundService.ACTION_RESET
                                )
                            }
                        },
                        onZerar = {
                            OdometerForegroundService.enviarAcao(
                                context,
                                OdometerForegroundService.ACTION_RESET
                            )
                        }
                    )

                    FormLancamentoCard(
                        onAdicionar = { tipo, categoria, valor ->
                            val novo = Lancamento(
                                id = UUID.randomUUID().toString(),
                                tipo = tipo,
                                categoria = categoria,
                                valor = (kotlin.math.round(valor * 100.0) / 100.0),
                                dataIso = Instant.now().toString()
                            )
                            val atualizados = listOf(novo) + lancamentos
                            lancamentos = atualizados
                            storage.salvarLancamentos(atualizados)
                        }
                    )
                } else {
                    ResumoCard(
                        periodo = periodo,
                        onMudarPeriodo = { periodo = it },
                        lancamentosPeriodo = lancamentosPeriodo,
                        todosLancamentos = lancamentos,
                        trajetosPeriodo = trajetosPeriodo
                    )

                    ListaLancamentosCard(
                        periodo = periodo,
                        lancamentos = lancamentosPeriodo,
                        trajetos = trajetosPeriodo,
                        onExcluirLancamento = { id ->
                            val atualizados = lancamentos.filterNot { it.id == id }
                            lancamentos = atualizados
                            storage.salvarLancamentos(atualizados)
                        },
                        onExcluirTrajeto = { id ->
                            val atualizados = trajetos.filterNot { it.id == id }
                            trajetos = atualizados
                            storage.salvarTrajetos(atualizados)
                        }
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))
            }
        }
    }
}
