package com.geoflux.service

import android.content.Context
import androidx.work.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.TimeUnit

/**
 * GeoFlux Smart Wi-Fi Sync Service
 * 
 * Responsável por gerenciar o "Smart Upload" para o servidor GeoFlux Dispatcher.
 * Dispara apenas quando o dispositivo está numa rede UNMETERED (Wi-Fi) e de preferência carregando,
 * minimizando o consumo de dados móveis do motorista de app.
 */
class WifiSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            // 1. Agrupar os frames locais do SQLite em batches de 50
            // const batches = database.getPendingUploadBatches(50)
            
            // 2. Iterar e enviar para o backend
            // for (batch in batches) {
            //     val response = geoFluxApi.uploadFramesBatch(batch)
            //     if (response.isSuccessful) {
            //         database.markAsUploaded(batch.ids)
            //         database.deleteLocalImages(batch.imagePaths)
            //     }
            // }

            Result.success()
        } catch (e: Exception) {
            // Em caso de falha (Wi-Fi caiu), faz retry usando backoff exponencial
            Result.retry()
        }
    }

    companion object {
        private const val WORK_NAME = "GeoFlux_Wifi_Sync"

        /**
         * Inicializa o Job em background usando WorkManager.
         * Regras de "Smart Upload":
         * - Somente usar Wi-Fi (UNMETERED)
         * - Evitar quando a bateria está super baixa
         */
        fun enqueue(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.UNMETERED) // Somente Wi-Fi
                .setRequiresBatteryNotLow(true)
                .build()

            val syncRequest = PeriodicWorkRequestBuilder<WifiSyncWorker>(15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                // Se falhar o upload, tenta novamente entre 1 minuto até máx 1 hora:
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 1, TimeUnit.MINUTES)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP, // Mantém a fila se já existir
                syncRequest
            )
        }
    }
}
