import prisma from '../../config/prisma.instance.js';
import createError from 'http-errors';
import { storeImg, removeImg } from '../../helpers/cloudinary.js';

export default {
  createBlog: async (data) => {
    try {
      //* data create blog
      const blogCreate = {};
      blogCreate.title = data?.title;
      blogCreate.content = data?.content;
      blogCreate.visibility = data?.visibility;
      blogCreate.authorId = data?.userId;
      blogCreate.image = data?.bgColor;
      if (data?.visibility === true) {
        blogCreate.publicDate = new Date();
      }
      //* insert blog
      const blogResult = await prisma.blog.create({ data: blogCreate });

      //* store blog images to cloud
      let imageCreatePromises = [];
      if (data?.images && data.images.length > 0) {
        try {
          for (let img of data.images) {
            let promise = new Promise(async (resolve) => {
              const imgStored = await storeImg(img);
              resolve(imgStored.url);
            });
            imageCreatePromises.push(promise);
          }
          const imgURLs = await Promise.all(imageCreatePromises);

          //* insert blog images
          if (imgURLs.length > 0) {
            const imgBlogCreate = imgURLs.map((url) => ({
              blogId: blogResult.id,
              imageUrl: url,
            }));
            await prisma.blogImage.createMany({ data: imgBlogCreate });
          }
        } catch (err) {
          throw createError.BadRequest('Can not store image to cloudinary.');
        }
      }
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

  deleteBlog: async (id) => {
    try {
      const BASE_CLOUDINARY_URL = 'http://res.cloudinary.com';

      // remove blog image in cloudinary
      const blogExisted = await prisma.blog.findFirst({ where: { id: Number(id) } });
      if (blogExisted?.image && blogExisted.image.includes(BASE_CLOUDINARY_URL));
      {
        removeImg(blogExisted.image);
      }

      //  delete Blog permanent
      await prisma.blog.delete({ where: { id: Number(id) } });
    } catch (err) {
      throw err;
    }
  },

  getAllBlog: async () => {
    const datas = await prisma.blog.findMany({
      where: { visibility: true },
      include: {
        user: {
          select: {
            avatar: true,
            fullName: true,
          },
        },
        BlogImages: {
          select: {
            imageUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return datas;
  },

  getBlogById: async (id) => {
    const data = await prisma.blog.findFirst({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            avatar: true,
            fullName: true,
          },
        },
        BlogImages: {
          select: {
            imageUrl: true,
          },
        },
      },
    });
    return data;
  },

  getBlogWithFilter: async (pageNumber, limit, search, status) => {
    const statusValue = {
      true: true,
      false: false,
    };
    let totalRows;
    const skip = pageNumber && limit ? (Number(pageNumber) - 1) * Number(limit) : undefined;
    const searchCondition = {
      ...(typeof statusValue[status] === 'boolean' ? { visibility: statusValue[status] } : {}),
      OR: [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { title: { contains: search, mode: 'insensitive' } },
      ],
    };

    const data = await prisma.blog.findMany({
      where: { ...searchCondition },
      include: {
        user: {
          select: {
            avatar: true,
            fullName: true,
          },
        },
        BlogImages: {
          select: {
            imageUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: Number(limit),
    });
    totalRows = await prisma.blog.count({
      where: { ...searchCondition },
    });

    return Promise.resolve({ blogs: data, totalPage: Math.ceil(totalRows / limit), currentpage: pageNumber });
  },
};
