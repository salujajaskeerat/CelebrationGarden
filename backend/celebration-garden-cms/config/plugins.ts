export default ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {
          // Enable automatic image optimization
          folder: env('CLOUDINARY_FOLDER', 'celebration-garden'),
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          // Image optimization settings
          transformation: [
            {
              quality: 'auto:good', // Auto quality optimization
              fetch_format: 'auto', // Auto format (WebP when supported)
            },
          ],
          // Enable responsive images
          responsive_breakpoints: {
            create_derived: true,
            bytes_step: 20000,
            min_width: 200,
            max_width: 2000,
            transformation: {
              crop: 'limit',
              quality: 'auto:good',
              fetch_format: 'auto',
            },
          },
        },
        uploadStream: {
          folder: env('CLOUDINARY_FOLDER', 'celebration-garden'),
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          transformation: [
            {
              quality: 'auto:good',
              fetch_format: 'auto',
            },
          ],
        },
        delete: {},
      },
    },
  },
});
