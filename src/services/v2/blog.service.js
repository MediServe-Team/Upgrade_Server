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

  updateBlog: async (id, data) => {
    try {
      const blogExisted = await prisma.blog.findFirst({ where: { id: Number(id) } });

      //* data update blog
      const blogUpdate = {};
      blogUpdate.title = data?.title ? data.title : blogExisted.title;
      blogUpdate.content = data?.content ? data.content : blogExisted.content;
      blogUpdate.visibility = data?.visibility ? data.visibility : blogExisted.visibility;

      //* store blog image
      if (data?.image) {
        try {
          const imgStored = await storeImg(data.image);
          blogUpdate.image = imgStored.url;
        } catch (err) {
          throw createError.BadRequest('Can not store image to cloudinary.');
        }
      }

      await prisma.blog.update({ where: { id: Number(id) }, data: blogUpdate });
    } catch (err) {
      throw err;
    }
  },
};
