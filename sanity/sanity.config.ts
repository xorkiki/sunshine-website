import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { portfolioItem } from './schema/portfolioItem';
import { aboutPage } from './schema/aboutPage';

export default defineConfig({
  name: 'sun-zhique-studio',
  title: 'Sunzhique — Studio',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'yy21gxjr',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('About Me')
              .child(
                S.document()
                  .schemaType('aboutPage')
                  .documentId('aboutPage')
              ),
            S.divider(),
            S.listItem()
              .title('Projects')
              .schemaType('portfolioItem')
              .child(S.documentTypeList('portfolioItem').title('Projects')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: [portfolioItem, aboutPage],
  },
});
