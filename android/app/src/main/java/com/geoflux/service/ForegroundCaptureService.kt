package com.geoflux.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.location.Location
import android.os.Build
import android.os.Looper
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.google.android.gms.location.*
import kotlinx.coroutines.*

/**
 * GeoFlux Foreground Capture Service
 * 
 * Funciona de forma persistente em segundo plano no Android 14+.
 * Gerencia o ciclo de vida da câmera (CameraX) e Fused Location Provider.
 * Permite ao motorista usar Uber/99 simultaneamente.
 */
class ForegroundCaptureService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + Job())
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private lateinit var kalmanFilter: KalmanFilter
    
    // Status metrics
    private var totalValidKm = 0.0
    private var isCapturing = false

    companion object {
        private const val CHANNEL_ID = "GeoFluxCaptureChannel_v1"
        private const val NOTIFICATION_ID = 1010
        const val ACTION_START = "com.geoflux.ACTION_START_CAPTURE"
        const val ACTION_STOP = "com.geoflux.ACTION_STOP_CAPTURE"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        kalmanFilter = KalmanFilter() // Inicializa o filtro de precisão
        setupLocationCallback()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> startCapture()
            ACTION_STOP -> stopCapture()
        }
        return START_STICKY // Reinicia caso o sistema mate o serviço por falta de memória
    }

    private fun startCapture() {
        if (isCapturing) return
        isCapturing = true

        val notification = createNotification("Capturando em segundo plano", "0.0 KM válidos")
        
        // Exigência do Android 14: Declarar foregroundServiceType no manifest (camera, location)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(
                this, 
                NOTIFICATION_ID, 
                notification, 
                ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA or ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        requestHighAccuracyLocation()
        startCameraXCapture() // Inicia captura de frames (WebP infinito)
    }

    private fun stopCapture() {
        isCapturing = false
        fusedLocationClient.removeLocationUpdates(locationCallback)
        stopCameraXCapture() // Para a câmera de maneira segura
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun setupLocationCallback() {
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                for (location in locationResult.locations) {
                    processLocationAndFrame(location)
                }
            }
        }
    }

    private fun requestHighAccuracyLocation() {
        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000)
            .setMinUpdateDistanceMeters(5f)
            .setWaitForAccurateLocation(true)
            .build()

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
        } catch (unlikely: SecurityException) {
            // Em caso de perda de permissão
        }
    }

    private fun processLocationAndFrame(rawLocation: Location) {
        // Filtragem Rigorosa de Kalman 
        val filteredLocation = kalmanFilter.process(rawLocation)
        
        // Critério do GeoFlux: Descartar sinal ruim (> 10m de precisão)
        val isSignalGood = filteredLocation.accuracy <= 10.0f
        
        updateUINotification(isSignalGood)

        if (isSignalGood) {
            // Se o sinal é bom, extraimos os metadados:
            val metadata = FrameMetadata(
                lat = filteredLocation.latitude,
                lon = filteredLocation.longitude,
                altitude = filteredLocation.altitude,
                speed = filteredLocation.speed,
                bearing = filteredLocation.bearing, // Usado para Mapillary Seq
                accuracy = filteredLocation.accuracy,
                timestampUtc = System.currentTimeMillis()
            )
            
            // Coordena captura de frame e salva local via Room DB
            triggerFrameCapture(metadata)
        }
    }

    private fun triggerFrameCapture(metadata: FrameMetadata) {
        serviceScope.launch {
            // 1. Snapshot da CameraX 1080p
            // 2. Compressão em formato WebP (Lossless, alto rendimento local)
            // 3. Salvar Metadata e Caminho do Arquivo no SQLite local
            // 4. Acumular KM válidos
        }
    }

    private fun updateUINotification(isSignalGood: Boolean) {
        val statusText = if (isSignalGood) "🟢 Sinal GPS Excelente" else "🔴 Sinal GPS Fraco - Aguarde"
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification = createNotification("GeoFlux Ativo", statusText)
        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun createNotification(title: String, content: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            // .setSmallIcon(R.drawable.ic_geoflux)
            .setContentTitle(title)
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "GeoFlux Captura",
                NotificationManager.IMPORTANCE_LOW
            )
            channel.description = "Usado para coleta contínua em plano de fundo"
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun startCameraXCapture() {}
    private fun stopCameraXCapture() {}

    override fun onDestroy() {
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?) = null
}

data class FrameMetadata(
    val lat: Double, val lon: Double, val altitude: Double,
    val speed: Float, val bearing: Float, val accuracy: Float, val timestampUtc: Long
)

// Dummy Kalman Filter para referência arquitetural
class KalmanFilter {
    fun process(location: Location): Location {
        // Implementação real da matriz de variância para suavizar saltos
        return location 
    }
}
