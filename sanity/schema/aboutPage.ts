import { defineType, defineField } from 'sanity';

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Me',
  type: 'document',
  // Only one document of this type should exist
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'name',
      title: 'Your Name',
      type: 'string',
      initialValue: 'Sun Zhique',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 8,
      description: 'Your biography. Use blank lines to separate paragraphs.',
    }),
    defineField({
      name: 'clients',
      title: 'Clients',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Add client names one by one. They will appear on the About page.',
    }),
    defineField({
      name: 'headshot',
      title: 'Headshot / Portrait',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'headshot',
    },
  },
});
