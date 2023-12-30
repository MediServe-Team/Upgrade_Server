import prisma from '../../config/prisma.instance.js';
import createError from 'http-errors';
import { storeImg } from '../../helpers/cloudinary.js';

export default {
  createBlog: async (data) => {
    try {
      //* data create blog
      const blogCreate = {};
      blogCreate.title = data?.title;
      blogCreate.content = data?.content;
      blogCreate.visibility = data?.visibility;
      blogCreate.authorId = data?.userId;

      //* store blog image
      if (data?.image) {
        try {
          const imgStored = await storeImg(data.image);
          blogCreate.image = imgStored.url;
        } catch (err) {
          throw createError.BadRequest('Can not store image to cloudinary.');
        }
      }

      // create blog
      await prisma.blog.create({ data: blogCreate });
    } catch (err) {
      throw err;
    }
  },
};
