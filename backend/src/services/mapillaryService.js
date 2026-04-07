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
      // 1. O módulo Piexif.js requer a imagem em base64 (Data URI)
      let imageBuffer = await fs.readFile(imagePath);
      let jpegData = imageBuffer.toString("binary");

      // O Mapillary exige coordenadas (lat/lon), Timestamp, Altitude e Bearing (Direção da bússola)
      // Formatações confusas do EXIF
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
        gps[piexif.GPSIFD.GPSImgDirectionRef] = "T"; // True north
        gps[piexif.GPSIFD.GPSImgDirection] = [Math.round(frame.bearing * 100), 100];
      }

      const exifObj = { "0th": zeroth, "Exif": exif, "GPS": gps };
      const exifbytes = piexif.dump(exifObj);

      // Injeta na imagem
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
   * Envia uma sequência de imagens para os servidores da Mapillary 
   */
  async submitSequence(sequenceFrames) {
    logger.info(`🗺️ Iniciando submissão de Sequence para Mapillary: ${sequenceFrames.length} frames.`);
    
    // WIP: Fluxo real exige iniciar um "Upload Session" via REST API da Mapillary, 
    // depois enviar as imagens envelopadas num .zip via cURL.
    
    return {
      success: true,
      provider: 'Mapillary',
      framesSubmitted: sequenceFrames.length,
      sequenceId: `seq_mock_${Date.now()}`
    };
  }
}

export const mapillaryService = new MapillaryService();
