package com.rota.entregadores.service

import android.Manifest
import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.rota.entregadores.MainActivity
import com.rota.entregadores.R
import com.rota.entregadores.data.RotaStorage
import com.rota.entregadores.model.OdometerState
import com.rota.entregadores.model.StatusOdometro
import com.rota.entregadores.util.calcularDistanciaHaversineKm
import com.rota.entregadores.util.formatarKm
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class OdometerForegroundService : Service() {

    private lateinit var locationManager: LocationManager
    private lateinit var storage: RotaStorage
    private var wakeLock: PowerManager.WakeLock? = null
    private var ultimoPontoValido: Pair<Double, Double>? = null
    private var listenerAtivo = false

    private val locationListener = object : LocationListener {
        override fun onLocationChanged(location: Location) {
            processarNovaLocalizacao(location)
        }

        override fun onProviderDisabled(provider: String) {
            if (provider == LocationManager.GPS_PROVIDER) {
                Log.w(TAG, "Provedor GPS desativado pelo usuário.")
                _state.update {
                    it.copy(
                        aguardandoSinal = false,
                        erroCodigo = "POSITION_UNAVAILABLE",
                        erroMensagem = "O GPS do celular foi desativado.",
                        erroSugestao = "Ative o serviço de localização (GPS) nas configurações rápidas do aparelho."
                    )
                }
            }
        }

        override fun onProviderEnabled(provider: String) {
            if (provider == LocationManager.GPS_PROVIDER) {
                _state.update {
                    it.copy(
                        aguardandoSinal = true,
                        erroCodigo = null,
                        erroMensagem = null,
                        erroSugestao = null
                    )
                }
            }
        }

        @Deprecated("Deprecated in Android API 29")
        override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {
            // Compatibilidade com versões antigas do Android
        }
    }

    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        storage = RotaStorage(applicationContext)
        criarCanalNotificacao()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START, ACTION_RESUME -> iniciarRastreamento()
            ACTION_PAUSE -> pausarRastreamento()
            ACTION_RESET -> zerarEParar()
            else -> {
                if (_state.value.status == StatusOdometro.RUNNING) {
                    iniciarRastreamento()
                }
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        pararListenerGps()
        liberarWakeLock()
        super.onDestroy()
    }

    private fun temPermissaoLocalizacao(): Boolean {
        val fine = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        return fine || coarse
    }

    @SuppressLint("MissingPermission")
    private fun iniciarRastreamento() {
        if (!temPermissaoLocalizacao()) {
            Log.e(TAG, "PERMISSION_DENIED: Permissão de localização não concedida.")
            _state.update {
                it.copy(
                    status = if (it.kmAtual > 0) StatusOdometro.PAUSED else StatusOdometro.IDLE,
                    aguardandoSinal = false,
                    erroCodigo = "PERMISSION_DENIED",
                    erroMensagem = "Permissão de localização negada.",
                    erroSugestao = "Libere a localização em 'Permitir o tempo todo' para o odômetro rodar em segundo plano."
                )
            }
            stopSelf()
            return
        }

        val gpsAtivo = runCatching {
            locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
        }.getOrDefault(false)

        if (!gpsAtivo) {
            Log.e(TAG, "POSITION_UNAVAILABLE: GPS_PROVIDER está desligado no aparelho.")
            _state.update {
                it.copy(
                    status = if (it.kmAtual > 0) StatusOdometro.PAUSED else StatusOdometro.IDLE,
                    aguardandoSinal = false,
                    erroCodigo = "POSITION_UNAVAILABLE",
                    erroMensagem = "Serviço de localização (GPS) está desligado.",
                    erroSugestao = "Ative a Localização na barra de atalhos do celular e toque em Iniciar novamente."
                )
            }
            stopSelf()
            return
        }

        _state.update {
            it.copy(
                status = StatusOdometro.RUNNING,
                aguardandoSinal = true,
                erroCodigo = null,
                erroMensagem = null,
                erroSugestao = null
            )
        }

        iniciarEmPrimeiroPlano()
        adquirirWakeLock()

        if (!listenerAtivo) {
            try {
                locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    2000L,
                    3f,
                    locationListener,
                    Looper.getMainLooper()
                )
                listenerAtivo = true
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao registrar LocationListener: ${e.message}", e)
                _state.update {
                    it.copy(
                        status = if (it.kmAtual > 0) StatusOdometro.PAUSED else StatusOdometro.IDLE,
                        aguardandoSinal = false,
                        erroCodigo = "UNKNOWN",
                        erroMensagem = "Falha ao iniciar monitoramento de GPS.",
                        erroSugestao = "Verifique se o serviço de localização do celular está ativo."
                    )
                }
                stopForegroundCompat()
                stopSelf()
            }
        }
    }

    private fun pausarRastreamento() {
        pararListenerGps()
        liberarWakeLock()
        ultimoPontoValido = null
        _state.update {
            it.copy(
                status = StatusOdometro.PAUSED,
                aguardandoSinal = false
            )
        }
        atualizarNotificacao()
    }

    private fun zerarEParar() {
        pararListenerGps()
        liberarWakeLock()
        ultimoPontoValido = null
        storage.salvarKmEmAndamento(0.0)
        _state.value = OdometerState(status = StatusOdometro.IDLE, kmAtual = 0.0)
        stopForegroundCompat()
        stopSelf()
    }

    private fun pararListenerGps() {
        if (listenerAtivo) {
            runCatching { locationManager.removeUpdates(locationListener) }
            listenerAtivo = false
        }
    }

    private fun processarNovaLocalizacao(location: Location) {
        if (_state.value.status != StatusOdometro.RUNNING) return

        val precisao = if (location.hasAccuracy()) location.accuracy else Float.MAX_VALUE
        _state.update { it.copy(precisaoMetros = precisao.toInt()) }

        // Ignora leituras com precisão pior que 40 m
        if (precisao > PRECISAO_MAXIMA_METROS) {
            return
        }

        _state.update {
            it.copy(
                aguardandoSinal = false,
                erroCodigo = null,
                erroMensagem = null,
                erroSugestao = null
            )
        }

        val pontoAtual = location.latitude to location.longitude
        val anterior = ultimoPontoValido
        if (anterior == null) {
            ultimoPontoValido = pontoAtual
            atualizarNotificacao()
            return
        }

        val distanciaKm = calcularDistanciaHaversineKm(
            anterior.first,
            anterior.second,
            pontoAtual.first,
            pontoAtual.second
        )
        val distanciaMetros = distanciaKm * 1000.0

        // Ignora deslocamentos menores que 5 m (ruído do GPS)
        if (distanciaMetros < DESLOCAMENTO_MINIMO_METROS) {
            return
        }

        // Ignora saltos maiores que 2 km
        if (distanciaKm > SALTO_MAXIMO_KM) {
            return
        }

        val novoKm = _state.value.kmAtual + distanciaKm
        storage.salvarKmEmAndamento(novoKm)
        ultimoPontoValido = pontoAtual

        _state.update { it.copy(kmAtual = novoKm) }
        atualizarNotificacao()
    }

    private fun adquirirWakeLock() {
        if (wakeLock?.isHeld == true) return
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Rota::OdometroWakeLock").apply {
            setReferenceCounted(false)
            acquire(12 * 60 * 60 * 1000L) // Até 12h contínuas de turno
        }
    }

    private fun liberarWakeLock() {
        runCatching {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
        }
        wakeLock = null
    }

    private fun criarCanalNotificacao() {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val canal = NotificationChannel(
            CHANNEL_ID,
            "Odômetro GPS em segundo plano",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Mantém a contagem de quilômetros ativa mesmo em tela dividida ou com a tela apagada."
            setShowBadge(false)
        }
        manager.createNotificationChannel(canal)
    }

    private fun iniciarEmPrimeiroPlano() {
        val notificacao = construirNotificacao()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(
                this,
                NOTIFICATION_ID,
                notificacao,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
            )
        } else {
            startForeground(NOTIFICATION_ID, notificacao)
        }
    }

    private fun stopForegroundCompat() {
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    }

    private fun atualizarNotificacao() {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, construirNotificacao())
    }

    private fun construirNotificacao(): Notification {
        val atual = _state.value
        val abrirAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val abrirPending = PendingIntent.getActivity(
            this,
            0,
            abrirAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val acaoIntent = Intent(this, OdometerForegroundService::class.java).apply {
            action = if (atual.status == StatusOdometro.RUNNING) ACTION_PAUSE else ACTION_RESUME
        }
        val acaoPending = PendingIntent.getService(
            this,
            1,
            acaoIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val textoStatus = when (atual.status) {
            StatusOdometro.RUNNING ->
                if (atual.aguardandoSinal) "Buscando sinal GPS..."
                else "Registrando em segundo plano"
            StatusOdometro.PAUSED -> "Trajeto pausado"
            StatusOdometro.IDLE -> "Pronto"
        }

        val rotuloAcao = if (atual.status == StatusOdometro.RUNNING) "Pausar" else "Continuar"

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Rota · ${formatarKm(atual.kmAtual)} km")
            .setContentText(textoStatus)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(atual.status == StatusOdometro.RUNNING)
            .setOnlyAlertOnce(true)
            .setContentIntent(abrirPending)
            .addAction(0, rotuloAcao, acaoPending)
            .build()
    }

    companion object {
        private const val TAG = "RotaOdometroGPS"
        private const val CHANNEL_ID = "rota_odometro_gps"
        private const val NOTIFICATION_ID = 1001

        private const val PRECISAO_MAXIMA_METROS = 40f
        private const val DESLOCAMENTO_MINIMO_METROS = 5.0
        private const val SALTO_MAXIMO_KM = 2.0

        const val ACTION_START = "com.rota.entregadores.ACTION_START"
        const val ACTION_PAUSE = "com.rota.entregadores.ACTION_PAUSE"
        const val ACTION_RESUME = "com.rota.entregadores.ACTION_RESUME"
        const val ACTION_RESET = "com.rota.entregadores.ACTION_RESET"

        private val _state = MutableStateFlow(OdometerState())
        val state: StateFlow<OdometerState> = _state.asStateFlow()

        fun restaurarKmInicial(km: Double) {
            if (_state.value.status == StatusOdometro.IDLE && km > 0.0) {
                _state.value = OdometerState(
                    status = StatusOdometro.PAUSED,
                    kmAtual = km
                )
            }
        }

        fun enviarAcao(context: Context, action: String) {
            val intent = Intent(context, OdometerForegroundService::class.java).apply {
                this.action = action
            }
            if (action == ACTION_START || action == ACTION_RESUME) {
                ContextCompat.startForegroundService(context, intent)
            } else {
                context.startService(intent)
            }
        }
    }
}
