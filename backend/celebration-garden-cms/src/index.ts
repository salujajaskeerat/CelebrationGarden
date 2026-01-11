import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Automatically grant public access to home-page
    try {
      const publicRole = await strapi
        .plugin('users-permissions')
        .service('role')
        .findOne({ type: 'public' });

      if (publicRole) {
        const homePagePermissions = [
          {
            action: 'api::home-page.home-page.find',
            role: publicRole.id,
          },
        ];

        // Check if permission already exists
        const existingPermissions = await strapi
          .plugin('users-permissions')
          .service('permission')
          .find({
            where: {
              role: publicRole.id,
              action: 'api::home-page.home-page.find',
            },
          });

        if (existingPermissions.length === 0) {
          await strapi
            .plugin('users-permissions')
            .service('permission')
            .create({
              data: homePagePermissions,
            });
          console.log('✅ Home Page public permissions configured');
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not auto-configure home-page permissions:', error);
      console.log('Please set permissions manually: Settings → Users & Permissions → Roles → Public → Enable "find" for Home Page');
    }
  },
};
