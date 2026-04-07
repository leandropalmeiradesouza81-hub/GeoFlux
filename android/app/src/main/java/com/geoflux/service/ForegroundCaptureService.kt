package com.geoflux.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.Looper
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.google.android.gms.location.*
import kotlinx.coroutines.*
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL

/**
 * GeoFlux Foreground Capture Service
 * 
 * Funciona de forma persistente em segundo plano no Android 14+.
 * Faz o Data Logging de imagens de uma câmera Wi-Fi externa e telemetria (GPS + Sensores).
 */
class ForegroundCaptureService : Service(), SensorEventListener {

    private val serviceScope = CoroutineScope(Dispatchers.IO + Job())
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private lateinit var sensorManager: SensorManager
    
    // Sensores
    private var accelX = 0f
    private var accelY = 9.8f
    private var accelZ = 0f
    private var gyroX = 0f
    private var gyroY = 0f
    private var gyroZ = 0f
    private var magX = 0f
    private var magY = 0f
    private var magZ = 0f

    // Status metrics & Security
    private var isCapturing = false
    private var totalValidKm = 0.0
    private var lastLocation: Location? = null
    private var potholeDetected = false
    private var isCameraConnected = false

    private lateinit var toneGen: ToneGenerator

    companion object {
        private const val CHANNEL_ID = "GeoFluxCaptureChannel_v1"
        private const val NOTIFICATION_ID = 1010
        const val ACTION_START = "com.geoflux.ACTION_START_CAPTURE"
        const val ACTION_STOP = "com.geoflux.ACTION_STOP_CAPTURE"
        const val CAMERA_STREAM_URL = "http://192.168.1.254/snapshot.jpg" // IP genérico da dashcam
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        setupLocationCallback()
        toneGen = ToneGenerator(AudioManager.STREAM_ALARM, 100)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> startCapture()
            ACTION_STOP -> stopCapture()
        }
        return START_STICKY // Reinicia caso o sistema mate o serviço
    }

    private fun startCapture() {
        if (isCapturing) return
        isCapturing = true

        val notification = createNotification("GeoFlux Ativo | Conectando...", "0.0 KM válidos")
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(
                this, 
                NOTIFICATION_ID, 
                notification, 
                ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION or ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        registerSensors()
        requestHighAccuracyLocation()
        startWifiCameraStream()
    }

    private fun stopCapture() {
        isCapturing = false
        fusedLocationClient.removeLocationUpdates(locationCallback)
        sensorManager.unregisterListener(this)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun registerSensors() {
        val accel = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        val gyro = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
        val mag = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)

        // Taxa de atualização rápida para alta velocidade
        val delay = SensorManager.SENSOR_DELAY_GAME
        sensorManager.registerListener(this, accel, delay)
        sensorManager.registerListener(this, gyro, delay)
        sensorManager.registerListener(this, mag, delay)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return
        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                accelX = event.values[0]
                accelY = event.values[1]
                accelZ = event.values[2]

                // Detecção de buraco (impacto vertical > 2.5G)
                val gForceZ = Math.abs(accelZ) / SensorManager.GRAVITY_EARTH
                if (gForceZ > 2.5f) {
                    potholeDetected = true
                }
            }
            Sensor.TYPE_GYROSCOPE -> {
                gyroX = event.values[0]
                gyroY = event.values[1]
                gyroZ = event.values[2]
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                magX = event.values[0]
                magY = event.values[1]
                magZ = event.values[2]
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun setupLocationCallback() {
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                lastLocation = locationResult.lastLocation
                if (lastLocation != null) {
                    val accuracy = lastLocation!!.accuracy
                    if (accuracy > 15.0f) {
                        toneGen.startTone(ToneGenerator.TONE_CDMA_SOFT_ERROR_LITE, 500)
                        updateUINotification("GeoFlux Ativo | Sinal GPS Fraco")
                    } else {
                        updateUINotification("GeoFlux Ativo | Câmera Conectada | ${String.format("%.1f", totalValidKm)} KM Coletados")
                    }
                }
            }
        }
    }

    private fun requestHighAccuracyLocation() {
        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000)
            .setMinUpdateDistanceMeters(0f)
            .setWaitForAccurateLocation(true)
            .build()
        try {
            fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper())
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    private fun startWifiCameraStream() {
        serviceScope.launch {
            while (isCapturing) {
                val timestamp = System.currentTimeMillis()
                
                // Snap dos sensores e localização com tolerância < 100ms
                val loc = lastLocation
                val anomaly = if (potholeDetected) "pothole_suspect" else "none"
                potholeDetected = false // Reseta
                
                val metadata = FrameMetadata(
                    lat = loc?.latitude ?: 0.0,
                    lon = loc?.longitude ?: 0.0,
                    altitude = loc?.altitude ?: 0.0,
                    speed = loc?.speed ?: 0.0f,
                    bearing = loc?.bearing ?: 0.0f,
                    accuracy = loc?.accuracy ?: 999f,
                    timestampUtc = timestamp,
                    accel = floatArrayOf(accelX, accelY, accelZ),
                    gyro = floatArrayOf(gyroX, gyroY, gyroZ),
                    mag = floatArrayOf(magX, magY, magZ),
                    anomaly = anomaly
                )

                try {
                    val url = URL(CAMERA_STREAM_URL)
                    val connection = url.openConnection() as HttpURLConnection
                    connection.connectTimeout = 1000
                    connection.readTimeout = 1000
                    
                    if (connection.responseCode == 200) {
                        isCameraConnected = true
                        val inputStream = connection.inputStream
                        val bitmap = BitmapFactory.decodeStream(inputStream)
                        inputStream.close()
                        
                        if (bitmap != null) {
                            processAndSaveFrame(bitmap, metadata)
                        }
                    } else {
                        throw Exception("Camera HTTP Error")
                    }
                } catch (e: Exception) {
                    isCameraConnected = false
                    toneGen.startTone(ToneGenerator.TONE_CDMA_NETWORK_DROP, 500)
                    updateUINotification("GeoFlux Ativo | Câmera Desconectada")
                    delay(2000) // Aguarda antes de refazer a conexão
                }

                // Ajusta a taxa de captura de quadros (e.g. 5fps = 200ms)
                delay(200) 
            }
        }
    }

    private suspend fun processAndSaveFrame(originalBitmap: Bitmap, metadata: FrameMetadata) = withContext(Dispatchers.Default) {
        // Center crop 16:9
        val width = originalBitmap.width
        val height = originalBitmap.height
        val targetRatio = 16f / 9f
        var newWidth = width
        var newHeight = (width / targetRatio).toInt()

        if (newHeight > height) {
            newHeight = height
            newWidth = (height * targetRatio).toInt()
        }

        val xOffset = (width - newWidth) / 2
        val yOffset = (height - newHeight) / 2

        val croppedBitmap = Bitmap.createBitmap(originalBitmap, xOffset, yOffset, newWidth, newHeight)

        // Compressão WebP 70%
        val outputStream = ByteArrayOutputStream()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            croppedBitmap.compress(Bitmap.CompressFormat.WEBP_LOSSY, 70, outputStream)
        } else {
            @Suppress("DEPRECATION")
            croppedBitmap.compress(Bitmap.CompressFormat.WEBP, 70, outputStream)
        }
        val webpBytes = outputStream.toByteArray()

        // Salvamento no disco
        val filenameBase = "img_${metadata.timestampUtc}"
        val dir = File(applicationContext.filesDir, "geoflux_frames")
        if (!dir.exists()) dir.mkdirs()

        val imageFile = File(dir, "$filenameBase.webp")
        FileOutputStream(imageFile).use { it.write(webpBytes) }

        // Salvamento Metadados JSON
        val json = JSONObject().apply {
            put("timestamp", metadata.timestampUtc)
            put("latitude", metadata.lat)
            put("longitude", metadata.lon)
            put("altitude", metadata.altitude)
            put("speed", metadata.speed)
            put("bearing", metadata.bearing)
            put("accuracy", metadata.accuracy)
            put("anomaly", metadata.anomaly)
            put("accel", JSONObject().apply { put("x", metadata.accel[0]); put("y", metadata.accel[1]); put("z", metadata.accel[2]) })
            put("gyro", JSONObject().apply { put("x", metadata.gyro[0]); put("y", metadata.gyro[1]); put("z", metadata.gyro[2]) })
            put("mag", JSONObject().apply { put("x", metadata.mag[0]); put("y", metadata.mag[1]); put("z", metadata.mag[2]) })
        }
        
        val jsonFile = File(dir, "$filenameBase.json")
        jsonFile.writeText(json.toString())
    }

    private fun updateUINotification(statusText: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification = createNotification("GeoFlux", statusText)
        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun createNotification(title: String, content: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
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
            channel.description = "Usado para coleta contínua"
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        serviceScope.cancel()
        toneGen.release()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?) = null
}

data class FrameMetadata(
    val lat: Double, val lon: Double, val altitude: Double,
    val speed: Float, val bearing: Float, val accuracy: Float, val timestampUtc: Long,
    val accel: FloatArray, val gyro: FloatArray, val mag: FloatArray,
    val anomaly: String
)

