package com.geoflux.data.local

import androidx.room.*

/**
 * Entidade Room representando uma sessão de captura
 */
@Entity(tableName = "capture_sessions")
data class CaptureSessionEntity(
    @PrimaryKey val sessionId: String,
    val startTime: Long,
    val isFinished: Boolean = false,
    val totalKmTracked: Float = 0f
)

/**
 * Entidade Room representando um Frame + JSON Metadata local
 * Ficará retido aqui até o Worker de Wi-Fi atuar.
 */
@Entity(
    tableName = "frames",
    foreignKeys = [
        ForeignKey(
            entity = CaptureSessionEntity::class,
            parentColumns = arrayOf("sessionId"),
            childColumns = arrayOf("sessionId"),
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["sessionId"])]
)
data class FrameEntity(
    @PrimaryKey val frameId: String,
    val sessionId: String,
    val latitude: Double,
    val longitude: Double,
    val altitude: Double,
    val speed: Float,
    val bearing: Float,
    val accuracy: Float,
    val timestampUtc: Long,
    val imageFilePath: String, // Caminho local do WebP
    val isUploaded: Boolean = false
)

@Dao
interface GeoFluxDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: CaptureSessionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFrame(frame: FrameEntity)

    // Agrupa 50 frames que ainda não foram atualizados = the "Smart Upload Batch"
    @Query("SELECT * FROM frames WHERE isUploaded = 0 LIMIT 50")
    suspend fun getPendingFramesBatch(): List<FrameEntity>

    // Marca como sucesso o lote despachado
    @Query("UPDATE frames SET isUploaded = 1 WHERE frameId IN (:frameIds)")
    suspend fun markFramesAsUploaded(frameIds: List<String>)

    // Deleta do telefone após enviar para economizar o SDcard do Motorista
    @Query("DELETE FROM frames WHERE isUploaded = 1")
    suspend fun deleteUploadedFrames()
}

@Database(entities = [CaptureSessionEntity::class, FrameEntity::class], version = 1, exportSchema = false)
abstract class GeoFluxDatabase : RoomDatabase() {
    abstract fun geoFluxDao(): GeoFluxDao
}
