package com.rota.entregadores

import android.app.Application
import com.rota.entregadores.data.RotaStorage
import com.rota.entregadores.service.OdometerForegroundService

class RotaApp : Application() {
    override fun onCreate() {
        super.onCreate()
        val storage = RotaStorage(this)
        OdometerForegroundService.restaurarKmInicial(storage.carregarKmEmAndamento())
    }
}
