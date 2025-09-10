import {defineType, defineField} from 'sanity'
import {User} from 'lucide-react'

export const agent = defineType({
  name: 'agent',
  title: 'Real Estate Agent',
  type: 'document',
  icon: User,
  groups: [
    {name: 'basic', title: 'Basic Info'},
    {name: 'contact', title: 'Contact'},
    {name: 'professional', title: 'Professional'},
    {name: 'social', title: 'Social Media'},
  ],
  fields: [
    // Basic Information
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'basic',
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      group: 'basic',
    }),

    defineField({
      name: 'photo',
      title: 'Profile Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
      group: 'basic',
    }),

    defineField({
      name: 'bio_en',
      title: 'Bio (English)',
      type: 'text',
      rows: 4,
      group: 'basic',
    }),

    defineField({
      name: 'bio_es',
      title: 'Bio (Spanish)',
      type: 'text',
      rows: 4,
      group: 'basic',
    }),

    // Contact Information
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
      group: 'contact',
    }),

    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'contact',
    }),

    defineField({
      name: 'whatsapp',
      title: 'WhatsApp Number',
      type: 'string',
      description: 'WhatsApp number with country code (e.g., +18291234567)',
      group: 'contact',
    }),

    defineField({
      name: 'officePhone',
      title: 'Office Phone',
      type: 'string',
      group: 'contact',
    }),

    defineField({
      name: 'preferredContact',
      title: 'Preferred Contact Method',
      type: 'string',
      options: {
        list: [
          {title: 'WhatsApp', value: 'whatsapp'},
          {title: 'Phone Call', value: 'phone'},
          {title: 'Email', value: 'email'},
        ],
      },
      initialValue: 'whatsapp',
      group: 'contact',
    }),

    // Professional Information
    defineField({
      name: 'licenseNumber',
      title: 'License Number',
      type: 'string',
      group: 'professional',
    }),

    defineField({
      name: 'yearsExperience',
      title: 'Years of Experience',
      type: 'number',
      validation: (Rule) => Rule.min(0).integer(),
      group: 'professional',
    }),

    defineField({
      name: 'specializations',
      title: 'Specializations',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Luxury Properties', value: 'luxury'},
          {title: 'Vacation Rentals', value: 'vacation'},
          {title: 'Residential Sales', value: 'residential'},
          {title: 'Commercial Properties', value: 'commercial'},
          {title: 'Investment Properties', value: 'investment'},
          {title: 'Beachfront Properties', value: 'beachfront'},
          {title: 'Golf Properties', value: 'golf'},
          {title: 'New Developments', value: 'developments'},
        ],
      },
      group: 'professional',
    }),

    defineField({
      name: 'languages',
      title: 'Languages Spoken',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'English', value: 'en'},
          {title: 'Spanish', value: 'es'},
          {title: 'French', value: 'fr'},
          {title: 'German', value: 'de'},
          {title: 'Italian', value: 'it'},
          {title: 'Portuguese', value: 'pt'},
          {title: 'Russian', value: 'ru'},
        ],
      },
      initialValue: ['en', 'es'],
      group: 'professional',
    }),

    defineField({
      name: 'areas',
      title: 'Service Areas',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'area'}]}],
      description: 'Areas where this agent operates',
      group: 'professional',
    }),

    defineField({
      name: 'certifications',
      title: 'Certifications & Awards',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'issuer',
            title: 'Issuing Organization',
            type: 'string',
          },
          {
            name: 'year',
            title: 'Year',
            type: 'number',
            validation: (Rule) => Rule.min(1900).max(2100),
          },
        ],
      }],
      group: 'professional',
    }),

    // Social Media
    defineField({
      name: 'facebook',
      title: 'Facebook URL',
      type: 'url',
      group: 'social',
    }),

    defineField({
      name: 'instagram',
      title: 'Instagram Handle',
      type: 'string',
      description: 'Username without @',
      group: 'social',
    }),

    defineField({
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
      group: 'social',
    }),

    defineField({
      name: 'website',
      title: 'Personal Website',
      type: 'url',
      group: 'social',
    }),

    // Settings
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this agent is currently active',
      group: 'basic',
    }),

    defineField({
      name: 'featured',
      title: 'Featured Agent',
      type: 'boolean',
      initialValue: false,
      description: 'Show this agent prominently on the website',
      group: 'basic',
    }),

    defineField({
      name: 'responseTime',
      title: 'Average Response Time (hours)',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(72),
      description: 'Average time to respond to inquiries',
      group: 'professional',
    }),

    defineField({
      name: 'commission',
      title: 'Commission Rate (%)',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(100),
      description: 'Standard commission rate (internal use only)',
      hidden: ({currentUser}) => !currentUser?.roles?.find(({name}) => name === 'administrator'),
      group: 'professional',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      media: 'photo',
      active: 'isActive',
      featured: 'featured',
    },
    prepare({title, subtitle, media}) {
      return {
        title: title,
        subtitle: subtitle,
        media,
      }
    },
  },
})