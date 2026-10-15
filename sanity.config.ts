'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'
import {generateCompletionLink} from './sanity/actions/generateCompletionLink'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    visionTool({defaultApiVersion: apiVersion}),
  ],
  document: {
    // Add the "Generate owner link" action to property documents so
    // agents can hand off completion to property owners without giving
    // them Studio access.
    actions: (prev, context) => {
      // Singletons should not be duplicatable.
      if (SINGLETONS.has(context.schemaType)) {
        return prev.filter(
          ({action}) => !DISABLED_SINGLETON_ACTIONS.has(action ?? '')
        )
      }
      if (context.schemaType === 'property') {
        return [...prev, generateCompletionLink]
      }
      return prev
    },
    // Hide singletons from the global "+ Create" menu so editors don't
    // accidentally create duplicates of single-instance config docs.
    newDocumentOptions: (prev) =>
      prev.filter((tpl) => !SINGLETONS.has(tpl.templateId)),
  },
})

// Document types that should only ever have one instance. Pinned to a
// fixed document id in structure.ts; this list also drives the action /
// new-document filters above.
const SINGLETONS = new Set(['homepageMediaConfig'])

// Sanity's built-in actions for documents — we strip the ones that would
// let an editor create or unpublish a singleton.
const DISABLED_SINGLETON_ACTIONS = new Set([
  'duplicate',
  'unpublish',
  'delete',
])
