import type {StructureResolver} from 'sanity/structure'

/**
 * Custom Studio navigation. Replaces Sanity's default alphabetical list
 * with a task-oriented grouping that surfaces the most-used document
 * types (Properties, Reviews) at the top and tucks rarely-edited
 * configuration documents away.
 *
 * https://www.sanity.io/docs/structure-builder-cheat-sheet
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // ---------------- Properties ----------------
      S.listItem()
        .title('Properties')
        .icon(() => '🏠')
        .child(
          S.list()
            .title('Properties')
            .items([
              S.listItem()
                .title('All properties')
                .child(
                  S.documentTypeList('property')
                    .title('All properties')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),

              S.listItem()
                .title('Active')
                .child(
                  S.documentList()
                    .title('Active properties')
                    .schemaType('property')
                    .filter('_type == "property" && status == "active"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),

              S.listItem()
                .title('Pending')
                .child(
                  S.documentList()
                    .title('Pending properties')
                    .schemaType('property')
                    .filter('_type == "property" && status == "pending"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),

              S.listItem()
                .title('Featured')
                .child(
                  S.documentList()
                    .title('Featured properties')
                    .schemaType('property')
                    .filter('_type == "property" && isFeatured == true')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),

              S.listItem()
                .title('Awaiting owner completion')
                .child(
                  S.documentList()
                    .title('Awaiting owner completion')
                    .schemaType('property')
                    .filter(
                      '_type == "property" && defined(completionToken) && !defined(completedBy.submittedAt)'
                    )
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),

              S.listItem()
                .title('Recently completed by owner')
                .child(
                  S.documentList()
                    .title('Recently completed by owner')
                    .schemaType('property')
                    .filter(
                      '_type == "property" && defined(completedBy.submittedAt)'
                    )
                    .defaultOrdering([
                      {field: 'completedBy.submittedAt', direction: 'desc'},
                    ])
                ),

              S.listItem()
                .title('Inactive')
                .child(
                  S.documentList()
                    .title('Inactive')
                    .schemaType('property')
                    .filter('_type == "property" && status == "inactive"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),

              S.listItem()
                .title('Sold')
                .child(
                  S.documentList()
                    .title('Sold properties')
                    .schemaType('property')
                    .filter('_type == "property" && status == "sold"')
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                ),
            ])
        ),

      // ---------------- Reviews ----------------
      S.listItem()
        .title('Reviews')
        .icon(() => '⭐')
        .child(
          S.list()
            .title('Reviews')
            .items([
              S.listItem()
                .title('All reviews')
                .child(
                  S.documentTypeList('review')
                    .title('All reviews')
                    .defaultOrdering([{field: 'reviewDate', direction: 'desc'}])
                ),

              S.listItem()
                .title('Published')
                .child(
                  S.documentList()
                    .title('Published reviews')
                    .schemaType('review')
                    .filter('_type == "review" && isPublished == true')
                    .defaultOrdering([{field: 'reviewDate', direction: 'desc'}])
                ),

              S.listItem()
                .title('Featured')
                .child(
                  S.documentList()
                    .title('Featured reviews')
                    .schemaType('review')
                    .filter('_type == "review" && featured == true')
                    .defaultOrdering([{field: 'reviewDate', direction: 'desc'}])
                ),

              S.listItem()
                .title('General (not tied to a property)')
                .child(
                  S.documentList()
                    .title('General reviews')
                    .schemaType('review')
                    .filter('_type == "review" && !defined(property)')
                    .defaultOrdering([{field: 'reviewDate', direction: 'desc'}])
                ),

              S.listItem()
                .title('Drafts / unpublished')
                .child(
                  S.documentList()
                    .title('Unpublished reviews')
                    .schemaType('review')
                    .filter('_type == "review" && isPublished != true')
                    .defaultOrdering([{field: 'reviewDate', direction: 'desc'}])
                ),
            ])
        ),

      // ---------------- Collections ----------------
      S.listItem()
        .title('Collections')
        .icon(() => '📚')
        .schemaType('collection')
        .child(
          S.documentTypeList('collection')
            .title('Collections')
            .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
        ),

      // ---------------- Concierge Services ----------------
      S.listItem()
        .title('Concierge Services')
        .icon(() => '🛎️')
        .schemaType('conciergeService')
        .child(
          S.documentTypeList('conciergeService')
            .title('Concierge Services')
            .defaultOrdering([
              {field: 'category', direction: 'asc'},
              {field: 'order', direction: 'asc'},
            ])
        ),

      S.divider(),

      // ---------------- Local Guide ----------------
      S.listItem()
        .title('Local Guide')
        .icon(() => '🗺️')
        .child(
          S.list()
            .title('Local Guide')
            .items([
              S.documentTypeListItem('area').title('Areas'),
              S.documentTypeListItem('restaurant').title('Restaurants'),
              S.documentTypeListItem('golfCourse').title('Golf Courses'),
              S.documentTypeListItem('leticiaRecommendation').title("Leticia's Recommendations"),
            ])
        ),

      // ---------------- Editorial ----------------
      S.listItem()
        .title('Editorial')
        .icon(() => '📰')
        .child(
          S.list()
            .title('Editorial')
            .items([
              S.documentTypeListItem('infoPage').title('Info Pages'),
              S.documentTypeListItem('featuredMedia').title('Featured Media'),
            ])
        ),

      S.divider(),

      // ---------------- Team ----------------
      S.documentTypeListItem('agent').title('Agents').icon(() => '👤'),

      // ---------------- Site Configuration (singleton) ----------------
      // homepageMediaConfig is a single shared document. We point at a
      // fixed document id so editors land directly on the editor instead
      // of seeing a list with one item and a misleading "+ create" button.
      S.listItem()
        .title('Homepage Media')
        .icon(() => '🏠')
        .id('homepageMediaConfig')
        .child(
          S.document()
            .schemaType('homepageMediaConfig')
            .documentId('homepageMediaConfig')
        ),
    ])
