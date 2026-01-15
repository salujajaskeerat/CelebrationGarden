const cloudinaryProvider = require('@strapi/provider-upload-cloudinary');

function buildRawConfig(config) {
  const rawUpload = {
    ...(config.actionOptions?.upload || {}),
    resource_type: 'raw',
  };

  // Remove image-only options for raw uploads
  delete rawUpload.transformation;
  delete rawUpload.responsive_breakpoints;
  delete rawUpload.fetch_format;
  delete rawUpload.quality;

  const rawUploadStream = {
    ...(config.actionOptions?.uploadStream || {}),
    resource_type: 'raw',
  };

  delete rawUploadStream.transformation;
  delete rawUploadStream.responsive_breakpoints;
  delete rawUploadStream.fetch_format;
  delete rawUploadStream.quality;

  return {
    ...config,
    actionOptions: {
      ...config.actionOptions,
      upload: rawUpload,
      uploadStream: rawUploadStream,
    },
  };
}

module.exports = {
  init(config) {
    const baseProvider = cloudinaryProvider.init(config);

    const rawProvider = cloudinaryProvider.init(buildRawConfig(config));

    function isPdf(file) {
      const mime = file?.mime || file?.type || '';
      const ext = (file?.ext || '').toLowerCase();
      const name = (file?.name || '').toLowerCase();
      return mime.includes('pdf') || ext === '.pdf' || name.endsWith('.pdf');
    }

    return {
      ...baseProvider,
      async upload(file) {
        if (isPdf(file)) {
          return rawProvider.upload(file);
        }
        return baseProvider.upload(file);
      },
      async uploadStream(file) {
        if (isPdf(file)) {
          return rawProvider.uploadStream(file);
        }
        return baseProvider.uploadStream(file);
      },
    };
  },
};
