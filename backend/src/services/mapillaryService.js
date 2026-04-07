/**
 * Mapillary Integration Service
 * 
 * Ponte entre o servidor GeoFlux e a rede Mapillary (Meta).
 * O Mapillary utiliza o padrão de Sequências baseadas em tempo/distância e
 * imagens em formato JPEG contendo o EXIF modificado (lat, lon, tempo, direção).
 */

import { logger } from '../utils/logger.js';
import piexif from 'piexifjs';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import archiver from 'archiver';

class MapillaryService {
  constructor() {
    this.clientId = process.env.MAPILLARY_CLIENT_ID;
    this.clientSecret = process.env.MAPILLARY_CLIENT_SECRET;
    this.uploadToken = process.env.MAPILLARY_UPLOAD_TOKEN;
  }

  /**
   * Converte o Metadata JSON unificado do GeoFlux para metadados EXIF e insere na imagem
   * @param {string} imagePath O caminho da imagem original processada (privacidade aplicada)
   * @param {object} frame Objeto do Prisma contendo lat, lon, etc.
   */
  async injectExifData(imagePath, frame) {
    try {
      let imageBuffer = await fs.readFile(imagePath);
      let jpegData = imageBuffer.toString("binary");

      const latDeg = this.decimalToDMS(frame.latitude);
      const lonDeg = this.decimalToDMS(frame.longitude);
      const latRef = frame.latitude >= 0 ? "N" : "S";
      const lonRef = frame.longitude >= 0 ? "E" : "W";

      const dateObj = new Date(frame.capturedAt);
      const dateTimeStr = dateObj.toISOString().replace(/-/g, ":").replace("T", " ").substring(0, 19);

      const zeroth = {};
      const exif = {};
      const gps = {};

      zeroth[piexif.ImageIFD.Make] = "GeoFlux Multi-Marketplace";
      zeroth[piexif.ImageIFD.Model] = "GeoFlux App V1";
      exif[piexif.ExifIFD.DateTimeOriginal] = dateTimeStr;

      gps[piexif.GPSIFD.GPSLatitudeRef] = latRef;
      gps[piexif.GPSIFD.GPSLatitude] = latDeg;
      gps[piexif.GPSIFD.GPSLongitudeRef] = lonRef;
      gps[piexif.GPSIFD.GPSLongitude] = lonDeg;

      if (frame.altitude) {
        gps[piexif.GPSIFD.GPSAltitude] = [Math.round(frame.altitude * 1000), 1000];
        gps[piexif.GPSIFD.GPSAltitudeRef] = frame.altitude >= 0 ? 0 : 1;
      }
      
      if (frame.bearing) {
        gps[piexif.GPSIFD.GPSImgDirectionRef] = "T";
        gps[piexif.GPSIFD.GPSImgDirection] = [Math.round(frame.bearing * 100), 100];
      }

      const exifObj = { "0th": zeroth, "Exif": exif, "GPS": gps };
      const exifbytes = piexif.dump(exifObj);

      const newData = piexif.insert(exifbytes, jpegData);
      const outputBuffer = Buffer.from(newData, "binary");

      const outputPath = imagePath.replace('.webp', '.jpg').replace('.jpg', '_exif.jpg');
      await fs.writeFile(outputPath, outputBuffer);

      return outputPath;
    } catch (error) {
      logger.error(`❌ Erro ao formatar EXIF Mapillary no frame ${frame.id}: ${error.message}`);
      return null;
    }
  }

  decimalToDMS(decimal) {
    const d = Math.abs(decimal);
    const deg = Math.floor(d);
    const min = Math.floor((d - deg) * 60);
    const sec = Math.round((d - deg - min / 60) * 3600 * 100);
    return [[deg, 1], [min, 1], [sec, 100]];
  }

  /**
   * Envia uma sequência de imagens para os servidores da Mapillary via API Graph.
   */
  async submitSequence(sequenceFrames) {
    if (!this.uploadToken) {
      logger.warn('MAPILLARY_UPLOAD_TOKEN não configurado. Pulo do Upload Web.');
      return { success: false, reason: 'missing_token' };
    }

    logger.info(`🗺️ Iniciando submissão de Sequence para Mapillary: ${sequenceFrames.length} frames.`);
    
    // 1. Criar um arquivo zip contendo todas as imagens da sequencia
    const zipPath = path.resolve(`./uploads/temp/seq_${Date.now()}.zip`);
    await this.createZipArchive(sequenceFrames, zipPath);

    try {
      // 2. Start Upload Session Node
      const sessionUrl = `https://graph.mapillary.com/uploads?access_token=${this.uploadToken}`;
      const sessionRes = await axios.post(sessionUrl, {
        "file_type": "zip" 
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      const { id: sessionId, url: uploadUrl } = sessionRes.data;
      
      // 3. Efetuar Upload de fato do ZIP via HTTP
      const formData = new FormData();
      const zipStream = fsSync.createReadStream(zipPath);
      formData.append('file', zipStream);

      // Usar sessionUploadUrl extraído, adicionar metadata de authentication e org se necessário
      await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `OAuth ${this.uploadToken}`
        }
      });

      // 4. Closed connection - Encerra para Mapillary processar
      const closeUrl = `https://graph.mapillary.com/${sessionId}/closed?access_token=${this.uploadToken}`;
      await axios.post(closeUrl);

      logger.info(`✅ [Mapillary] Sequencia submetida com sucesso! SessionID: ${sessionId}`);

      return {
        success: true,
        provider: 'Mapillary',
        framesSubmitted: sequenceFrames.length,
        sequenceId: sessionId
      };
    } catch (error) {
      logger.error(`❌ Falha no Upload Graph API da Mapillary: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      // Limpeza segura
      await fs.unlink(zipPath).catch(() => {});
    }
  }

  createZipArchive(sequenceFrames, zipPath) {
    return new Promise((resolve, reject) => {
      const output = fsSync.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve(true));
      archive.on('error', (err) => reject(err));

      archive.pipe(output);

      for (const frame of sequenceFrames) {
         if (fsSync.existsSync(frame.imagePath)) {
            archive.file(frame.imagePath, { name: path.basename(frame.imagePath) });
         }
      }
      archive.finalize();
    });
  }
}

export const mapillaryService = new MapillaryService();
