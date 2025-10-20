const axios = require('axios');
const config = require('../config/config');
const fs = require('fs').promises;
const path = require('path');

class ImageService {
  constructor() {
    // Create uploads directory if it doesn't exist
    this.uploadsDir = path.join(__dirname, '../uploads/giftcards');
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }
  }

  // Download image from Twilio
  async downloadFromTwilio(mediaUrl, messageId) {
    try {
      const accountSid = config.whatsapp.twilio.accountSid;
      const authToken = config.whatsapp.twilio.authToken;

      const response = await axios.get(mediaUrl, {
        auth: {
          username: accountSid,
          password: authToken,
        },
        responseType: 'arraybuffer',
      });

      // Generate filename
      const ext = this.getExtensionFromContentType(response.headers['content-type']);
      const filename = `${messageId}-${Date.now()}${ext}`;
      const filepath = path.join(this.uploadsDir, filename);

      // Save file
      await fs.writeFile(filepath, response.data);

      return {
        success: true,
        filename: filename,
        filepath: filepath,
        url: `/uploads/giftcards/${filename}`,
        size: response.data.length,
        mimeType: response.headers['content-type'],
      };
    } catch (error) {
      console.error('Error downloading image from Twilio:', error);
      throw new Error('Failed to download image');
    }
  }

  // Download image from Meta
  async downloadFromMeta(mediaId) {
    try {
      const accessToken = config.whatsapp.meta.accessToken;
      const apiVersion = config.whatsapp.meta.apiVersion;

      // Get media URL
      const mediaInfoUrl = `https://graph.facebook.com/${apiVersion}/${mediaId}`;
      const mediaInfo = await axios.get(mediaInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const mediaUrl = mediaInfo.data.url;

      // Download media
      const response = await axios.get(mediaUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'arraybuffer',
      });

      // Generate filename
      const ext = this.getExtensionFromContentType(mediaInfo.data.mime_type);
      const filename = `${mediaId}-${Date.now()}${ext}`;
      const filepath = path.join(this.uploadsDir, filename);

      // Save file
      await fs.writeFile(filepath, response.data);

      return {
        success: true,
        filename: filename,
        filepath: filepath,
        url: `/uploads/giftcards/${filename}`,
        size: response.data.length,
        mimeType: mediaInfo.data.mime_type,
      };
    } catch (error) {
      console.error('Error downloading image from Meta:', error);
      throw new Error('Failed to download image');
    }
  }

  // Download image based on provider
  async downloadImage(mediaUrl, provider, messageId) {
    if (provider === 'twilio') {
      return await this.downloadFromTwilio(mediaUrl, messageId);
    } else if (provider === 'meta') {
      return await this.downloadFromMeta(mediaUrl);
    } else {
      throw new Error('Unsupported provider');
    }
  }

  // Get file extension from MIME type
  getExtensionFromContentType(contentType) {
    const mimeMap = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };
    return mimeMap[contentType] || '.jpg';
  }

  // Delete image
  async deleteImage(filename) {
    try {
      const filepath = path.join(this.uploadsDir, filename);
      await fs.unlink(filepath);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  // Get image info
  async getImageInfo(filename) {
    try {
      const filepath = path.join(this.uploadsDir, filename);
      const stats = await fs.stat(filepath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
      };
    } catch (error) {
      return { exists: false };
    }
  }
}

module.exports = new ImageService();

