import { defineType, defineField } from 'sanity';

export const portfolioItem = defineType({
  name: 'portfolioItem',
  title: 'Portfolio Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
      description: 'Auto-generated from title. Used in the page URL.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Styling', value: 'styling' },
          { title: 'Photography', value: 'photography' },
          { title: 'Featured (Home)', value: 'featured' },
        ],
        layout: 'grid',
      },
      validation: Rule => Rule.required().min(1),
      description: 'Select one or more categories. Featured items appear on the home page.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Shown in the portfolio grid',
    }),
    defineField({
      name: 'images',
      title: 'Project Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'All images for the fullscreen project page',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      subtitle: 'description',
    },
  },
});
